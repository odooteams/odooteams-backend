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
  BarChart3,
  Settings,
  BookOpen,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const adminCards = [
    {
      title: 'Users Management',
      description: 'Manage user accounts and roles',
      icon: Users,
      color: 'text-blue-500',
      onClick: () => toast.info('Users management coming soon')
    },
    {
      title: 'Services',
      description: 'Create and edit services',
      icon: Briefcase,
      color: 'text-green-500',
      onClick: () => navigate('/services')
    },
    {
      title: 'Projects',
      description: 'Manage project portfolio',
      icon: FileText,
      color: 'text-purple-500',
      onClick: () => navigate('/projects')
    },
    {
      title: 'Contact Submissions',
      description: 'View and respond to inquiries',
      icon: MessageSquare,
      color: 'text-orange-500',
      onClick: () => toast.info('Contact submissions coming soon')
    },
    {
      title: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: HelpCircle,
      color: 'text-pink-500',
      onClick: () => navigate('/faqs')
    },
    {
      title: 'Learn Resources',
      description: 'Create educational content',
      icon: BookOpen,
      color: 'text-indigo-500',
      onClick: () => navigate('/learn-odoo')
    },
    {
      title: 'Analytics',
      description: 'View site statistics',
      icon: BarChart3,
      color: 'text-cyan-500',
      onClick: () => toast.info('Analytics coming soon')
    },
    {
      title: 'Team Members',
      description: 'Manage team profiles',
      icon: Users,
      color: 'text-teal-500',
      onClick: () => navigate('/about')
    },
    {
      title: 'Timeline Events',
      description: 'Update company timeline',
      icon: Clock,
      color: 'text-amber-500',
      onClick: () => navigate('/about')
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'text-gray-500',
      onClick: () => toast.info('Settings coming soon')
    }
  ];

  return (
    <>
      <SEOHead 
        title="Admin Dashboard"
        description="Manage your website content and users"
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your website content and settings
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {getInitials(user?.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {user?.user_metadata?.full_name || 'Admin'}
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Admin
                      </span>
                    </CardTitle>
                    <CardDescription>{user?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adminCards.map((card, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                  onClick={card.onClick}
                >
                  <CardHeader>
                    <card.icon className={`h-8 w-8 mb-2 ${card.color}`} />
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
