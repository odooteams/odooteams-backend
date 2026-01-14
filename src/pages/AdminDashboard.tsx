import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsService } from '@/backend/services/analytics.service';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalServices: number;
  totalProjects: number;
  totalMessages: number;
  totalFaqs: number;
  totalUsers: number;
  totalPageViews: number;
  viewsByDay: Array<{ date: string; count: number }>;
  topPages: Array<{ page: string; count: number }>;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

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
      
      // Fetch counts from all tables in parallel
      const [
        servicesRes,
        projectsRes,
        messagesRes,
        faqsRes,
        usersRes,
        analyticsRes
      ] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        AnalyticsService.getStatistics(30)
      ]);

      setStats({
        totalServices: servicesRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalFaqs: faqsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalPageViews: analyticsRes.stats?.totalViews || 0,
        viewsByDay: analyticsRes.stats?.viewsByDay || [],
        topPages: analyticsRes.stats?.topPages || []
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

  const statCards = [
    {
      title: 'Total Services',
      value: stats?.totalServices || 0,
      icon: Briefcase,
      change: '+12%',
      trend: 'up',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FileText,
      change: '+8%',
      trend: 'up',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Messages',
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      change: '+24%',
      trend: 'up',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: '+5%',
      trend: 'up',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Page Views',
      value: stats?.totalPageViews || 0,
      icon: Eye,
      change: '+18%',
      trend: 'up',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'FAQs',
      value: stats?.totalFaqs || 0,
      icon: HelpCircle,
      change: '+2%',
      trend: 'up',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  ];

  const chartConfig = {
    views: {
      label: "Page Views",
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
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Admin'}!</h2>
                    <p className="text-muted-foreground">Here's what's happening with your website today.</p>
                  </div>
                  <Button onClick={() => navigate('/admin/analytics')} className="w-fit">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </div>

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
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                            {stat.change}
                          </span>
                          <span className="text-muted-foreground ml-1">vs last month</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Page Views Chart */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Page Views Trend</CardTitle>
                      <CardDescription>Daily page views over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading chart...</p>
                        </div>
                      ) : stats?.viewsByDay && stats.viewsByDay.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                          <AreaChart data={stats.viewsByDay}>
                            <defs>
                              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
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
                              fill="url(#fillViews)"
                              strokeWidth={2}
                              name="views"
                            />
                          </AreaChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">No data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top Pages Chart */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Top Pages</CardTitle>
                      <CardDescription>Most visited pages this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading chart...</p>
                        </div>
                      ) : stats?.topPages && stats.topPages.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                          <BarChart data={stats.topPages.slice(0, 5)} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis 
                              dataKey="page" 
                              type="category" 
                              tick={{ fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              width={100}
                              tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar 
                              dataKey="count" 
                              fill="hsl(var(--primary))" 
                              radius={[0, 4, 4, 0]}
                              name="views"
                            />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">No data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions & Recent Activity */}
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
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              <span className="text-sm">Services: {stats?.totalServices || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-secondary" />
                              <span className="text-sm">Projects: {stats?.totalProjects || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-accent" />
                              <span className="text-sm">FAQs: {stats?.totalFaqs || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-muted" />
                              <span className="text-sm">Messages: {stats?.totalMessages || 0}</span>
                            </div>
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
