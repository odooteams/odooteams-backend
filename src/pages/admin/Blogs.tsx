import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileEdit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExcelImportExport } from '@/components/admin/ExcelImportExport';
import { BlogFormDialog } from '@/components/admin/BlogFormDialog';
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
export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_published: !current })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Blog ${!current ? 'published' : 'unpublished'} successfully`);
      loadBlogs();
    } catch (error) {
      console.error('Toggle publish error:', error);
      toast.error('Failed to update publish status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Blog deleted successfully');
      loadBlogs();
    } catch (error) {
      console.error('Delete blog error:', error);
      toast.error('Failed to delete blog');
    }
  };
  return (
    <>
      <SEOHead title="Admin • Blogs" description="Manage blog posts" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Blogs</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileEdit className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle>Manage Blogs</CardTitle>
                          <CardDescription>View and manage blog posts</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ExcelImportExport type="blogs" data={blogs} onImportComplete={loadBlogs} />
                        <BlogFormDialog onSuccess={loadBlogs} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading blogs...</p>
                    ) : blogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No blogs found.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {blogs.map((blog) => (
                            <TableRow key={blog.id}>
                              <TableCell>
                                {blog.image ? (
                                  <img src={blog.image} alt={blog.title_en} className="h-10 w-14 rounded object-cover" />
                                ) : (
                                  <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                )}
                              </TableCell>
                              <TableCell className="max-w-md truncate">{blog.title_en}</TableCell>
                              <TableCell>{blog.category_en || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={blog.is_published ? 'default' : 'secondary'}>
                                  {blog.is_published ? 'Published' : 'Draft'}
                                </Badge>
                              </TableCell>
                              <TableCell>{blog.views_count || 0}</TableCell>
                              <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <BlogFormDialog blog={blog} onSuccess={loadBlogs} />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTogglePublish(blog.id, blog.is_published)}
                                  >
                                    {blog.is_published ? 'Unpublish' : 'Publish'}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Blog</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this blog? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(blog.id)}>
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
