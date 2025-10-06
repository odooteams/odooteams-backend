
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from '@/hooks/use-toast';
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
import { CheckCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(6, {
    message: "Phone number must be at least 6 characters.",
  }),
  message: z.string().optional(),
});

interface ProjectContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectCost?: string;
  onSendToWhatsApp: (formData: z.infer<typeof formSchema>) => void;
}

const ProjectContactDialog: React.FC<ProjectContactDialogProps> = ({
  open,
  onOpenChange,
  projectTitle,
  projectCost,
  onSendToWhatsApp,
}) => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSendToWhatsApp(values);
    setIsSubmitted(true);
    toast({
      title: t('Thank you!', 'شكراً لك!'),
      description: t('We received your information and will contact you soon.', 'لقد تلقينا معلوماتك وسنتصل بك قريبًا.')
    });
  }

  const resetForm = () => {
    form.reset();
    setIsSubmitted(false);
  };
  
  React.useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setTimeout(() => {
        resetForm();
      }, 300); // Wait for dialog close animation
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('Contact Us About', 'اتصل بنا بخصوص')}</DialogTitle>
              <DialogDescription>
                {projectTitle}
                {projectCost && <span className="block mt-1">{t('Estimated cost:', 'التكلفة التقديرية:')} {projectCost}</span>}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Name', 'الاسم')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('Your name', 'اسمك')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Email', 'البريد الإلكتروني')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('your@email.com', 'your@email.com')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Phone', 'رقم الهاتف')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('+1 234 567 890', '+٩٦٦ ٥٠ ١٢٣ ٤٥٦٧')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Message (Optional)', 'الرسالة (اختياري)')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('Your message...', 'رسالتك...')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" className="bg-odoo-magenta hover:bg-odoo-purple">
                    {t('Send via WhatsApp', 'إرسال عبر واتساب')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <DialogTitle className="text-center">
              {t('Thank You!', 'شكراً لك!')}
            </DialogTitle>
            <p className="text-center text-muted-foreground mt-2">
              {t('We received your information and will contact you soon.', 'لقد تلقينا معلوماتك وسنتصل بك قريبًا.')}
            </p>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="mt-6 bg-odoo-gold text-odoo-purple hover:bg-yellow-500"
            >
              {t('Close', 'إغلاق')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectContactDialog;
