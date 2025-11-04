import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminChatbot() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_responses')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error loading chatbot responses:', error);
      toast.error('Failed to load chatbot responses');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('chatbot_responses')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated');
      loadResponses();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteResponse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot response?')) return;
    
    try {
      const { error } = await supabase
        .from('chatbot_responses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Chatbot response deleted');
      loadResponses();
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('Failed to delete chatbot response');
    }
  };

  return (
    <>
      <SEOHead title="Admin • Chatbot" description="Manage chatbot responses" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Chatbot Responses</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Chatbot Responses</CardTitle>
                          <CardDescription>Manage automated chatbot responses and keywords</CardDescription>
                        </div>
                      </div>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Response
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading chatbot responses...</p>
                    ) : responses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No chatbot responses found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Question (EN)</TableHead>
                            <TableHead>Answer (EN)</TableHead>
                            <TableHead>Keywords</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responses.map((response) => (
                            <TableRow key={response.id}>
                              <TableCell className="font-medium max-w-xs truncate">{response.question_en}</TableCell>
                              <TableCell className="max-w-xs truncate">{response.answer_en}</TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap max-w-xs">
                                  {response.keywords?.slice(0, 3).map((keyword: string, idx: number) => (
                                    <Badge key={idx} variant="outline">{keyword}</Badge>
                                  ))}
                                  {response.keywords?.length > 3 && (
                                    <Badge variant="outline">+{response.keywords.length - 3}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{response.usage_count || 0}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={response.is_active ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => toggleActive(response.id, response.is_active)}
                                >
                                  {response.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => deleteResponse(response.id)}>
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
