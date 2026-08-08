import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Eye, Users, TrendingUp } from 'lucide-react';
import { AnalyticsService } from '@/backend/services/analytics.service';
import { toast } from 'sonner';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { stats, error } = await AnalyticsService.getStatistics(parseInt(days));
      
      if (error) throw error;
      setStats(stats);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Admin • Analytics" description="View analytics and metrics" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-4">Analytics</h1>
              </div>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                {loading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Loading analytics...</p>
                    </CardContent>
                  </Card>
                ) : stats ? (
                  <>
                    {/* Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.totalViews}</div>
                          <p className="text-xs text-muted-foreground">
                            Last {days} days
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Unique Pages</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stats.uniquePages}</div>
                          <p className="text-xs text-muted-foreground">
                            Different pages viewed
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg. Views/Day</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {Math.round(stats.totalViews / parseInt(days))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Daily average
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Pages */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                        <CardDescription>Most viewed pages in the selected period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Page Path</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.topPages.map((page: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{page.page}</TableCell>
                                <TableCell className="text-right">{page.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Views by Day */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Views by Day</CardTitle>
                        <CardDescription>Daily page view trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.viewsByDay.map((day: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {new Date(day.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">{day.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">No analytics data available.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
