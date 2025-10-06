
import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
    const newErrors = { ...errors };
    
    if (!formData.name.trim()) {
      newErrors.name = t('Name is required', 'الاسم مطلوب');
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('Email is required', 'البريد الإلكتروني مطلوب');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Email is invalid', 'البريد الإلكتروني غير صالح');
      valid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('Phone number is required', 'رقم الهاتف مطلوب');
      valid = false;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('Message is required', 'الرسالة مطلوبة');
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        // Create WhatsApp message
        const message = encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`
        );
        
        // Open WhatsApp with pre-filled message
        const whatsappUrl = `https://wa.me/201007419344?text=${message}`;
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        // Fallback if popup blocked
        if (!newWindow || newWindow.closed) {
          window.location.href = whatsappUrl;
        }
        
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
          message: ''
        });
      } catch (error) {
        console.warn('WhatsApp failed:', error);
        toast({
          title: t('WhatsApp unavailable', 'واتساب غير متاح'),
          description: t('Please call us at +201007419344', 'يرجى الاتصال بنا على +201007419344'),
          variant: 'destructive',
        });
      }
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
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Enter your full name', 'أدخل اسمك الكامل')}
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
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Enter your email address', 'أدخل عنوان بريدك الإلكتروني')}
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
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
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
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.message ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-odoo-magenta/30'
            }`}
            placeholder={t('Write your message here...', 'اكتب رسالتك هنا...')}
          ></textarea>
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full bg-odoo-purple hover:bg-odoo-magenta text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 flex items-center justify-center"
        >
          <Send className="mr-2 ml-reverse:rtl h-5 w-5" />
          {t('Send Message via WhatsApp', 'إرسال الرسالة عبر واتساب')}
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
