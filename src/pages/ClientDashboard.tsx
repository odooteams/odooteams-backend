import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Calendar, FileText, MessageSquare, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
