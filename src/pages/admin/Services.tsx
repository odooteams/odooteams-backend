import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function AdminServices() {
  return (
    <>
      <SEOHead title="Admin • Services" description="Create and manage services" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Services</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>Manage Services</CardTitle>
                        <CardDescription>Add, edit, and remove services</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Coming soon.</p>
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
