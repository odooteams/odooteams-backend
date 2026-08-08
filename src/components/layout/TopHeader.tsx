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
                <span>{contactData.Call}</span>
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
