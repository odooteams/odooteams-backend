import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { fetchSheetData, GOOGLE_SHEETS_CONFIG } from '@/lib/googleSheets';

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
        const data = await fetchSheetData(
          GOOGLE_SHEETS_CONFIG.API_KEY,
          GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
          GOOGLE_SHEETS_CONFIG.SHEETS.CONTACT
        );
        if (data && data.length > 0) {
          setContactData(data[0] as unknown as ContactData);
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
            {contactData?.Email && (
              <a 
                href={`mailto:${contactData.Email}`}
                className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
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
                <span className="hidden sm:inline">{contactData.Call}</span>
              </a>
            )}
          </div>

          {/* Right side: Social media & Language switcher */}
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Social media */}
          <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
