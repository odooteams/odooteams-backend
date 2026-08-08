import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TimelineFormDialog } from '@/components/admin/TimelineFormDialog';

export default function AdminTimeline() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading timeline events:', error);
      toast.error('Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('timeline_events')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated');
      loadEvents();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timeline event?')) return;
    
    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Timeline event deleted');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete timeline event');
    }
  };

  const handleAdd = () => {
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  return (
    <>
      <SEOHead title="Admin • Timeline" description="Manage timeline events" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Timeline</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Timeline Events</CardTitle>
                          <CardDescription>Manage company timeline and milestones</CardDescription>
                        </div>
                      </div>
                      <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading timeline events...</p>
                    ) : events.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No timeline events found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Title (EN)</TableHead>
                            <TableHead>Title (AR)</TableHead>
                            <TableHead>Description (EN)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {events.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">{event.year}</TableCell>
                              <TableCell>{event.title_en}</TableCell>
                              <TableCell>{event.title_ar}</TableCell>
                              <TableCell className="max-w-xs truncate">{event.description_en}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={event.is_active ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => toggleActive(event.id, event.is_active)}
                                >
                                  {event.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{event.sort_order}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => deleteEvent(event.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
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

      <TimelineFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        onSuccess={loadEvents}
      />
    </>
  );
}
