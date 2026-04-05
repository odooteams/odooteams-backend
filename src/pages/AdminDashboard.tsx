import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Users, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  HelpCircle,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Sparkles,
  Clock,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { VisitorService } from '@/backend/services/visitor.service';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalServices: number;
  previousServices: number;
  totalProjects: number;
  previousProjects: number;
  totalMessages: number;
  previousMessages: number;
  totalFaqs: number;
  previousFaqs: number;
  totalUsers: number;
  previousUsers: number;
  totalVisitors: number;
  previousVisitors: number;
  visitorsByDay: Array<{ date: string; count: number }>;
  browserStats: Array<{ name: string; count: number }>;
  deviceStats: Array<{ name: string; count: number }>;
  recentVisitors: Array<any>;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#22c55e', '#f97316'];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      // Fetch current and previous period counts in parallel
      const [
        currentServicesRes,
        previousServicesRes,
        currentProjectsRes,
        previousProjectsRes,
        currentMessagesRes,
        previousMessagesRes,
        currentFaqsRes,
        currentUsersRes,
        previousUsersRes,
        visitorStatsRes
      ] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo.toISOString()),
        VisitorService.getVisitorStats(30)
      ]);

      setStats({
        totalServices: currentServicesRes.count || 0,
        previousServices: previousServicesRes.count || 0,
        totalProjects: currentProjectsRes.count || 0,
        previousProjects: previousProjectsRes.count || 0,
        totalMessages: currentMessagesRes.count || 0,
        previousMessages: previousMessagesRes.count || 0,
        totalFaqs: currentFaqsRes.count || 0,
        previousFaqs: 0,
        totalUsers: currentUsersRes.count || 0,
        previousUsers: previousUsersRes.count || 0,
        totalVisitors: visitorStatsRes.stats?.totalVisitors || 0,
        previousVisitors: visitorStatsRes.stats?.previousTotalVisitors || 0,
        visitorsByDay: visitorStatsRes.stats?.visitorsByDay || [],
        browserStats: visitorStatsRes.stats?.browserStats || [],
        deviceStats: visitorStatsRes.stats?.deviceStats || [],
        recentVisitors: visitorStatsRes.stats?.recentVisitors || []
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateChange = (current: number, previous: number): { value: string; trend: 'up' | 'down' | 'neutral' } => {
    const change = VisitorService.calculatePercentageChange(current, previous);
    if (change === 0) return { value: '0%', trend: 'neutral' };
    return {
      value: `${change > 0 ? '+' : ''}${change}%`,
      trend: change > 0 ? 'up' : 'down'
    };
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const statCards = [
    {
      title: 'Total Visitors',
      value: stats?.totalVisitors || 0,
      icon: Globe,
      ...calculateChange(stats?.totalVisitors || 0, stats?.previousVisitors || 0),
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Total Services',
      value: stats?.totalServices || 0,
      icon: Briefcase,
      ...calculateChange(stats?.totalServices || 0, stats?.previousServices || 0),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FileText,
      ...calculateChange(stats?.totalProjects || 0, stats?.previousProjects || 0),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Messages',
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      ...calculateChange(stats?.totalMessages || 0, stats?.previousMessages || 0),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      ...calculateChange(stats?.totalUsers || 0, stats?.previousUsers || 0),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'FAQs',
      value: stats?.totalFaqs || 0,
      icon: HelpCircle,
      value2: stats?.totalFaqs || 0,
      trend: 'neutral' as const,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  ];

  const chartConfig = {
    visitors: {
      label: "Visitors",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <>
      <SEOHead 
        title="Admin Dashboard"
        description="Manage your website content and users"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-muted/30">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-4">Dashboard Overview</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-primary">
                    <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                      {getInitials(user?.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Banner */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <CardContent className="relative p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="hidden md:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                          <Sparkles className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Admin'}!
                          </h2>
                          <p className="text-primary-foreground/80 mt-1">
                            Here's what's happening with your website today.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-primary-foreground/70">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>All systems operational</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/admin/analytics')} 
                        variant="secondary"
                        className="w-fit shadow-md"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {statCards.map((stat, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {loading ? '...' : stat.value.toLocaleString()}
                        </div>
                        <div className="flex items-center text-xs mt-1">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                          ) : stat.trend === 'down' ? (
                            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                          ) : null}
                          <span className={stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
                            {stat.value2 ? '-' : stat.value}
                          </span>
                          <span className="text-muted-foreground ml-1">vs last 30 days</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Visitors Trend Chart */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Visitors Trend</CardTitle>
                      <CardDescription>Daily visitors over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading chart...</p>
                        </div>
                      ) : stats?.visitorsByDay && stats.visitorsByDay.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                          <AreaChart data={stats.visitorsByDay}>
                            <defs>
                              <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <ChartTooltip 
                              content={<ChartTooltipContent />}
                              labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="hsl(var(--primary))"
                              fill="url(#fillVisitors)"
                              strokeWidth={2}
                              name="visitors"
                            />
                          </AreaChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">No visitor data yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Browser & Device Stats */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Visitor Analytics</CardTitle>
                      <CardDescription>Browser and device distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading chart...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 h-[250px]">
                          {/* Browser Stats */}
                          <div>
                            <h4 className="text-sm font-medium mb-3">Browsers</h4>
                            {stats?.browserStats && stats.browserStats.length > 0 ? (
                              <div className="space-y-2">
                                {stats.browserStats.slice(0, 4).map((browser, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{browser.name}</span>
                                    <Badge variant="secondary">{browser.count}</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No data</p>
                            )}
                          </div>
                          {/* Device Stats */}
                          <div>
                            <h4 className="text-sm font-medium mb-3">Devices</h4>
                            {stats?.deviceStats && stats.deviceStats.length > 0 ? (
                              <div className="space-y-2">
                                {stats.deviceStats.map((device, idx) => {
                                  const Icon = getDeviceIcon(device.name);
                                  return (
                                    <div key={idx} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground capitalize">{device.name}</span>
                                      </div>
                                      <Badge variant="secondary">{device.count}</Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No data</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>



                {/* Quick Actions & Content Distribution */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Quick Actions */}
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common admin tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => navigate('/admin/services')}
                      >
                        <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                        Manage Services
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => navigate('/admin/projects')}
                      >
                        <FileText className="h-4 w-4 mr-2 text-purple-500" />
                        Manage Projects
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => navigate('/admin/messages')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2 text-orange-500" />
                        View Messages
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => navigate('/admin/users')}
                      >
                        <Users className="h-4 w-4 mr-2 text-green-500" />
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Content Distribution */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Content Distribution</CardTitle>
                      <CardDescription>Overview of your content across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-around h-[200px]">
                          <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Services', value: stats?.totalServices || 0 },
                                  { name: 'Projects', value: stats?.totalProjects || 0 },
                                  { name: 'FAQs', value: stats?.totalFaqs || 0 },
                                  { name: 'Messages', value: stats?.totalMessages || 0 }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {[0, 1, 2, 3].map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                          </ChartContainer>
                          <div className="space-y-2">
                            {[
                              { name: 'Services', value: stats?.totalServices || 0, color: CHART_COLORS[0] },
                              { name: 'Projects', value: stats?.totalProjects || 0, color: CHART_COLORS[1] },
                              { name: 'FAQs', value: stats?.totalFaqs || 0, color: CHART_COLORS[2] },
                              { name: 'Messages', value: stats?.totalMessages || 0, color: CHART_COLORS[3] }
                            ].map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm">{item.name}: {item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
