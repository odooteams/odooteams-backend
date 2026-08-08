import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { PartnerFormDialog } from '@/components/admin/PartnerFormDialog';
import { Partner } from '@/lib/supabase/types';
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

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('partners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPartners((data as Partner[]) || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentManagement.deletePartner(id);
      toast.success('Partner deleted successfully');
      loadPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Failed to delete partner');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('partners')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      toast.success(`Partner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadPartners();
    } catch (error) {
      console.error('Error toggling partner status:', error);
      toast.error('Failed to update partner status');
    }
  };

  return (
    <>
      <SEOHead title="Admin • Partners" description="Manage our partners" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Partners</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-5xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Manage Partners</CardTitle>
                          <CardDescription>Add, edit, and manage company partners</CardDescription>
                        </div>
                      </div>
                      <PartnerFormDialog onSuccess={loadPartners} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading partners...</p>
                    ) : partners.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No partners found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {partners.map((partner) => (
                            <TableRow key={partner.id}>
                              <TableCell>
                                {partner.logo_url ? (
                                  <img src={partner.logo_url} alt={partner.name_en} className="h-10 w-auto max-w-[80px] object-contain" />
                                ) : (
                                  <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{partner.name_en}</div>
                                <div className="text-xs text-muted-foreground">{partner.name_ar}</div>
                              </TableCell>
                              <TableCell>
                                {partner.website_url ? (
                                  <a href={partner.website_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                                    <Globe className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-xs">None</span>
                                )}
                              </TableCell>
                              <TableCell>{partner.sort_order}</TableCell>
                              <TableCell>
                                <Badge variant={partner.is_active ? "default" : "secondary"}>
                                  {partner.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  <Switch 
                                    checked={partner.is_active}
                                    onCheckedChange={() => handleToggleActive(partner.id, partner.is_active)}
                                    aria-label="Toggle active status"
                                  />
                                  <PartnerFormDialog partner={partner} onSuccess={loadPartners} />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Partner</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {partner.name_en}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(partner.id)}>
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
