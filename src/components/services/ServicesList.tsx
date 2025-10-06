
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import ServiceCard from './ServiceCard';

interface ServicesListProps {
  services: Array<{
    id: number;
    category: string;
    title: string;
    details: string;
    image: string;
  }>;
  isGridView: boolean;
  onRequestViaWhatsApp: (service: string) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ 
  services, 
  isGridView,
  onRequestViaWhatsApp 
}) => {
  const { t } = useLanguage();
  
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-500">
          {t('No services found matching your criteria.', 'لم يتم العثور على خدمات تطابق معايير البحث.')}
        </h3>
      </div>
    );
  }
  
  return (
    <>
      {isGridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-scale-in">
          {services.map((service) => (
            <ServiceCard 
              key={service.id}
              service={service}
              isGridView={isGridView}
              onRequestViaWhatsApp={onRequestViaWhatsApp}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-slide-up">
          {services.map((service) => (
            <ServiceCard 
              key={service.id}
              service={service}
              isGridView={isGridView}
              onRequestViaWhatsApp={onRequestViaWhatsApp}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ServicesList;
