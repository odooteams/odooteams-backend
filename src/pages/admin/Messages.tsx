import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Eye, Trash2, Search, Mail, Phone, Building, Calendar, User, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Notify client of status change
      const target = messages.find(m => m.id === id) || selectedMessage;
      if (target?.email) {
        const isAr = /[\u0600-\u06FF]/.test(`${target.message || ''} ${target.subject || ''}`);
        supabase.functions.invoke('send-notification-email', {
          body: {
            kind: 'status_update',
            lang: isAr ? 'ar' : 'en',
            data: { name: target.full_name, email: target.email, status, notes: target.notes },
          },
        }).catch((e) => console.error('status notify failed:', e));
      }

      toast.success('Status updated');
      loadMessages();
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const saveNotes = async () => {
    if (!selectedMessage) return;
    
    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ notes })
        .eq('id', selectedMessage.id);

      if (error) throw error;
      toast.success('Notes saved');
      loadMessages();
      setSelectedMessage(prev => prev ? { ...prev, notes } : null);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Message deleted');
      loadMessages();
      if (selectedMessage?.id === id) {
        setViewDialogOpen(false);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const openViewDialog = (message: ContactSubmission) => {
    setSelectedMessage(message);
    setNotes(message.notes || '');
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'default';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status || 'New';
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const messageCounts = {
    all: messages.length,
    new: messages.filter(m => m.status === 'new' || !m.status).length,
    in_progress: messages.filter(m => m.status === 'in_progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
  };

  return (
    <>
      <SEOHead title="Admin • Messages" description="Manage contact submissions" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Messages</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{messageCounts.all}</div>
                      <div className="text-sm text-muted-foreground">Total Messages</div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('new')}>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{messageCounts.new}</div>
                      <div className="text-sm text-muted-foreground">New</div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('in_progress')}>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-600">{messageCounts.in_progress}</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('resolved')}>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{messageCounts.resolved}</div>
                      <div className="text-sm text-muted-foreground">Resolved</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Contact Submissions</CardTitle>
                          <CardDescription>Manage and respond to contact form submissions</CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={loadMessages} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {loading ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Loading messages...</p>
                    ) : filteredMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No messages found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="hidden md:table-cell">Subject</TableHead>
                              <TableHead className="hidden lg:table-cell">Message</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="hidden sm:table-cell">Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMessages.map((msg) => (
                              <TableRow key={msg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openViewDialog(msg)}>
                                <TableCell className="font-medium">{msg.full_name}</TableCell>
                                <TableCell className="max-w-[150px] truncate">{msg.email}</TableCell>
                                <TableCell className="hidden md:table-cell">{msg.subject || 'N/A'}</TableCell>
                                <TableCell className="hidden lg:table-cell max-w-xs truncate">{msg.message}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusColor(msg.status)}>{getStatusLabel(msg.status)}</Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button size="sm" variant="ghost" onClick={() => openViewDialog(msg)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this message from {msg.full_name}? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteMessage(msg.id)} className="bg-destructive hover:bg-destructive/90">
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View and manage this contact submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div className="font-medium">{selectedMessage.full_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <a href={`mailto:${selectedMessage.email}`} className="font-medium text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <a href={`tel:${selectedMessage.phone}`} className="font-medium text-primary hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  </div>
                )}
                {selectedMessage.company && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Company</div>
                      <div className="font-medium">{selectedMessage.company}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Received</div>
                    <div className="font-medium">{new Date(selectedMessage.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="mt-1 font-medium">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <Label className="text-muted-foreground">Message</Label>
                <div className="mt-1 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-2 flex gap-2">
                  <Button 
                    size="sm" 
                    variant={selectedMessage.status === 'new' || !selectedMessage.status ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedMessage.id, 'new')}
                  >
                    New
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMessage.status === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedMessage.id, 'in_progress')}
                  >
                    In Progress
                  </Button>
                  <Button 
                    size="sm" 
                    variant={selectedMessage.status === 'resolved' ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedMessage.id, 'resolved')}
                  >
                    Resolved
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-muted-foreground">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this message..."
                  className="mt-2"
                  rows={3}
                />
                <Button 
                  size="sm" 
                  className="mt-2" 
                  onClick={saveNotes}
                  disabled={isSavingNotes || notes === (selectedMessage.notes || '')}
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>

              {/* Quick Actions */}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" asChild>
                  <a href={`mailto:${selectedMessage.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
                {selectedMessage.phone && (
                  <Button variant="outline" asChild>
                    <a href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}