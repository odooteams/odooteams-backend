import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { honeypotStyle } from '@/lib/security/honeypot';

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadedAt = useRef<number>(Date.now());
  const lastSubmitHash = useRef<string>('');
  const lastSubmitAt = useRef<number>(0);

  const [hp, setHp] = useState({ website: '', hp_company: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = () => {
    let valid = true;
    const newErrors = { name: '', email: '', phone: '', message: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = t('Name is required', 'الاسم مطلوب');
      valid = false;
    } else if (formData.name.trim().length > 100) {
      newErrors.name = t('Name must be less than 100 characters', 'يجب أن يكون الاسم أقل من 100 حرف');
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('Email is required', 'البريد الإلكتروني مطلوب');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('Email is invalid', 'البريد الإلكتروني غير صالح');
      valid = false;
    } else if (formData.email.length > 255) {
      newErrors.email = t('Email must be less than 255 characters', 'يجب أن يكون البريد الإلكتروني أقل من 255 حرف');
      valid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('Phone number is required', 'رقم الهاتف مطلوب');
      valid = false;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('Message is required', 'الرسالة مطلوبة');
      valid = false;
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = t('Message must be less than 2000 characters', 'يجب أن تكون الرسالة أقل من 2000 حرف');
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // hard guard against double-clicks
    if (!validate()) return;

    // Client-side idempotency: same payload within 10s = ignore.
    const fingerprint = `${formData.email.trim().toLowerCase()}|${formData.message.trim()}`;
    if (
      fingerprint === lastSubmitHash.current &&
      Date.now() - lastSubmitAt.current < 10_000
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('submit-contact', {
        body: {
          type: 'contact',
          full_name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          company: formData.company.trim() || null,
          subject: formData.subject.trim() || null,
          message: formData.message.trim(),
          website: hp.website,
          hp_company: hp.hp_company,
          form_loaded_at: formLoadedAt.current,
        },
      });

      if (fnError || (data && (data as any).error)) {
        const msg = (data as any)?.error || fnError?.message || 'Failed to save message';
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
      
      // Show success toast
      toast({
        title: t('Message Sent!', 'تم إرسال الرسالة!'),
        description: t('Thank you for contacting us. We will respond soon.', 'شكرًا للتواصل معنا. سنرد قريبًا.'),
        variant: 'default',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: t('Error', 'خطأ'),
        description: t('Failed to send message. Please try again.', 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-odoo-purple mb-6">
        {t('Send Us a Message', 'أرسل لنا رسالة')}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
            {t('Your Name', 'الاسم')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Enter your full name', 'أدخل اسمك الكامل')}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
            {t('Email Address', 'البريد الإلكتروني')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={255}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Enter your email address', 'أدخل عنوان بريدك الإلكتروني')}
            disabled={isSubmitting}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">
            {t('Phone Number', 'رقم الهاتف')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.phone ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Enter your phone number', 'أدخل رقم هاتفك')}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="company" className="block mb-2 font-medium text-gray-700">
            {t('Company', 'الشركة')}
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-odoo-magenta/30"
            placeholder={t('Enter your company name', 'أدخل اسم شركتك')}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="subject" className="block mb-2 font-medium text-gray-700">
            {t('Subject', 'الموضوع')}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-odoo-magenta/30"
            placeholder={t('Enter subject', 'أدخل الموضوع')}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="message" className="block mb-2 font-medium text-gray-700">
            {t('Your Message', 'رسالتك')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            maxLength={2000}
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.message ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Write your message here...', 'اكتب رسالتك هنا...')}
            disabled={isSubmitting}
          ></textarea>
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
          <p className="mt-1 text-xs text-gray-500 text-right">{formData.message.length}/2000</p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-odoo-purple hover:bg-odoo-magenta text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('Sending...', 'جاري الإرسال...')}
            </>
          ) : (
            <>
              <Send className="mr-2 ml-reverse:rtl h-5 w-5" />
              {t('Send Message', 'إرسال الرسالة')}
            </>
          )}
        </button>
        
        <p className="mt-4 text-sm text-gray-500 text-center">
          {t(
            'By submitting this form, you agree to be contacted about our services.',
            'بإرسال هذا النموذج، فإنك توافق على الاتصال بك بخصوص خدماتنا.'
          )}
        </p>
      </form>
    </div>
  );
};

export default ContactForm;