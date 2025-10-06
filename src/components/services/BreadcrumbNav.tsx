
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';

interface BreadcrumbNavProps {
  serviceTitle: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ serviceTitle }) => {
  const { t } = useLanguage();
  
  return (
    <section className="bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <nav className="flex items-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-odoo-purple">
            {t('Home', 'الرئيسية')}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/services" className="text-gray-500 hover:text-odoo-purple">
            {t('Services', 'الخدمات')}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-odoo-purple font-medium">{serviceTitle}</span>
        </nav>
      </div>
    </section>
  );
};

export default BreadcrumbNav;
