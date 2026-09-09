import { useEffect, useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Users, Copy, Globe, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DayPoint {
  date: string;
  visits: number;
}

interface TopRow {
  label: string;
  count: number;
}

export default function AdminTraffic() {
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [pageViews, setPageViews] = useState(0);
  const [totalCopies, setTotalCopies] = useState(0);
  const [byDay, setByDay] = useState<DayPoint[]>([]);
  const [topPages, setTopPages] = useState<TopRow[]>([]);
  const [topPrompts, setTopPrompts] = useState<TopRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

        const [visitorsRes, viewsRes, promptsRes] = await Promise.all([
          supabase
            .from('website_visitors')
            .select('session_id, page_url, created_at')
            .gte('created_at', since)
            .limit(5000),
          supabase
            .from('page_views')
            .select('page_path, created_at')
            .gte('created_at', since)
            .limit(5000),
          (supabase as any)
            .from('prompts')
            .select('name_en, copies_count')
            .order('copies_count', { ascending: false })
            .limit(10),
        ]);

        if (visitorsRes.error) throw visitorsRes.error;
        if (viewsRes.error) throw viewsRes.error;
        if (promptsRes.error) throw promptsRes.error;

        const visitors = (visitorsRes.data || []) as {
          session_id: string | null;
          page_url: string;
          created_at: string;
        }[];
        const views = (viewsRes.data || []) as { page_path: string; created_at: string }[];
        const prompts = (promptsRes.data || []) as { name_en: string; copies_count: number }[];

        setVisits(visitors.length);
        setUniqueVisitors(new Set(visitors.map((v) => v.session_id).filter(Boolean)).size);
        setPageViews(views.length);
        setTotalCopies(prompts.reduce((sum, p) => sum + (p.copies_count || 0), 0));
        setTopPrompts(prompts.map((p) => ({ label: p.name_en, count: p.copies_count || 0 })));

        // Visits per day
        const dayMap = new Map<string, number>();
        for (let i = parseInt(days) - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          dayMap.set(d, 0);
        }
        visitors.forEach((v) => {
          const d = v.created_at.slice(0, 10);
          if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) || 0) + 1);
        });
        setByDay(Array.from(dayMap.entries()).map(([date, count]) => ({ date, visits: count })));

        // Top pages (visitors + page views combined)
        const pageMap = new Map<string, number>();
        const add = (path: string) => {
          const clean = (path || '/').split('?')[0];
          pageMap.set(clean, (pageMap.get(clean) || 0) + 1);
        };
        visitors.forEach((v) => add(v.page_url));
        views.forEach((v) => add(v.page_path));
        setTopPages(
          Array.from(pageMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([label, count]) => ({ label, count }))
        );
      } catch (error: any) {
        console.error('Error loading traffic:', error);
        toast.error(error.message || 'Failed to load traffic data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [days]);

  const cards = [
    { label: 'Visits', value: visits, icon: Globe, hint: `Last ${days} days` },
    { label: 'Unique visitors', value: uniqueVisitors, icon: Users, hint: 'Distinct sessions' },
    { label: 'Page views', value: pageViews, icon: Eye, hint: `Last ${days} days` },
    { label: 'Copied prompts', value: totalCopies, icon: Copy, hint: 'All time' },
  ];

  return (
    <>
      <SEOHead title="Admin • Traffic" description="Visitors, page views and copied prompts" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 border-b flex items-center justify-between gap-3 px-4 md:px-6 bg-background">
              <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger />
                <h1 className="text-xl md:text-2xl font-bold truncate">Traffic Dashboard</h1>
              </div>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {cards.map((card) => (
                        <Card key={card.label}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                <p className="text-3xl font-bold">{card.value}</p>
                                <p className="text-xs text-muted-foreground">{card.hint}</p>
                              </div>
                              <card.icon className="h-7 w-7 text-primary/60 shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Visits over time</CardTitle>
                        <CardDescription>Daily visits in the selected period</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={byDay}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="visits"
                              stroke="hsl(var(--primary))"
                              fill="hsl(var(--primary))"
                              fillOpacity={0.15}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top pages</CardTitle>
                          <CardDescription>Most visited pages</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Page</TableHead>
                                <TableHead className="text-right">Views</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {topPages.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                    No traffic recorded yet.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                topPages.map((row) => (
                                  <TableRow key={row.label}>
                                    <TableCell className="font-medium break-all">{row.label}</TableCell>
                                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Most copied prompts</CardTitle>
                          <CardDescription>All-time copy counts</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Prompt</TableHead>
                                <TableHead className="text-right">Copies</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {topPrompts.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                    No prompts yet.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                topPrompts.map((row) => (
                                  <TableRow key={row.label}>
                                    <TableCell className="font-medium">{row.label}</TableCell>
                                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
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
