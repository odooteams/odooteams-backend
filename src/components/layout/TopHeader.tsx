import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const TopHeader = () => {
  const { language, setLanguage, t, dir } = useLanguage();

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

  return (
    <div className={`bg-primary text-primary-foreground py-2 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-none mx-auto px-4">
        <div className="flex justify-between items-center text-sm">
          {/* Left side: Contact info */}
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <a 
              href="mailto:info@odooteams.com" 
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">info@odooteams.com</span>
            </a>
            <a 
              href="tel:+966123456789" 
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">+966 12 345 6789</span>
            </a>
          </div>

          {/* Right side: Social media & Language switcher */}
          <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            {/* Social media */}
            <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-foreground/80 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-foreground/80 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-foreground/80 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-foreground/80 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
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
