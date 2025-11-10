import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { siteSettingsQueries } from '@/lib/supabase/queries';

interface ContactInfo {
  email: string;
  phone: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

const TopHeader = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'info@odooteams.com',
    phone: '+966 12 345 6789'
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await siteSettingsQueries.getBySetting('contact_info');
        if (data?.setting_value) {
          setContactInfo(data.setting_value as unknown as ContactInfo);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
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
            <a 
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">{contactInfo.email}</span>
            </a>
            <a 
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">{contactInfo.phone}</span>
            </a>
          </div>

          {/* Right side: Social media & Language switcher */}
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Social media */}
            <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              {contactInfo.facebook && (
                <a 
                  href={contactInfo.facebook}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {contactInfo.twitter && (
                <a 
                  href={contactInfo.twitter}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {contactInfo.linkedin && (
                <a 
                  href={contactInfo.linkedin}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {contactInfo.instagram && (
                <a 
                  href={contactInfo.instagram}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-foreground/80 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Language switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors p-1"
              aria-label={t('Switch to Arabic', 'Switch to English')}
            >
              <img 
                src={language === 'en' ? '/lovable-uploads/68c19eac-d969-40d2-9cfd-df3db46f59a5.png' : '/lovable-uploads/97aadb3f-bfe5-4f3f-b1f0-235706013355.png'} 
                alt={language === 'en' ? 'English Flag' : 'Saudi Arabia Flag'} 
                className="h-4 w-4 rounded-full object-cover"
              />
              <span className="text-xs font-medium">{language === 'en' ? 'AR' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
