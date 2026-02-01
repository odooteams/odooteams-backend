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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Create client with user's auth for validation
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user and check admin role
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

    // Create admin client for database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user is admin
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single()

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { backupId, tables = BACKUP_TABLES } = await req.json()

    if (!backupId) {
      return new Response(
        JSON.stringify({ error: 'backupId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting backup ${backupId} for tables:`, tables)

    // Update backup status to in_progress
    await adminClient
      .from('backups')
      .update({ 
        status: 'in_progress', 
        started_at: new Date().toISOString(),
        tables_included: tables
      })
      .eq('id', backupId)

    // Collect data from all tables
    const backupData: Record<string, unknown[]> = {}
    const recordsCounts: Record<string, number> = {}
    const errors: string[] = []

    for (const table of tables) {
      try {
        console.log(`Backing up table: ${table}`)
        const { data, error } = await adminClient
          .from(table)
          .select('*')
          .limit(10000) // Safety limit per table

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
        created_by: userId,
        tables: tables,
        records_count: recordsCounts,
        total_records: Object.values(recordsCounts).reduce((a, b) => a + b, 0),
      },
      data: backupData
    }, null, 2)

    const backupBlob = new Blob([backupContent], { type: 'application/json' })
    const fileName = `backup_${backupId}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
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

    console.log(`Backup ${backupId} completed successfully`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        backupId,
        fileName,
        fileSize: backupBlob.size,
        recordsCounts,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
