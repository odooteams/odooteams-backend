import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

export default function Orders() {
  return (
    <>
      <SEOHead 
        title="My Orders"
        description="View and manage your orders"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ClientSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">My Orders</h1>
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>
                          View all your past and current orders
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No orders yet</p>
                      <p className="text-sm">Your orders will appear here once you make a purchase</p>
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
