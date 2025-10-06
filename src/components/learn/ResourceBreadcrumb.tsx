
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';

interface ResourceBreadcrumbProps {
  title: string;
}

const ResourceBreadcrumb: React.FC<ResourceBreadcrumbProps> = ({ title }) => {
  const { t } = useLanguage();
  
  return (
    <section className="bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <nav className="flex items-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-odoo-purple">
            {t('Home', 'الرئيسية')}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/learn-odoo" className="text-gray-500 hover:text-odoo-purple">
            {t('Learn Odoo', 'تعلم أودو')}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-odoo-purple font-medium">{title}</span>
        </nav>
      </div>
    </section>
  );
};

export default ResourceBreadcrumb;
