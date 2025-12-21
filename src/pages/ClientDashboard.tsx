import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Calendar, FileText, MessageSquare, User as UserIcon, Settings, BarChart3, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';
import { usePermissions } from '@/hooks/usePermissions';
import { Badge } from '@/components/ui/badge';

const ADMIN_FEATURES = [
  { page: 'services', label: 'Services', icon: Settings, path: '/admin/services', description: 'Manage services' },
  { page: 'projects', label: 'Projects', icon: FileText, path: '/admin/projects', description: 'Manage projects' },
  { page: 'resources', label: 'Resources', icon: BookOpen, path: '/admin/resources', description: 'Manage learning resources' },
  { page: 'faqs', label: 'FAQs', icon: MessageSquare, path: '/admin/faqs', description: 'Manage FAQs' },
  { page: 'blogs', label: 'Blogs', icon: FileText, path: '/admin/blogs', description: 'Manage blog posts' },
  { page: 'team', label: 'Team Members', icon: Users, path: '/admin/team', description: 'Manage team members' },
  { page: 'testimonials', label: 'Testimonials', icon: MessageSquare, path: '/admin/testimonials', description: 'Manage testimonials' },
  { page: 'messages', label: 'Messages', icon: Mail, path: '/admin/messages', description: 'View contact messages' },
  { page: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics', description: 'View site analytics' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasPermission, getAccessiblePages, isLoading } = usePermissions();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const accessiblePages = getAccessiblePages();
  const accessibleFeatures = ADMIN_FEATURES.filter(feature => 
    hasPermission(feature.page, 'view')
  );

  return (
    <>
      <SEOHead 
        title="Client Dashboard"
        description="Manage your account and view your information"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ClientSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Client Dashboard</h1>
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {getInitials(user?.user_metadata?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>Welcome back!</CardTitle>
                        <CardDescription>
                          {user?.user_metadata?.full_name || 'User'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date(user?.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Features Section - Only shown if user has permissions */}
                {!isLoading && accessibleFeatures.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">Admin Features</h2>
                      <Badge variant="secondary">Limited Access</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {accessibleFeatures.map(feature => {
                        const Icon = feature.icon;
                        const canAdd = hasPermission(feature.page, 'add');
                        const canEdit = hasPermission(feature.page, 'edit');
                        const canDelete = hasPermission(feature.page, 'delete');
                        
                        return (
                          <Card 
                            key={feature.page}
                            className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" 
                            onClick={() => navigate(feature.path)}
                          >
                            <CardHeader>
                              <Icon className="h-8 w-8 text-primary mb-2" />
                              <CardTitle className="flex items-center gap-2">
                                {feature.label}
                              </CardTitle>
                              <CardDescription>{feature.description}</CardDescription>
                              <div className="flex gap-1 mt-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">View</Badge>
                                {canAdd && <Badge variant="outline" className="text-xs">Add</Badge>}
                                {canEdit && <Badge variant="outline" className="text-xs">Edit</Badge>}
                                {canDelete && <Badge variant="outline" className="text-xs">Delete</Badge>}
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Regular Quick Links */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Quick Links</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/projects')}>
                      <CardHeader>
                        <FileText className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                          View our portfolio and case studies
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services')}>
                      <CardHeader>
                        <UserIcon className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Services</CardTitle>
                        <CardDescription>
                          Explore our service offerings
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/contact')}>
                      <CardHeader>
                        <MessageSquare className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Contact Us</CardTitle>
                        <CardDescription>
                          Get in touch with our team
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/learn-odoo')}>
                      <CardHeader>
                        <FileText className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Learning Resources</CardTitle>
                        <CardDescription>
                          Access tutorials and guides
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
