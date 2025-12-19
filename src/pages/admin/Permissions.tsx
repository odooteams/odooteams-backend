import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Save, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface Permission {
  id?: string;
  user_id: string;
  page_name: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const ADMIN_PAGES = [
  { value: 'services', label: 'Services' },
  { value: 'projects', label: 'Projects' },
  { value: 'resources', label: 'Resources' },
  { value: 'faqs', label: 'FAQs' },
  { value: 'blogs', label: 'Blogs' },
  { value: 'team', label: 'Team Members' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'messages', label: 'Messages' },
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'policies', label: 'Policies' },
  { value: 'settings', label: 'Settings' },
  { value: 'analytics', label: 'Analytics' },
];

export default function AdminPermissions() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadPermissions(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      // Get all non-admin users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) throw profilesError;

      // Get admin user IDs
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;

      const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);
      
      // Filter out admins
      const nonAdminUsers = (profiles || []).filter(p => !adminIds.has(p.id));
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(t('Failed to load users', 'فشل في تحميل المستخدمين'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Create permissions for all pages, using existing ones or defaults
      const allPermissions: Permission[] = ADMIN_PAGES.map(page => {
        const existing = data?.find(p => p.page_name === page.value);
        return existing || {
          user_id: userId,
          page_name: page.value,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      });
      
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error(t('Failed to load permissions', 'فشل في تحميل الصلاحيات'));
    }
  };

  const updatePermission = (pageName: string, field: keyof Permission, value: boolean) => {
    setPermissions(prev => prev.map(p => 
      p.page_name === pageName ? { ...p, [field]: value } : p
    ));
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    
    setIsSaving(true);
    try {
      // Delete existing permissions for this user
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', selectedUser);

      // Insert new permissions (only those with at least one true value)
      const permissionsToSave = permissions.filter(
        p => p.can_view || p.can_add || p.can_edit || p.can_delete
      ).map(p => ({
        user_id: selectedUser,
        page_name: p.page_name,
        can_view: p.can_view,
        can_add: p.can_add,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
      }));

      if (permissionsToSave.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionsToSave);
        
        if (error) throw error;
      }

      toast.success(t('Permissions saved successfully', 'تم حفظ الصلاحيات بنجاح'));
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error(t('Failed to save permissions', 'فشل في حفظ الصلاحيات'));
    } finally {
      setIsSaving(false);
    }
  };

  const grantAllPermissions = () => {
    setPermissions(prev => prev.map(p => ({
      ...p,
      can_view: true,
      can_add: true,
      can_edit: true,
      can_delete: true,
    })));
  };

  const revokeAllPermissions = () => {
    setPermissions(prev => prev.map(p => ({
      ...p,
      can_view: false,
      can_add: false,
      can_edit: false,
      can_delete: false,
    })));
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <>
      <SEOHead title="User Permissions - Admin" description="Manage user permissions" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  {t('User Permissions', 'صلاحيات المستخدمين')}
                </h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('Select User', 'اختر المستخدم')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-full md:w-[400px]">
                      <SelectValue placeholder={t('Select a user to manage permissions', 'اختر مستخدم لإدارة الصلاحيات')} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email || 'Unknown User'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {users.length === 0 && !isLoading && (
                    <p className="text-muted-foreground mt-4">
                      {t('No non-admin users found', 'لا يوجد مستخدمين غير مديرين')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {selectedUser && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle>
                          {t('Permissions for', 'صلاحيات')}: {selectedUserData?.full_name || selectedUserData?.email}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedUserData?.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={grantAllPermissions}>
                          <Plus className="h-4 w-4 mr-1" />
                          {t('Grant All', 'منح الكل')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={revokeAllPermissions}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('Revoke All', 'إلغاء الكل')}
                        </Button>
                        <Button onClick={savePermissions} disabled={isSaving}>
                          <Save className="h-4 w-4 mr-1" />
                          {isSaving ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">{t('Page', 'الصفحة')}</TableHead>
                            <TableHead className="text-center">{t('View', 'عرض')}</TableHead>
                            <TableHead className="text-center">{t('Add', 'إضافة')}</TableHead>
                            <TableHead className="text-center">{t('Edit', 'تعديل')}</TableHead>
                            <TableHead className="text-center">{t('Delete', 'حذف')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {permissions.map(permission => {
                            const page = ADMIN_PAGES.find(p => p.value === permission.page_name);
                            return (
                              <TableRow key={permission.page_name}>
                                <TableCell>
                                  <Badge variant="outline">{page?.label || permission.page_name}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={permission.can_view}
                                    onCheckedChange={(checked) => updatePermission(permission.page_name, 'can_view', checked)}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={permission.can_add}
                                    onCheckedChange={(checked) => updatePermission(permission.page_name, 'can_add', checked)}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={permission.can_edit}
                                    onCheckedChange={(checked) => updatePermission(permission.page_name, 'can_edit', checked)}
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={permission.can_delete}
                                    onCheckedChange={(checked) => updatePermission(permission.page_name, 'can_delete', checked)}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}