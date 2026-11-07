import { useEffect, useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, Users, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromptRow {
  id: string;
  name_en: string;
  name_ar: string;
  category_en: string;
  category_ar: string;
  copies_count: number;
  is_active: boolean;
}

export default function AdminPromptStats() {
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [visits, setVisits] = useState(0);
  const [visits30d, setVisits30d] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [promptsRes, visitorsRes] = await Promise.all([
          (supabase as any)
            .from('prompts')
            .select('id,name_en,name_ar,category_en,category_ar,copies_count,is_active')
            .order('copies_count', { ascending: false }),
          (supabase as any)
            .from('website_visitors')
            .select('session_id,created_at')
            .ilike('page_url', '%/prompts%')
            .limit(5000),
        ]);

        if (promptsRes.error) throw promptsRes.error;
        setPrompts((promptsRes.data || []) as PromptRow[]);

        const rows = (visitorsRes.data || []) as { session_id: string | null; created_at: string }[];
        setVisits(rows.length);
        setVisits30d(rows.filter((r) => r.created_at >= since).length);
        setUniqueSessions(new Set(rows.map((r) => r.session_id).filter(Boolean)).size);
      } catch (error: any) {
        console.error('Error loading prompt stats:', error);
        toast.error(error.message || 'Failed to load prompt stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalCopies = prompts.reduce((sum, p) => sum + (p.copies_count || 0), 0);
  const maxCopies = Math.max(1, ...prompts.map((p) => p.copies_count || 0));

  const stats = [
    { label: 'Total copies', value: totalCopies, icon: Copy },
    { label: 'Prompts published', value: prompts.filter((p) => p.is_active).length, icon: Sparkles },
    { label: 'Prompt page visits (30 days)', value: visits30d, icon: Eye },
    { label: 'Unique visitors (all time)', value: uniqueSessions, icon: Users },
  ];

  return (
    <>
      <SEOHead title="Admin • Prompt Analytics" description="Most copied prompts and prompt page traffic" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Prompt Analytics</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {stats.map((stat) => (
                        <Card key={stat.label}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                              </div>
                              <stat.icon className="h-8 w-8 text-primary/60" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Most copied prompts</CardTitle>
                        <CardDescription>
                          {visits} total page views recorded for the prompts page
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">#</TableHead>
                              <TableHead>Prompt</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className="w-[220px]">Copies</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prompts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                  No prompts yet.
                                </TableCell>
                              </TableRow>
                            ) : (
                              prompts.map((prompt, index) => (
                                <TableRow key={prompt.id}>
                                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                  <TableCell>
                                    <div className="font-medium">{prompt.name_en}</div>
                                    <div className="text-xs text-muted-foreground" dir="rtl">
                                      {prompt.name_ar}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">{prompt.category_en}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                        <div
                                          className="h-full bg-primary"
                                          style={{ width: `${((prompt.copies_count || 0) / maxCopies) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-semibold tabular-nums">
                                        {prompt.copies_count || 0}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                                      {prompt.is_active ? 'Active' : 'Hidden'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
