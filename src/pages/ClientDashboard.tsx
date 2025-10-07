import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Mail, Calendar, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Client Dashboard</h1>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

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

            <div className="grid gap-4 md:grid-cols-2">
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
                  <User className="h-8 w-8 text-primary mb-2" />
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
        <Footer />
      </div>
    </>
  );
}
