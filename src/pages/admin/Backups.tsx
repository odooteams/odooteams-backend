import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Database,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Archive,
  FileJson,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Backup {
  id: string;
  name: string;
  description: string | null;
  backup_type: string;
  file_url: string | null;
  file_size: number | null;
  tables_included: string[];
  records_count: Record<string, number>;
  status: string;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

const AVAILABLE_TABLES = [
  { name: 'services', label: 'Services', category: 'Content' },
  { name: 'projects', label: 'Projects', category: 'Content' },
  { name: 'learn_resources', label: 'Learn Resources', category: 'Content' },
  { name: 'faqs', label: 'FAQs', category: 'Content' },
  { name: 'chatbot_responses', label: 'Chatbot Responses', category: 'Content' },
  { name: 'team_members', label: 'Team Members', category: 'Content' },
  { name: 'testimonials', label: 'Testimonials', category: 'Content' },
  { name: 'timeline_events', label: 'Timeline Events', category: 'Content' },
  { name: 'blogs', label: 'Blogs', category: 'Content' },
  { name: 'policies', label: 'Policies', category: 'Content' },
  { name: 'site_settings', label: 'Site Settings', category: 'Settings' },
  { name: 'profiles', label: 'User Profiles', category: 'Users' },
  { name: 'user_roles', label: 'User Roles', category: 'Users' },
  { name: 'user_permissions', label: 'User Permissions', category: 'Users' },
  { name: 'contact_submissions', label: 'Contact Submissions', category: 'Data' },
  { name: 'page_views', label: 'Page Views', category: 'Analytics' },
  { name: 'website_visitors', label: 'Website Visitors', category: 'Analytics' },
  { name: 'audit_logs', label: 'Audit Logs', category: 'System' },
];

export default function AdminBackups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>(AVAILABLE_TABLES.map(t => t.name));
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [restoreTables, setRestoreTables] = useState<string[]>([]);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data as Backup[] || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!backupName.trim()) {
      toast.error('Please enter a backup name');
      return;
    }

    if (selectedTables.length === 0) {
      toast.error('Please select at least one table');
      return;
    }

    try {
      setCreating(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create backup record
      const { data: backupRecord, error: insertError } = await supabase
        .from('backups')
        .insert({
          name: backupName.trim(),
          description: backupDescription.trim() || null,
          backup_type: selectedTables.length === AVAILABLE_TABLES.length ? 'full' : 'partial',
          status: 'pending',
          created_by: user.id,
          tables_included: selectedTables,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Trigger edge function
      const { error: fnError } = await supabase.functions.invoke('create-backup', {
        body: { 
          backupId: backupRecord.id,
          tables: selectedTables
        }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        toast.error('Backup started but may have issues');
      } else {
        toast.success('Backup started successfully');
      }

      setShowCreateDialog(false);
      setBackupName('');
      setBackupDescription('');
      setSelectedTables(AVAILABLE_TABLES.map(t => t.name));
      
      // Reload after a short delay
      setTimeout(loadBackups, 2000);

    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast.error(error.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = async () => {
    if (!selectedBackup) return;

    try {
      // Delete from storage if file exists
      if (selectedBackup.file_url) {
        const fileName = selectedBackup.file_url.split('/').pop()?.split('?')[0];
        if (fileName) {
          await supabase.storage.from('backups').remove([fileName]);
        }
      }

      // Delete record
      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', selectedBackup.id);

      if (error) throw error;

      toast.success('Backup deleted');
      setShowDeleteDialog(false);
      setSelectedBackup(null);
      loadBackups();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      toast.error(error.message || 'Failed to delete backup');
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      setRestoring(true);

      const { error: fnError, data } = await supabase.functions.invoke('restore-backup', {
        body: { 
          backupId: selectedBackup.id,
          tables: restoreTables.length > 0 ? restoreTables : undefined,
          mode: restoreMode
        }
      });

      if (fnError) {
        console.error('Restore error:', fnError);
        toast.error('Restore failed: ' + fnError.message);
        return;
      }

      if (data?.success) {
        toast.success(data.message || 'Restore completed successfully');
      } else {
        toast.warning(data?.message || 'Restore completed with some issues');
      }

      setShowRestoreDialog(false);
      setSelectedBackup(null);
      setRestoreTables([]);
      setRestoreMode('merge');

    } catch (error: any) {
      console.error('Error restoring backup:', error);
      toast.error(error.message || 'Failed to restore backup');
    } finally {
      setRestoring(false);
    }
  };

  const openRestoreDialog = (backup: Backup) => {
    setSelectedBackup(backup);
    // Pre-select restorable tables from the backup
    const restorableTables = (backup.tables_included || []).filter(
      t => !['profiles', 'user_roles', 'user_permissions', 'contact_submissions', 'page_views', 'website_visitors', 'audit_logs'].includes(t)
    );
    setRestoreTables(restorableTables);
    setRestoreMode('merge');
    setShowRestoreDialog(true);
  };

  const downloadBackup = async (backup: Backup) => {
    if (!backup.file_url) {
      toast.error('No file available for download');
      return;
    }

    try {
      // If it's a signed URL, open directly
      if (backup.file_url.startsWith('http')) {
        window.open(backup.file_url, '_blank');
      } else {
        // Generate signed URL
        const { data, error } = await supabase.storage
          .from('backups')
          .createSignedUrl(backup.file_url, 3600);

        if (error) throw error;
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast.error('Failed to download backup');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'completed_with_errors':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary/15 text-primary border-primary/20"><Loader2 className="w-3 h-3 mr-1 animate-spin" />In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getTotalRecords = (counts: Record<string, number>) => {
    return Object.values(counts || {}).reduce((a, b) => a + b, 0);
  };

  const groupedTables = AVAILABLE_TABLES.reduce((acc, table) => {
    if (!acc[table.category]) acc[table.category] = [];
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_TABLES>);

  const toggleCategory = (category: string, checked: boolean) => {
    const categoryTables = groupedTables[category].map(t => t.name);
    if (checked) {
      setSelectedTables(prev => [...new Set([...prev, ...categoryTables])]);
    } else {
      setSelectedTables(prev => prev.filter(t => !categoryTables.includes(t)));
    }
  };

  const isCategoryChecked = (category: string) => {
    return groupedTables[category].every(t => selectedTables.includes(t.name));
  };

  return (
    <>
      <SEOHead title="Admin • Backups" description="Manage database backups" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-4">Backup Management</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={loadBackups} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{backups.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {backups.filter(b => b.status === 'completed' || b.status === 'completed_with_errors').length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatFileSize(backups.reduce((acc, b) => acc + (b.file_size || 0), 0))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">
                        {backups[0]?.completed_at 
                          ? format(new Date(backups[0].completed_at), 'MMM d, yyyy HH:mm')
                          : 'Never'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Backups Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Backup History</CardTitle>
                    <CardDescription>All database backups with download and restore options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : backups.length === 0 ? (
                      <div className="text-center py-12">
                        <FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No backups yet. Create your first backup to get started.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Tables</TableHead>
                              <TableHead>Records</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {backups.map((backup) => (
                              <TableRow key={backup.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{backup.name}</p>
                                    {backup.description && (
                                      <p className="text-xs text-muted-foreground">{backup.description}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {backup.backup_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(backup.status)}</TableCell>
                                <TableCell>{backup.tables_included?.length || 0}</TableCell>
                                <TableCell>{getTotalRecords(backup.records_count).toLocaleString()}</TableCell>
                                <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {format(new Date(backup.created_at), 'MMM d, yyyy HH:mm')}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {backup.file_url && backup.status !== 'pending' && backup.status !== 'in_progress' && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => downloadBackup(backup)}
                                          title="Download"
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => openRestoreDialog(backup)}
                                          title="Restore"
                                        >
                                          <RotateCcw className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedBackup(backup);
                                        setShowDeleteDialog(true);
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Backup</DialogTitle>
            <DialogDescription>
              Select the tables you want to include in this backup
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Backup Name *</Label>
              <Input
                id="name"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="e.g., Weekly Backup - January 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tables to Backup</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTables(AVAILABLE_TABLES.map(t => t.name))}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTables([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {Object.entries(groupedTables).map(([category, tables]) => (
                  <div key={category} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={isCategoryChecked(category)}
                        onCheckedChange={(checked) => toggleCategory(category, !!checked)}
                      />
                      <span className="font-medium text-sm">{category}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      {tables.map((table) => (
                        <div key={table.name} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedTables.includes(table.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTables(prev => [...prev, table.name]);
                              } else {
                                setSelectedTables(prev => prev.filter(t => t !== table.name));
                              }
                            }}
                          />
                          <span className="text-sm">{table.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createBackup} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBackup?.name}"? This action cannot be undone
              and the backup file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBackup} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Backup Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Restore Backup
            </DialogTitle>
            <DialogDescription>
              Restore data from "{selectedBackup?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400">Warning</p>
                <p className="text-muted-foreground mt-1">
                  Restoring data will modify your current database. Some tables like user profiles, 
                  roles, permissions, and analytics data are excluded for security reasons.
                </p>
              </div>
            </div>

            {/* Restore Mode */}
            <div className="space-y-3">
              <Label>Restore Mode</Label>
              <RadioGroup value={restoreMode} onValueChange={(v) => setRestoreMode(v as 'merge' | 'replace')}>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <RadioGroupItem value="merge" id="merge" className="mt-1" />
                  <div>
                    <Label htmlFor="merge" className="font-medium cursor-pointer">Merge (Recommended)</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates existing records and adds new ones. Preserves data not in the backup.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <RadioGroupItem value="replace" id="replace" className="mt-1" />
                  <div>
                    <Label htmlFor="replace" className="font-medium cursor-pointer">Replace</Label>
                    <p className="text-sm text-muted-foreground">
                      Deletes all existing data in selected tables before restoring. Use with caution.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Tables to Restore */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tables to Restore</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const restorableTables = (selectedBackup?.tables_included || []).filter(
                        t => !['profiles', 'user_roles', 'user_permissions', 'contact_submissions', 'page_views', 'website_visitors', 'audit_logs'].includes(t)
                      );
                      setRestoreTables(restorableTables);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRestoreTables([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                {(selectedBackup?.tables_included || []).map((table) => {
                  const isExcluded = ['profiles', 'user_roles', 'user_permissions', 'contact_submissions', 'page_views', 'website_visitors', 'audit_logs'].includes(table);
                  const tableInfo = AVAILABLE_TABLES.find(t => t.name === table);
                  return (
                    <div key={table} className="flex items-center gap-2">
                      <Checkbox
                        checked={restoreTables.includes(table)}
                        disabled={isExcluded}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRestoreTables(prev => [...prev, table]);
                          } else {
                            setRestoreTables(prev => prev.filter(t => t !== table));
                          }
                        }}
                      />
                      <span className={`text-sm ${isExcluded ? 'text-muted-foreground line-through' : ''}`}>
                        {tableInfo?.label || table}
                        {isExcluded && <span className="text-xs ml-1">(protected)</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Backup Info */}
            {selectedBackup && (
              <div className="text-sm text-muted-foreground border-t pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>Created: {format(new Date(selectedBackup.created_at), 'MMM d, yyyy HH:mm')}</div>
                  <div>Size: {formatFileSize(selectedBackup.file_size)}</div>
                  <div>Total Records: {getTotalRecords(selectedBackup.records_count).toLocaleString()}</div>
                  <div>Tables: {selectedBackup.tables_included?.length || 0}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={restoreBackup} 
              disabled={restoring || restoreTables.length === 0}
              variant={restoreMode === 'replace' ? 'destructive' : 'default'}
            >
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore {restoreTables.length} Table{restoreTables.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
