import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tables to backup
const BACKUP_TABLES = [
  'services',
  'projects',
  'learn_resources',
  'faqs',
  'chatbot_responses',
  'team_members',
  'contact_submissions',
  'testimonials',
  'timeline_events',
  'blogs',
  'policies',
  'site_settings',
  'profiles',
  'user_roles',
  'user_permissions',
  'page_views',
  'website_visitors',
  'audit_logs',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // AuthN/AuthZ: only accept calls bearing the service role key (used by the
    // internal pg_cron job) or a signed-in admin user JWT.
    const authHeader = req.headers.get('Authorization') || ''
    const bearer = authHeader.replace(/^Bearer\s+/i, '').trim()
    let authorized = false
    if (bearer && bearer === supabaseServiceKey) {
      authorized = true
    } else if (bearer) {
      const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
      const { data: u } = await userClient.auth.getUser(bearer)
      if (u?.user) {
        const admin = createClient(supabaseUrl, supabaseServiceKey)
        const { data: roleRow } = await admin
          .from('user_roles')
          .select('role')
          .eq('user_id', u.user.id)
          .eq('role', 'admin')
          .maybeSingle()
        if (roleRow) authorized = true
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create admin client for database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body for schedule type
    let scheduleType = 'daily'
    try {
      const body = await req.json()
      scheduleType = body.scheduleType || 'daily'
    } catch {
      // Default to daily if no body provided
    }

    const backupName = `Scheduled ${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Backup - ${new Date().toISOString().split('T')[0]}`
    
    console.log(`Starting scheduled ${scheduleType} backup: ${backupName}`)

    // Create backup record
    const { data: backupRecord, error: insertError } = await adminClient
      .from('backups')
      .insert({
        name: backupName,
        description: `Automatic ${scheduleType} backup created by scheduled job`,
        backup_type: 'full',
        status: 'in_progress',
        started_at: new Date().toISOString(),
        tables_included: BACKUP_TABLES,
        created_by: null, // System-generated
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create backup record:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create backup record', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const backupId = backupRecord.id
    console.log(`Created backup record: ${backupId}`)

    // Collect data from all tables
    const backupData: Record<string, unknown[]> = {}
    const recordsCounts: Record<string, number> = {}
    const errors: string[] = []

    for (const table of BACKUP_TABLES) {
      try {
        console.log(`Backing up table: ${table}`)
        const { data, error } = await adminClient
          .from(table)
          .select('*')
          .limit(10000)

        if (error) {
          console.error(`Error backing up ${table}:`, error)
          errors.push(`${table}: ${error.message}`)
        } else {
          backupData[table] = data || []
          recordsCounts[table] = data?.length || 0
          console.log(`Backed up ${recordsCounts[table]} records from ${table}`)
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`Exception backing up ${table}:`, err)
        errors.push(`${table}: ${errorMsg}`)
      }
    }

    // Create backup file
    const backupContent = JSON.stringify({
      metadata: {
        created_at: new Date().toISOString(),
        schedule_type: scheduleType,
        tables: BACKUP_TABLES,
        records_count: recordsCounts,
        total_records: Object.values(recordsCounts).reduce((a, b) => a + b, 0),
      },
      data: backupData
    }, null, 2)

    const backupBlob = new Blob([backupContent], { type: 'application/json' })
    const fileName = `scheduled_${scheduleType}_${backupId}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`

    // Upload to storage
    const { error: uploadError } = await adminClient.storage
      .from('backups')
      .upload(fileName, backupBlob, {
        contentType: 'application/json',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      await adminClient
        .from('backups')
        .update({ 
          status: 'failed',
          error_message: `Upload failed: ${uploadError.message}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', backupId)

      return new Response(
        JSON.stringify({ error: 'Failed to upload backup file', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get signed URL for download
    const { data: urlData } = await adminClient.storage
      .from('backups')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days

    // Update backup record with success
    await adminClient
      .from('backups')
      .update({ 
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        file_url: urlData?.signedUrl || fileName,
        file_size: backupBlob.size,
        records_count: recordsCounts,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        completed_at: new Date().toISOString()
      })
      .eq('id', backupId)

    // Clean up old scheduled backups (keep last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: oldBackups } = await adminClient
      .from('backups')
      .select('id, file_url, name')
      .like('name', 'Scheduled%')
      .lt('created_at', thirtyDaysAgo.toISOString())

    if (oldBackups && oldBackups.length > 0) {
      console.log(`Cleaning up ${oldBackups.length} old scheduled backups`)
      
      for (const oldBackup of oldBackups) {
        // Delete from storage
        if (oldBackup.file_url) {
          const oldFileName = oldBackup.file_url.split('/').pop()?.split('?')[0]
          if (oldFileName) {
            await adminClient.storage.from('backups').remove([oldFileName])
          }
        }
        // Delete record
        await adminClient.from('backups').delete().eq('id', oldBackup.id)
      }
    }

    console.log(`Scheduled backup ${backupId} completed successfully`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        backupId,
        fileName,
        fileSize: backupBlob.size,
        recordsCounts,
        totalRecords: Object.values(recordsCounts).reduce((a, b) => a + b, 0),
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Scheduled backup error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
