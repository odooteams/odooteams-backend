import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContactData {
  Email: string;
  Call: string;
  WhatsApp?: string;
  Facebook?: string;
  Twitter?: string;
  LinkedIn?: string;
  Instagram?: string;
  YouTube?: string;
}

const TopHeader = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [contactData, setContactData] = useState<ContactData | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['contact_info', 'social_media']);
          
        if (error) throw error;
        
        if (data) {
          const contact = (data.find(s => s.setting_key === 'contact_info')?.setting_value as any) || {};
          const social = (data.find(s => s.setting_key === 'social_media')?.setting_value as any) || {};
          
          setContactData({
            Email: contact.email || 'info@odooteams.com',
            Call: contact.phone || '+201007419344',
            WhatsApp: social.whatsapp || '201007419344',
            Facebook: social.facebook || '',
            Twitter: social.twitter || '',
            LinkedIn: social.linkedin || '',
            Instagram: social.instagram || '',
            YouTube: social.youtube || ''
          });
        }
      } catch (error) {
        console.error('Error fetching contact info from database:', error);
      }
    };
    fetchContactInfo();
  }, []);

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

  return (
    <div className={`bg-primary text-primary-foreground py-2 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-none mx-auto px-4">
        <div className="flex justify-between items-center text-sm">
          {/* Left side: Contact info */}
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {contactData?.Email && (
              <a 
                href={`mailto:${contactData.Email}`}
                className="hidden md:flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{contactData.Email}</span>
              </a>
            )}
            {contactData?.Call && (
              <a 
                href={`tel:${contactData.Call}`}
                className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span dir="ltr">{contactData.Call}</span>
              </a>
            )}
          </div>

          {/* Right side: Social media & Language switcher */}
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Social media - hidden on mobile */}
          <div className={`hidden md:flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              {contactData?.WhatsApp && (
                <a 
                  href={`https://wa.me/${contactData.WhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {contactData?.Facebook && (
                <a 
                  href={contactData.Facebook}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {contactData?.Twitter && (
                <a 
                  href={contactData.Twitter}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {contactData?.LinkedIn && (
                <a 
                  href={contactData.LinkedIn}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {contactData?.Instagram && (
                <a 
                  href={contactData.Instagram}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {contactData?.YouTube && (
                <a 
                  href={contactData.YouTube}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Language switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors p-1 text-xs font-medium"
              aria-label={t('Switch to Arabic', 'Switch to English')}
            >
              <span className={language === 'ar' ? 'opacity-100' : 'opacity-60'}>Ar</span>
              <span className="opacity-50">/</span>
              <span className={language === 'en' ? 'opacity-100' : 'opacity-60'}>EN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
