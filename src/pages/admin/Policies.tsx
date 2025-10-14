import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  return (
    <>
      <SEOHead title="Admin • Policies" description="Manage policies and terms" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
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
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>Manage Policies</CardTitle>
                        <CardDescription>View and manage policies, terms, and legal documents</CardDescription>
                      </div>
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
