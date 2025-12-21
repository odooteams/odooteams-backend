import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, Search, RefreshCw, User, Calendar, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: unknown;
  new_values: unknown;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
}

export default function AuditLogs() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user emails for the logs
      const userIds = [...new Set((data || []).map(log => log.user_id).filter(Boolean))];
      
      let userEmails: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        
        userEmails = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p.email || 'Unknown';
          return acc;
        }, {} as Record<string, string>);
      }

      const logsWithEmails = (data || []).map(log => ({
        ...log,
        user_email: log.user_id ? userEmails[log.user_id] || 'Unknown' : 'System',
      }));

      setLogs(logsWithEmails);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('delete')) return 'destructive';
    if (action.includes('create') || action.includes('insert')) return 'default';
    if (action.includes('update')) return 'secondary';
    return 'outline';
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead title="Audit Logs - Admin" description="View system audit logs" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    {t('Audit Logs', 'سجلات التدقيق')}
                  </h1>
                </div>
                <Button onClick={loadLogs} variant="outline" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('Refresh', 'تحديث')}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('Activity Log', 'سجل النشاط')}
                  </CardTitle>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('Search logs...', 'البحث في السجلات...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('Loading...', 'جاري التحميل...')}
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('No audit logs found', 'لم يتم العثور على سجلات')}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('Time', 'الوقت')}</TableHead>
                            <TableHead>{t('User', 'المستخدم')}</TableHead>
                            <TableHead>{t('Action', 'الإجراء')}</TableHead>
                            <TableHead>{t('Entity Type', 'نوع الكيان')}</TableHead>
                            <TableHead>{t('Details', 'التفاصيل')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLogs.map(log => (
                            <TableRow key={log.id}>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate max-w-[150px]">{log.user_email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getActionBadgeVariant(log.action)}>
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{log.entity_type}</Badge>
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                {log.entity_id && (
                                  <span className="text-xs text-muted-foreground truncate block">
                                    ID: {log.entity_id.substring(0, 8)}...
                                  </span>
                                )}
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
      </SidebarProvider>
    </>
  );
}
