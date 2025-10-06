
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface ServiceDescriptionProps {
  fullDescription: string;
  benefits: string[];
}

const ServiceDescription: React.FC<ServiceDescriptionProps> = ({ fullDescription, benefits }) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-odoo-purple">
          {t('About this Service', 'عن هذه الخدمة')}
        </h2>
        <p className="text-gray-700 mb-8 leading-relaxed">
          {fullDescription}
        </p>
        
        <h3 className="text-xl font-bold mb-4 text-odoo-purple">
          {t('Key Benefits', 'الفوائد الرئيسية')}
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 ml-reverse:rtl mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ServiceDescription;
