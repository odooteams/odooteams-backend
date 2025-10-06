
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface ServiceProcessProps {
  steps: ProcessStep[];
}

const ServiceProcess: React.FC<ServiceProcessProps> = ({ steps }) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-odoo-purple text-center">
          {t('Our Implementation Process', 'عملية التنفيذ لدينا')}
        </h2>
        <div className="relative">
          {/* Process timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-odoo-gold"></div>
          
          <div className="space-y-12">
            {steps.map((process, index) => (
              <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="md:w-1/2 p-4 flex items-center justify-end">
                  <div className={`bg-white p-6 rounded-lg shadow-md w-full md:max-w-md ${index % 2 === 0 ? 'md:mr-6 md:ml-reverse:rtl' : 'md:ml-6 md:mr-reverse:rtl'}`}>
                    <div className="flex items-center mb-3">
                      <div className="bg-odoo-purple text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 ml-reverse:rtl">
                        {process.step}
                      </div>
                      <h3 className="text-xl font-bold text-odoo-purple">{process.title}</h3>
                    </div>
                    <p className="text-gray-600">{process.description}</p>
                  </div>
                </div>
                <div className="hidden md:flex md:w-1/2 items-center justify-center relative">
                  <div className="absolute w-4 h-4 bg-odoo-gold rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceProcess;
