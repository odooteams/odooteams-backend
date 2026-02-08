import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tables that can be restored (in order to handle dependencies)
const RESTORE_ORDER = [
  'site_settings',
  'policies',
  'team_members',
  'services',
  'projects',
  'learn_resources',
  'faqs',
  'chatbot_responses',
  'testimonials',
  'timeline_events',
  'blogs',
]

// Tables that should NOT be restored (sensitive data)
const EXCLUDED_TABLES = [
  'profiles',
  'user_roles',
  'user_permissions',
  'contact_submissions',
  'page_views',
  'website_visitors',
  'audit_logs',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

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

    const { backupId, tables, mode = 'merge' } = await req.json()

    if (!backupId) {
      return new Response(
        JSON.stringify({ error: 'backupId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting restore from backup ${backupId}, mode: ${mode}, tables:`, tables)

    // Get backup record
    const { data: backup, error: backupError } = await adminClient
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single()

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the backup file from storage
    let backupContent: string

    if (backup.file_url?.startsWith('http')) {
      // It's a signed URL, fetch directly
      const response = await fetch(backup.file_url)
      if (!response.ok) {
        // Try to get a new signed URL
        const fileName = backup.file_url.split('/').pop()?.split('?')[0]
        if (fileName) {
          const { data: fileData, error: downloadError } = await adminClient.storage
            .from('backups')
            .download(fileName)
          
          if (downloadError || !fileData) {
            return new Response(
              JSON.stringify({ error: 'Failed to download backup file' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          backupContent = await fileData.text()
        } else {
          return new Response(
            JSON.stringify({ error: 'Invalid backup file URL' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        backupContent = await response.text()
      }
    } else {
      // It's a file path, download from storage
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from('backups')
        .download(backup.file_url)
      
      if (downloadError || !fileData) {
        return new Response(
          JSON.stringify({ error: 'Failed to download backup file', details: downloadError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      backupContent = await fileData.text()
    }

    // Parse backup data
    let backupData: { metadata: Record<string, unknown>, data: Record<string, unknown[]> }
    try {
      backupData = JSON.parse(backupContent)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid backup file format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!backupData.data || typeof backupData.data !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Backup file missing data section' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine which tables to restore
    const tablesToRestore = tables && tables.length > 0 
      ? tables.filter((t: string) => !EXCLUDED_TABLES.includes(t))
      : RESTORE_ORDER.filter(t => backupData.data[t])

    console.log('Tables to restore:', tablesToRestore)

    const results: Record<string, { success: boolean, inserted: number, error?: string }> = {}
    const errors: string[] = []

    for (const table of tablesToRestore) {
      const tableData = backupData.data[table]
      if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        results[table] = { success: true, inserted: 0 }
        continue
      }

      try {
        console.log(`Restoring ${tableData.length} records to ${table}`)

        if (mode === 'replace') {
          // Delete all existing data first
          const { error: deleteError } = await adminClient
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

          if (deleteError) {
            console.error(`Error clearing ${table}:`, deleteError)
            errors.push(`${table}: Failed to clear - ${deleteError.message}`)
            results[table] = { success: false, inserted: 0, error: deleteError.message }
            continue
          }
        }

        // Remove timestamps that will be auto-generated
        const cleanedData = tableData.map((record: Record<string, unknown>) => {
          const cleaned = { ...record }
          // Keep id but remove auto-generated timestamps for merge mode
          if (mode === 'merge') {
            delete cleaned.created_at
            delete cleaned.updated_at
          }
          return cleaned
        })

        // Upsert data (insert or update on conflict)
        const { error: insertError, count } = await adminClient
          .from(table)
          .upsert(cleanedData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })

        if (insertError) {
          console.error(`Error restoring ${table}:`, insertError)
          errors.push(`${table}: ${insertError.message}`)
          results[table] = { success: false, inserted: 0, error: insertError.message }
        } else {
          results[table] = { success: true, inserted: tableData.length }
          console.log(`Restored ${tableData.length} records to ${table}`)
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`Exception restoring ${table}:`, err)
        errors.push(`${table}: ${errorMsg}`)
        results[table] = { success: false, inserted: 0, error: errorMsg }
      }
    }

    // Log the restore action
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      action: 'restore',
      entity_type: 'backup',
      entity_id: backupId,
      new_values: {
        mode,
        tables: tablesToRestore,
        results
      }
    })

    const successCount = Object.values(results).filter(r => r.success).length
    const totalInserted = Object.values(results).reduce((acc, r) => acc + r.inserted, 0)

    console.log(`Restore completed. ${successCount}/${tablesToRestore.length} tables, ${totalInserted} records`)

    return new Response(
      JSON.stringify({ 
        success: errors.length === 0,
        message: errors.length === 0 
          ? `Successfully restored ${totalInserted} records across ${successCount} tables`
          : `Restore completed with ${errors.length} errors`,
        results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Restore error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
