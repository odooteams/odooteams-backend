import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { teamQueries } from '@/lib/supabase/queries';
import { TeamMemberFormDialog } from '@/components/admin/TeamMemberFormDialog';

export default function AdminTeamMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
      teamQueries.invalidateCache();
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const moveMember = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= members.length || reordering) return;

    const next = [...members];
    [next[index], next[target]] = [next[target], next[index]];
    setMembers(next);
    setReordering(true);

    try {
      const updates = next.map((m, i) =>
        supabase.from('team_members').update({ sort_order: i + 1 }).eq('id', m.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      teamQueries.invalidateCache();
      toast.success('Order updated');
      loadMembers();
    } catch (error) {
      console.error('Error reordering members:', error);
      toast.error('Failed to update order');
      loadMembers();
    } finally {
      setReordering(false);
    }
  };


  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated');
      loadMembers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Team member deleted');
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete team member');
    }
  };

  return (
    <>
      <SEOHead title="Admin • Team Members" description="Manage team members" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Team Members</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Team Members</CardTitle>
                          <CardDescription>Manage your team members</CardDescription>
                        </div>
                      </div>
                      <TeamMemberFormDialog onSuccess={loadMembers} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading team members...</p>
                    ) : members.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No team members found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Photo</TableHead>
                            <TableHead>Name (EN)</TableHead>
                            <TableHead>Name (AR)</TableHead>
                            <TableHead>Position (EN)</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member, index) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.image} alt={member.name_en} />
                                  <AvatarFallback>{member.name_en?.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">{member.name_en}</TableCell>
                              <TableCell>{member.name_ar}</TableCell>
                              <TableCell>{member.position_en}</TableCell>
                              <TableCell>{member.email || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={member.is_active ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => toggleActive(member.id, member.is_active)}
                                >
                                  {member.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className="w-6 text-sm text-muted-foreground">{member.sort_order}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    disabled={index === 0 || reordering}
                                    onClick={() => moveMember(index, -1)}
                                    aria-label="Move up"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    disabled={index === members.length - 1 || reordering}
                                    onClick={() => moveMember(index, 1)}
                                    aria-label="Move down"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <TeamMemberFormDialog member={member} onSuccess={loadMembers} />
                                  <Button size="sm" variant="ghost" onClick={() => deleteMember(member.id)}>
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
    </>
  );
}
