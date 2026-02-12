
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Facebook, Linkedin, MessageSquare, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const { t, dir } = useLanguage();
  
  return (
    <footer className={`bg-odoo-purple text-white mt-16 hidden md:block ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-none mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">Odoo<span className="text-odoo-gold">Teams</span></span>
            </Link>
            <p className="mt-4 text-gray-200">
              {t(
                'Professional Odoo implementation services to help your business grow.',
                'خدمات احترافية لتنفيذ أودو لمساعدة عملك على النمو.'
              )}
            </p>
            <div className="flex items-center space-x-4 mt-6 space-x-reverse:rtl">
              <a href="https://facebook.com" className="hover:text-odoo-gold transition duration-300" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="hover:text-odoo-gold transition duration-300" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://wa.me/201007419344" className="hover:text-odoo-gold transition duration-300" aria-label="WhatsApp">
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Quick Links', 'روابط سريعة')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-odoo-gold transition duration-300">{t('Home', 'الرئيسية')}</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-odoo-gold transition duration-300">{t('Services', 'الخدمات')}</Link>
              </li>
              <li>
                <Link to="/learn-odoo" className="hover:text-odoo-gold transition duration-300">{t('Learn Odoo', 'تعلم أودو')}</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-odoo-gold transition duration-300">{t('About Us', 'من نحن')}</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-odoo-gold transition duration-300">{t('Contact Us', 'اتصل بنا')}</Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-odoo-gold transition duration-300">{t('FAQs', 'الأسئلة الشائعة')}</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Legal', 'قانوني')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/policy/privacy-policy" className="hover:text-odoo-gold transition duration-300">{t('Privacy Policy', 'سياسة الخصوصية')}</Link>
              </li>
              <li>
                <Link to="/policy/terms-of-service" className="hover:text-odoo-gold transition duration-300">{t('Terms of Service', 'شروط الخدمة')}</Link>
              </li>
              <li>
                <Link to="/policy/cookie-policy" className="hover:text-odoo-gold transition duration-300">{t('Cookie Policy', 'سياسة ملفات تعريف الارتباط')}</Link>
              </li>
            </ul>
          </div>

          {/* Our Services (moved from the end to replace Contact Us position) */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Our Services', 'خدماتنا')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/odoo-erp" className="hover:text-odoo-gold transition duration-300">{t('Odoo ERP', 'نظام أودو')}</Link>
              </li>
              <li>
                <Link to="/services/website-development" className="hover:text-odoo-gold transition duration-300">{t('Website Development', 'تطوير المواقع')}</Link>
              </li>
              <li>
                <Link to="/services/application-development" className="hover:text-odoo-gold transition duration-300">{t('Application Development', 'تطوير التطبيقات')}</Link>
              </li>
              <li>
                <Link to="/services/odoo-learning" className="hover:text-odoo-gold transition duration-300">{t('Odoo Learning', 'تعليم أودو')}</Link>
              </li>
              <li>
                <Link to="/services/implementation" className="hover:text-odoo-gold transition duration-300">{t('Implementation', 'التنفيذ')}</Link>
              </li>
              <li>
                <Link to="/services/consultation" className="hover:text-odoo-gold transition duration-300">{t('Consultation', 'الاستشارات')}</Link>
              </li>
              <li>
                <Link to="/services/graphic-design" className="hover:text-odoo-gold transition duration-300">{t('Graphic Design', 'التصميم الجرافيكي')}</Link>
              </li>
            </ul>
          </div>

          {/* Contact information (moved from 3rd position to last position) */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Contact Us', 'اتصل بنا')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>{t('Cairo, Egypt', 'القاهرة، مصر')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" />
                <a href="tel:+201007419344" className="hover:text-odoo-gold transition duration-300" dir="ltr">+20 100 741 9344</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 shrink-0" />
                <a href="mailto:info@odooteams.com" className="hover:text-odoo-gold transition duration-300" dir="ltr">info@odooteams.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {t('OdooTeams', 'فريق مطورين اودو')}. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
