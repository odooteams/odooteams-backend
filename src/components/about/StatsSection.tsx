
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

const StatsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-odoo-magenta mb-2">8+</div>
            <div className="text-gray-600">{t('Years of Experience', 'سنوات من الخبرة')}</div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-odoo-magenta mb-2">200+</div>
            <div className="text-gray-600">{t('Projects Completed', 'المشاريع المنجزة')}</div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-odoo-magenta mb-2">150+</div>
            <div className="text-gray-600">{t('Happy Clients', 'عملاء سعداء')}</div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-odoo-magenta mb-2">20+</div>
            <div className="text-gray-600">{t('Odoo Experts', 'خبراء أودو')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
