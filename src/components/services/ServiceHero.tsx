
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface ServiceHeroProps {
  service: {
    category: string;
    title: string;
    details: string;
    image: string;
  };
  onWhatsAppRequest: () => void;
  onShare: () => void;
}

const ServiceHero: React.FC<ServiceHeroProps> = ({ 
  service,
  onWhatsAppRequest,
  onShare
}) => {
  const { t, dir } = useLanguage();
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <span className="inline-block bg-odoo-purple text-white px-3 py-1 text-sm rounded mb-4">
              {service.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-odoo-purple">
              {service.title}
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              {service.details}
            </p>
            <div className="flex flex-row gap-2 mt-auto sticky bottom-0 bg-white pt-3">
              <Button 
                onClick={onWhatsAppRequest}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded inline-flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-2 ml-reverse:rtl" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M11.999 1.98C6.47 1.98 1.98 6.47 1.98 12s4.49 10.02 10.02 10.02 10.02-4.49 10.02-10.02S17.53 1.98 11.999 1.98zm0 18.04C7.58 20.02 4 16.44 4 12s3.58-8.02 8-8.02 8 3.58 8 8.02c0 4.44-3.58 8.02-8 8.02z"/>
                </svg>
                {t('Request', 'طلب')}
              </Button>
              <Button 
                onClick={onShare}
                variant="outline"
              >
                <Share2 className="h-4 w-4 mr-2 ml-reverse:rtl" />
                {t('Share', 'مشاركة')}
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src={service.image} 
              alt={service.title} 
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
