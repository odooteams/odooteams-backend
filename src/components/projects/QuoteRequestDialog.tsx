import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { honeypotStyle } from '@/lib/security/honeypot';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(50),
  message: z.string().max(2000).optional(),
});

type QuoteFormValues = z.infer<typeof formSchema>;

interface QuoteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle?: string;
  projectCost?: string;
  variant?: 'magenta' | 'gold';
}

const QuoteRequestDialog: React.FC<QuoteRequestDialogProps> = ({
  open,
  onOpenChange,
  projectTitle,
  projectCost,
  variant = 'magenta',
}) => {
  const { t, language } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hp, setHp] = useState({ website: '', hp_company: '' });
  const formLoadedAt = useRef<number>(Date.now());
  const lastSubmitHash = useRef<string>('');
  const lastSubmitAt = useRef<number>(0);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: QuoteFormValues) {
    if (isSubmitting) return;

    const fingerprint = `${values.email.toLowerCase()}|${projectTitle || ''}|${values.message || ''}`;
    if (fingerprint === lastSubmitHash.current && Date.now() - lastSubmitAt.current < 10_000) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          type: 'quote',
          full_name: values.name,
          email: values.email,
          phone: values.phone,
          message: values.message || '',
          project_title: projectTitle,
          project_cost: projectCost,
          website: hp.website,
          hp_company: hp.hp_company,
          form_loaded_at: formLoadedAt.current,
          lang: language,
        },
      });

      if (error || (data as any)?.error) {
        const msg = (data as any)?.error || error?.message || 'Failed to send';
        if (msg.toLowerCase().includes('too many')) {
          toast({
            title: t('Slow down', 'تمهل قليلاً'),
            description: t('Too many requests. Please try again in a minute.', 'طلبات كثيرة. يرجى المحاولة بعد دقيقة.'),
            variant: 'destructive',
          });
          return;
        }
        throw new Error(msg);
      }

      lastSubmitHash.current = fingerprint;
      lastSubmitAt.current = Date.now();
      setIsSubmitted(true);
      toast({
        title: t('Thank you!', 'شكراً لك!'),
        description: t('We received your information and will contact you soon.', 'لقد تلقينا معلوماتك وسنتصل بك قريبًا.'),
      });
    } catch (e: any) {
      toast({
        title: t('Error', 'خطأ'),
        description: t('Failed to send. Please try again.', 'فشل الإرسال. يرجى المحاولة مرة أخرى.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        form.reset();
        setIsSubmitted(false);
        formLoadedAt.current = Date.now();
      }, 300);
    } else {
      formLoadedAt.current = Date.now();
    }
  }, [open, form]);

  const btnClass = variant === 'gold'
    ? 'bg-odoo-gold hover:bg-yellow-500 text-odoo-purple'
    : 'bg-odoo-magenta hover:bg-odoo-purple';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('Request a Quote', 'طلب عرض سعر')}</DialogTitle>
              {projectTitle && (
                <DialogDescription>
                  {projectTitle}
                  {projectCost && (
                    <span className="block mt-1">
                      {t('Estimated cost:', 'التكلفة التقديرية:')} {projectCost}
                    </span>
                  )}
                </DialogDescription>
              )}
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div style={honeypotStyle} aria-hidden="true">
                  <label>
                    Website
                    <input type="text" tabIndex={-1} autoComplete="off"
                      value={hp.website}
                      onChange={(e) => setHp((s) => ({ ...s, website: e.target.value }))} />
                  </label>
                  <label>
                    Company URL
                    <input type="text" tabIndex={-1} autoComplete="off"
                      value={hp.hp_company}
                      onChange={(e) => setHp((s) => ({ ...s, hp_company: e.target.value }))} />
                  </label>
                </div>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Name', 'الاسم')}</FormLabel>
                    <FormControl><Input placeholder={t('Your name', 'اسمك')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Email', 'البريد الإلكتروني')}</FormLabel>
                    <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Phone', 'رقم الهاتف')}</FormLabel>
                    <FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Message (Optional)', 'الرسالة (اختياري)')}</FormLabel>
                    <FormControl><Textarea placeholder={t('Your message...', 'رسالتك...')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isSubmitting} className={btnClass}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('Sending...', 'جاري الإرسال...')}</>
                    ) : (
                      t('Send Request', 'إرسال الطلب')
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <DialogTitle className="text-center">{t('Thank You!', 'شكراً لك!')}</DialogTitle>
            <p className="text-center text-muted-foreground mt-2">
              {t('We received your information and will contact you soon.', 'لقد تلقينا معلوماتك وسنتصل بك قريبًا.')}
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-6 bg-odoo-gold text-odoo-purple hover:bg-yellow-500">
              {t('Close', 'إغلاق')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestDialog;
