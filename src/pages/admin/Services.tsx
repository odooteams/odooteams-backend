import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { ServiceFormDialog } from '@/components/admin/ServiceFormDialog';
import { ExcelImportExport } from '@/components/admin/ExcelImportExport';
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

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentManagement.deleteService(id);
      toast.success('Service deleted successfully');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Failed to update service status');
    }
  };

  return (
    <>
      <SEOHead title="Admin • Services" description="Create and manage services" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Services</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Manage Services</CardTitle>
                          <CardDescription>View and manage all services</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ExcelImportExport type="services" data={services} onImportComplete={loadServices} />
                        <ServiceFormDialog onSuccess={loadServices} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading services...</p>
                    ) : services.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No services found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {services.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell>
                                {service.image ? (
                                  <img src={service.image} alt={service.title_en} className="h-10 w-14 rounded object-cover" />
                                ) : (
                                  <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                )}
                              </TableCell>
                              <TableCell>{service.title_en}</TableCell>
                              <TableCell>{service.category_en}</TableCell>
                              <TableCell>
                                <Badge variant={service.is_active ? "default" : "secondary"}>
                                  {service.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {service.is_featured && <Badge>Featured</Badge>}
                              </TableCell>
                              <TableCell>{new Date(service.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  <Switch 
                                    checked={service.is_active}
                                    onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
                                    aria-label="Toggle active status"
                                  />
                                  <ServiceFormDialog service={service} onSuccess={loadServices} />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this service? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(service.id)}>
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
