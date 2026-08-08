import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ClientSidebar } from '@/components/dashboard/ClientSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Mail, Phone, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function Support() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      toast.error('You must be signed in');
      return;
    }
    setSubmitting(true);
    try {
      const fullName = (user.user_metadata as any)?.full_name || user.email;
      const data = { name: fullName, email: user.email, subject, message };

      // Save as a contact submission of subject = support
      await supabase.from('contact_submissions').insert({
        full_name: fullName,
        email: user.email,
        subject: `[Support] ${subject}`,
        message,
        status: 'new',
      });

      await Promise.allSettled([
        supabase.functions.invoke('send-notification-email', {
          body: { kind: 'support_ticket_client', lang: language, data },
        }),
        supabase.functions.invoke('send-notification-email', {
          body: { kind: 'support_ticket_admin', lang: 'en', data },
        }),
      ]);

      toast.success('Support ticket submitted successfully');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Support"
        description="Get help and support from our team"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ClientSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Support</h1>
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>
                          Submit a support ticket and we'll get back to you soon
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe your issue in detail..."
                          rows={6}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</> : 'Submit Ticket'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <Mail className="h-6 w-6 text-primary mb-2" />
                      <CardTitle className="text-lg">Email Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">support@odooteams.com</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Phone className="h-6 w-6 text-primary mb-2" />
                      <CardTitle className="text-lg">Phone Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
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
