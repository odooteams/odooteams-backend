import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <>
      <SEOHead title="Admin • Analytics" description="View analytics and metrics" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Analytics</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>Site Analytics</CardTitle>
                        <CardDescription>Traffic and engagement (coming soon)</CardDescription>
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
