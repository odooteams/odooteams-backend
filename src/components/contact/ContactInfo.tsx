
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { MapPin, Phone, Mail, Loader2, Facebook, Instagram, Twitter, Youtube, Linkedin, MessageSquare } from 'lucide-react';
import { fetchSheetData, GOOGLE_SHEETS_CONFIG } from '@/lib/googleSheets';

interface ContactData {
  Address_en: string;
  Address_ar: string;
  Call: string;
  WhatsApp: string;
  Email: string;
  Facebook: string;
  LinkedIn: string;
  Instagram: string;
  Twitter: string;
  YouTube: string;
  TikTok: string;
}

const ContactInfo: React.FC = () => {
  const { t, language } = useLanguage();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData(
          GOOGLE_SHEETS_CONFIG.API_KEY,
          GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
          GOOGLE_SHEETS_CONFIG.SHEETS.CONTACT
        );
        
        if (data && data.length > 0) {
          // Fix: Convert Record<string, string> to ContactData using type assertion
          setContactData(data[0] as unknown as ContactData);
        } else {
          setError(t('No contact information available.', 'لا توجد معلومات اتصال متاحة.'));
        }
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError(t(
          'Failed to load contact information. Please try again later.',
          'فشل تحميل معلومات الاتصال. يرجى المحاولة مرة أخرى لاحقًا.'
        ));
      } finally {
        setLoading(false);
      }
    };
    
    fetchContact();
  }, [t]);
  
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-odoo-purple" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!contactData) {
    return null;
  }
  
  const address = language === 'en' ? contactData.Address_en : contactData.Address_ar;
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-odoo-purple mb-6">
        {t('Get in Touch', 'تواصل معنا')}
      </h2>
      
      <p className="text-gray-600 mb-8">
        {t(
          'Have questions about Odoo implementation or our services? Contact us directly or use the form to send a message.',
          'هل لديك أسئلة حول تنفيذ أودو أو خدماتنا؟ اتصل بنا مباشرة أو استخدم النموذج لإرسال رسالة.'
        )}
      </p>
      
      <div className="space-y-6 mb-10">
        {/* Address */}
        <div className="flex items-start">
          <div className="bg-odoo-purple/10 p-3 rounded-full mr-4 ml-reverse:rtl">
            <MapPin className="h-6 w-6 text-odoo-purple" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t('Our Location', 'موقعنا')}</h3>
            <p className="text-gray-600">{address}</p>
          </div>
        </div>
        
        {/* Phone */}
        <div className="flex items-start">
          <div className="bg-odoo-purple/10 p-3 rounded-full mr-4 ml-reverse:rtl">
            <Phone className="h-6 w-6 text-odoo-purple" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t('Phone Number', 'رقم الهاتف')}</h3>
            <p className="text-gray-600">
              <a href={`tel:${contactData.Call}`} className="hover:text-odoo-magenta transition-colors">{contactData.Call}</a>
            </p>
          </div>
        </div>
        
        {/* WhatsApp */}
        <div className="flex items-start">
          <div className="bg-odoo-purple/10 p-3 rounded-full mr-4 ml-reverse:rtl">
            <MessageSquare className="h-6 w-6 text-odoo-purple" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t('WhatsApp', 'واتساب')}</h3>
            <p className="text-gray-600">
              <a href={`https://wa.me/${contactData.WhatsApp}`} className="hover:text-odoo-magenta transition-colors">
                {contactData.WhatsApp}
              </a>
            </p>
          </div>
        </div>
        
        {/* Email */}
        <div className="flex items-start">
          <div className="bg-odoo-purple/10 p-3 rounded-full mr-4 ml-reverse:rtl">
            <Mail className="h-6 w-6 text-odoo-purple" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t('Email Address', 'البريد الإلكتروني')}</h3>
            <p className="text-gray-600">
              <a href={`mailto:${contactData.Email}`} className="hover:text-odoo-magenta transition-colors">
                {contactData.Email}
              </a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Social Media Links */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-4">{t('Connect With Us', 'تواصل معنا')}</h3>
        <div className="flex space-x-4 space-x-reverse:rtl">
          {contactData.Facebook && (
            <a href={contactData.Facebook} target="_blank" rel="noopener noreferrer" 
               className="bg-odoo-purple/10 p-3 rounded-full text-odoo-purple hover:bg-odoo-purple hover:text-white transition-all" 
               aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
          )}
          
          {contactData.LinkedIn && (
            <a href={contactData.LinkedIn} target="_blank" rel="noopener noreferrer" 
               className="bg-odoo-purple/10 p-3 rounded-full text-odoo-purple hover:bg-odoo-purple hover:text-white transition-all" 
               aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          
          {contactData.Instagram && (
            <a href={contactData.Instagram} target="_blank" rel="noopener noreferrer" 
               className="bg-odoo-purple/10 p-3 rounded-full text-odoo-purple hover:bg-odoo-purple hover:text-white transition-all" 
               aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
          )}
          
          {contactData.Twitter && (
            <a href={contactData.Twitter} target="_blank" rel="noopener noreferrer" 
               className="bg-odoo-purple/10 p-3 rounded-full text-odoo-purple hover:bg-odoo-purple hover:text-white transition-all" 
               aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
          )}
          
          {contactData.YouTube && (
            <a href={contactData.YouTube} target="_blank" rel="noopener noreferrer" 
               className="bg-odoo-purple/10 p-3 rounded-full text-odoo-purple hover:bg-odoo-purple hover:text-white transition-all" 
               aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
      
      {/* Google Maps */}
      <div className="rounded-lg overflow-hidden h-64">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.4782532314024!2d31.342964!3d30.073886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDA0JzI2LjAiTiAzMcKwMjAnMzQuNyJF!5e0!3m2!1sen!2seg!4v1620160024595!5m2!1sen!2seg" 
          className="w-full h-full border-0" 
          loading="lazy"
          title="Google Maps"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default ContactInfo;
