import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { PolicyFormDialog } from '@/components/admin/PolicyFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminPolicies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentManagement.deletePolicy(id);
      toast.success('Policy deleted successfully');
      loadPolicies();
    } catch (error: any) {
      console.error('Error deleting policy:', error);
      toast.error(error.message || 'Failed to delete policy');
    }
  };

  return (
    <>
      <SEOHead title="Admin • Policies" description="Manage policies and terms" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Policies</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Manage Policies</CardTitle>
                          <CardDescription>View and manage policies, terms, and legal documents</CardDescription>
                        </div>
                      </div>
                      <PolicyFormDialog onSuccess={loadPolicies} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading policies...</p>
                    ) : policies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No policies found.</p>
                    ) : (
                       <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {policies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell className="max-w-md truncate">{policy.title_en}</TableCell>
                              <TableCell className="capitalize">{policy.policy_type}</TableCell>
                              <TableCell>{policy.version || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={policy.is_active ? "default" : "secondary"}>
                                  {policy.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <PolicyFormDialog policy={policy} onSuccess={loadPolicies} />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this policy? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(policy.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
