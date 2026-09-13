import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Code2, Send, Loader2, CheckCircle2, Download } from 'lucide-react';

interface RequestCodeDialogProps {
  projectTitle: string;
  projectCategory?: string;
  downloadUrl?: string | null;
  triggerButton?: React.ReactNode;
}

export const RequestCodeDialog: React.FC<RequestCodeDialogProps> = ({
  projectTitle,
  projectCategory,
  downloadUrl,
  triggerButton,
}) => {
  const { t, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ fullName: '', email: '', phone: '', message: '' });
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error(t('Please fill in all required fields.', 'يرجى ملء جميع الحقول المطلوبة.'));
      return;
    }

    setLoading(true);
    try {
      const subject = `[Open Source Code Request] ${projectTitle}`;
      const messageBody = [
        `Requested Open Source Project Code: "${projectTitle}"`,
        projectCategory ? `Category: ${projectCategory}` : '',
        `Requester: ${formData.fullName}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone}`,
        formData.message ? `Notes: ${formData.message}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      let success = false;
      try {
        const { data, error: fnError } = await supabase.functions.invoke('submit-contact', {
          body: {
            type: 'contact',
            full_name: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            subject,
            message: messageBody,
          },
        });
        if (!fnError && !(data as any)?.error) {
          success = true;
        }
      } catch (fnEx) {
        console.warn('Edge function invoke failed, fallback to direct insert:', fnEx);
      }

      if (!success) {
        const { error: insertErr } = await supabase.from('contact_submissions').insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          subject,
          message: messageBody,
          status: 'new',
        });

        if (insertErr) throw insertErr;
      }

      setSubmitted(true);
      toast.success(
        t('Request submitted successfully! We will contact you shortly.', 'تم إرسال طلبك بنجاح! سنتواصل معك قريبًا.')
      );
    } catch (err: any) {
      console.error('Code request error:', err);
      toast.error(err.message || t('Failed to send request. Please try again.', 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            className="bg-odoo-purple hover:bg-odoo-magenta text-white transition-colors gap-1.5"
          >
            <Code2 className="h-4 w-4" />
            <span>{t('Request Code', 'طلب الكود')}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className={`sm:max-w-md ${dir === 'rtl' ? 'rtl' : 'ltr'}`} dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-odoo-purple">
            <Code2 className="h-5 w-5 text-odoo-magenta" />
            {t('Request Source Code', 'طلب الكود المصدري')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {t(
              `Fill out your details to receive access or source code for "${projectTitle}".`,
              `املأ بياناتك للحصول على الكود المصدري لمشروع "${projectTitle}".`
            )}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">
                {t('Request Received!', 'تم استلام طلبك!')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {t(
                  `Thank you, ${formData.fullName}. Our team has received your request for "${projectTitle}" and will share the source repository access with you shortly.`,
                  `شكرًا لك، ${formData.fullName}. تلقى فريقنا طلبك لمشروع "${projectTitle}" وسيقوم بمشاركة مستودع الكود معك قريبًا.`
                )}
              </p>
            </div>

            {downloadUrl && (
              <div className="pt-3">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-odoo-gold hover:bg-yellow-400 text-odoo-purple font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('Download Code Directly', 'تحميل الكود مباشرة')}</span>
                </a>
              </div>
            )}

            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                {t('Close', 'إغلاق')}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="req-fullname">
                {t('Full Name', 'الاسم الكامل')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-fullname"
                required
                placeholder={t('e.g. Hafez Rahim', 'مثال: محمد أحمد')}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-email">
                {t('Email Address', 'البريد الإلكتروني')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-email"
                type="email"
                required
                placeholder={t('e.g. Hafez@example.com', 'مثال: mohamed@example.com')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-phone">
                {t('Phone Number', 'رقم الهاتف')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-phone"
                type="tel"
                required
                placeholder={t('e.g. +201007419344', 'مثال: +201007419344')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-message">
                {t('Notes / Project Requirements (Optional)', 'ملاحظات / متطلبات المشروع (اختياري)')}
              </Label>
              <Textarea
                id="req-message"
                rows={3}
                placeholder={t('Tell us how you plan to use this code or any customization needed...', 'أخبرنا بكيفية استخدامك للكود أو أي تخصيص ترغب به...')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {t('Cancel', 'إلغاء')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-odoo-purple hover:bg-odoo-magenta text-white gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('Submitting...', 'جاري الإرسال...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t('Send Request', 'إرسال الطلب')}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
