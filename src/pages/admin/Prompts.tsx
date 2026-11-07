import { useEffect, useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Trash2, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PromptFormDialog, type PromptItem } from '@/components/admin/PromptFormDialog';

export default function AdminPrompts() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('prompts')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPrompts((data || []) as PromptItem[]);
    } catch (error: any) {
      console.error('Error loading prompts:', error);
      toast.error(error.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from('prompts').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Prompt deleted');
    loadPrompts();
  };

  const handleToggleActive = async (prompt: PromptItem) => {
    const { error } = await (supabase as any)
      .from('prompts')
      .update({ is_active: !prompt.is_active })
      .eq('id', prompt.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPrompts((prev) =>
      prev.map((p) => (p.id === prompt.id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  return (
    <SidebarProvider>
      <SEOHead title="Al Prompts | Admin" description="Manage the public prompts library." />
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="flex items-center gap-3 mb-6">
            <SidebarTrigger />
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Al Prompts</h1>
            <div className="ms-auto">
              <PromptFormDialog onSuccess={loadPrompts} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prompts ({prompts.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : prompts.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No prompts yet. Add your first one.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-end">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prompts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {p.image ? (
                            <img src={p.image} alt={p.name_en} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{p.name_en}</div>
                          <div className="text-xs text-muted-foreground" dir="rtl">{p.name_ar}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{p.category_en}</Badge>
                          <div className="text-xs text-muted-foreground mt-1" dir="rtl">{p.category_ar}</div>
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <p className="text-xs text-muted-foreground line-clamp-2">{p.prompt_text}</p>
                        </TableCell>
                        <TableCell>{p.copies_count || 0}</TableCell>
                        <TableCell>{p.sort_order}</TableCell>
                        <TableCell>
                          <Switch checked={p.is_active} onCheckedChange={() => handleToggleActive(p)} />
                        </TableCell>
                        <TableCell className="text-end whitespace-nowrap">
                          <PromptFormDialog prompt={p} onSuccess={loadPrompts} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{p.name_en}" from the public prompts page.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}
