import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  return (
    <>
      <SEOHead 
        title="Profile"
        description="Manage your profile and account settings"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ClientSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Profile</h1>
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl">
                          {getInitials(user?.user_metadata?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="pl-9 bg-muted"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Account Details</CardTitle>
                        <CardDescription>
                          Your account information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">
                        {new Date(user?.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {user?.id.substring(0, 8)}...
                      </span>
                    </div>
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
