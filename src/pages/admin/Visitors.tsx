import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Users, 
  Eye, 
  TrendingUp,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VisitorService } from '@/backend/services/visitor.service';
import { toast } from 'sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  newVisitors: number;
  previousTotalVisitors: number;
  browserStats: Array<{ name: string; count: number }>;
  osStats: Array<{ name: string; count: number }>;
  deviceStats: Array<{ name: string; count: number }>;
  countryStats: Array<{ name: string; count: number }>;
  visitorsByDay: Array<{ date: string; count: number }>;
  recentVisitors: Array<any>;
}

interface Filters {
  dateRange: string;
  browser: string;
  device: string;
  country: string;
  search: string;
}

const CHART_COLORS = ['hsl(var(--primary))', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

const ITEMS_PER_PAGE = 75;

export default function AdminVisitors() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    dateRange: '30',
    browser: 'all',
    device: 'all',
    country: 'all',
    search: ''
  });

  useEffect(() => {
    loadVisitorStats();
  }, [filters.dateRange]);

  const loadVisitorStats = async () => {
    try {
      setLoading(true);
      const { stats, error } = await VisitorService.getVisitorStats(parseInt(filters.dateRange));
      
      if (error) throw error;
      setStats(stats);
    } catch (error) {
      console.error('Error loading visitor stats:', error);
      toast.error('Failed to load visitor statistics');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const calculateChange = (current: number, previous: number) => {
    const change = VisitorService.calculatePercentageChange(current, previous);
    return {
      value: `${change > 0 ? '+' : ''}${change}%`,
      isPositive: change >= 0
    };
  };

  const filteredVisitors = stats?.recentVisitors?.filter(visitor => {
    if (filters.browser !== 'all' && visitor.browser_name !== filters.browser) return false;
    if (filters.device !== 'all' && visitor.device_type !== filters.device) return false;
    if (filters.country !== 'all' && visitor.country !== filters.country) return false;
    if (filters.search && !visitor.page_url?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredVisitors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVisitors = filteredVisitors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.browser, filters.device, filters.country, filters.search]);

  const uniqueBrowsers = [...new Set(stats?.recentVisitors?.map(v => v.browser_name).filter(Boolean))];
  const uniqueDevices = [...new Set(stats?.recentVisitors?.map(v => v.device_type).filter(Boolean))];
  const uniqueCountries = [...new Set(stats?.recentVisitors?.map(v => v.country).filter(Boolean))];

  const chartConfig = {
    visitors: { label: "Visitors", color: "hsl(var(--primary))" },
  };

  const clearFilters = () => {
    setFilters({
      dateRange: filters.dateRange,
      browser: 'all',
      device: 'all',
      country: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.browser !== 'all' || filters.device !== 'all' || filters.country !== 'all' || filters.search;

  return (
    <>
      <SEOHead title="Admin • Visitors" description="View website visitor analytics" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-4">Website Visitors</h1>
              </div>
              <div className="flex items-center gap-3">
                <Select value={filters.dateRange} onValueChange={(v) => setFilters(f => ({ ...f, dateRange: v }))}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={loadVisitorStats} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? '...' : stats?.totalVisitors?.toLocaleString() || 0}
                      </div>
                      {stats && (
                        <p className={`text-xs ${calculateChange(stats.totalVisitors, stats.previousTotalVisitors).isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {calculateChange(stats.totalVisitors, stats.previousTotalVisitors).value} from previous period
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? '...' : stats?.uniqueVisitors?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Unique sessions in period</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? '...' : stats?.newVisitors?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">First-time visitors</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Daily Visitors</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? '...' : Math.round((stats?.totalVisitors || 0) / parseInt(filters.dateRange))}
                      </div>
                      <p className="text-xs text-muted-foreground">Per day average</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Visitors Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Visitors Trend</CardTitle>
                      <CardDescription>Daily visitor count over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      ) : stats?.visitorsByDay && stats.visitorsByDay.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                          <AreaChart data={stats.visitorsByDay}>
                            <defs>
                              <linearGradient id="fillVisitorsPage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="hsl(var(--primary))"
                              fill="url(#fillVisitorsPage)"
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

                  {/* Device Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Device Distribution</CardTitle>
                      <CardDescription>Visitors by device type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      ) : stats?.deviceStats && stats.deviceStats.length > 0 ? (
                        <div className="flex items-center justify-around h-[250px]">
                          <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                            <PieChart>
                              <Pie
                                data={stats.deviceStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="count"
                                nameKey="name"
                              >
                                {stats.deviceStats.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                          </ChartContainer>
                          <div className="space-y-2">
                            {stats.deviceStats.map((device, index) => {
                              const Icon = getDeviceIcon(device.name);
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                  <Icon className="h-4 w-4" />
                                  <span className="text-sm capitalize">{device.name}: {device.count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="h-[250px] flex items-center justify-center">
                          <p className="text-muted-foreground">No device data yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Browser & OS Stats */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Browser Usage</CardTitle>
                      <CardDescription>Top browsers used by visitors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <p className="text-muted-foreground">Loading...</p>
                      ) : stats?.browserStats && stats.browserStats.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <BarChart data={stats.browserStats.slice(0, 5)} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              tick={{ fontSize: 12 }} 
                              tickLine={false} 
                              axisLine={false} 
                              width={80}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="visitors" />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-muted-foreground">No browser data yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Operating Systems</CardTitle>
                      <CardDescription>Top OS used by visitors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <p className="text-muted-foreground">Loading...</p>
                      ) : stats?.osStats && stats.osStats.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <BarChart data={stats.osStats.slice(0, 5)} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              tick={{ fontSize: 12 }} 
                              tickLine={false} 
                              axisLine={false} 
                              width={80}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} name="visitors" />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-muted-foreground">No OS data yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Visitors Table with Filters */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle>Recent Visitors</CardTitle>
                        <CardDescription>Detailed visitor log with filtering</CardDescription>
                      </div>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="h-4 w-4 mr-1" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by page URL..."
                          value={filters.search}
                          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                          className="pl-9"
                        />
                      </div>
                      
                      <Select value={filters.browser} onValueChange={(v) => setFilters(f => ({ ...f, browser: v }))}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Browser" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          <SelectItem value="all">All Browsers</SelectItem>
                          {uniqueBrowsers.map(browser => (
                            <SelectItem key={browser} value={browser}>{browser}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filters.device} onValueChange={(v) => setFilters(f => ({ ...f, device: v }))}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Device" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          <SelectItem value="all">All Devices</SelectItem>
                          {uniqueDevices.map(device => (
                            <SelectItem key={device} value={device} className="capitalize">{device}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {uniqueCountries.length > 0 && (
                        <Select value={filters.country} onValueChange={(v) => setFilters(f => ({ ...f, country: v }))}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Country" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            <SelectItem value="all">All Countries</SelectItem>
                            {uniqueCountries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-muted-foreground">Loading visitors...</p>
                    ) : filteredVisitors.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Page URL</TableHead>
                              <TableHead>Browser</TableHead>
                              <TableHead>OS</TableHead>
                              <TableHead>Device</TableHead>
                              <TableHead>Referrer</TableHead>
                              <TableHead>Date & Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedVisitors.map((visitor, index) => {
                              const Icon = getDeviceIcon(visitor.device_type);
                              return (
                                <TableRow key={startIndex + index}>
                                  <TableCell className="font-medium max-w-[250px] truncate">
                                    {visitor.page_url}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{visitor.browser_name || 'Unknown'}</Badge>
                                  </TableCell>
                                  <TableCell>{visitor.os_name || 'Unknown'}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Icon className="h-4 w-4" />
                                      <span className="capitalize">{visitor.device_type || 'desktop'}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-[150px] truncate text-muted-foreground">
                                    {visitor.referrer_url || '-'}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {new Date(visitor.created_at).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        
                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredVisitors.length)} of {filteredVisitors.length} visitors
                          </p>
                          
                          {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  let pageNum: number;
                                  if (totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                  } else {
                                    pageNum = currentPage - 2 + i;
                                  }
                                  
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={currentPage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      className="w-9"
                                      onClick={() => setCurrentPage(pageNum)}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                                
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                  <>
                                    <span className="px-1 text-muted-foreground">...</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-9"
                                      onClick={() => setCurrentPage(totalPages)}
                                    >
                                      {totalPages}
                                    </Button>
                                  </>
                                )}
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {hasActiveFilters ? 'No visitors match your filters.' : 'No visitor data yet. Visitors will appear here once tracking begins.'}
                      </p>
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
