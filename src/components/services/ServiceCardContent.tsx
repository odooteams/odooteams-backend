import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ServiceImageBadges from './ServiceImageBadges';
import { createServiceSlug } from '@/lib/serviceUtils';

interface Service {
  id: number;
  category: string;
  title: string;
  details: string;
  image: string;
  gallery?: string[];
  cost?: string;
}

interface ServiceCardContentProps {
  service: Service;
  isGridView: boolean;
  galleryImage: string;
  onWhatsAppClick: () => void;
}

const ServiceCardContent: React.FC<ServiceCardContentProps> = ({
  service,
  isGridView,
  galleryImage,
  onWhatsAppClick
}) => {
  const { t } = useLanguage();

  const WhatsAppIcon = () => (
    <svg className="w-4 h-4 mr-2 ml-reverse:rtl" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M11.999 1.98C6.47 1.98 1.98 6.47 1.98 12s4.49 10.02 10.02 10.02 10.02-4.49 10.02-10.02S17.53 1.98 11.999 1.98zm0 18.04C7.58 20.02 4 16.44 4 12s3.58-8.02 8-8.02 8 3.58 8 8.02c0 4.44-3.58 8.02-8 8.02z"/>
    </svg>
  );

  if (isGridView) {
    return (
      <Card className="overflow-hidden group flex flex-col h-full">
        <div className="relative">
          <Link to={`/services/${createServiceSlug(service.title)}`} className="block relative h-48">
            <img
              src={galleryImage}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <ServiceImageBadges category={service.category} cost={service.cost} />
          </Link>
        </div>
        <CardHeader>
          {service.cost && (
            <div className="mb-2">
              <span className="inline-block bg-gradient-to-r from-odoo-purple via-orange-400 to-odoo-magenta text-white px-4 py-1 rounded-full font-bold text-sm">
                {service.cost}
              </span>
            </div>
          )}
          <Link to={`/services/${createServiceSlug(service.title)}`} className="block">
            <CardTitle className="text-xl text-odoo-purple group-hover:text-odoo-magenta transition-colors">
              {service.title}
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-600 line-clamp-3">
            {service.details}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-2 mt-auto border-t pt-3 sticky bottom-0 bg-card px-4">
          <Button variant="outline" asChild className="flex-1 max-w-32">
            <Link to={`/services/${createServiceSlug(service.title)}`}>
              {t('View Details', 'عرض التفاصيل')}
            </Link>
          </Button>
          <Button 
            onClick={onWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white flex-1 max-w-32"
          >
            <WhatsAppIcon />
            {t('WhatsApp', 'واتساب')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // List view
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-1/3 relative">
          <Link to={`/services/${createServiceSlug(service.title)}`} className="block h-64 md:h-full">
            <img
              src={galleryImage}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <ServiceImageBadges category={service.category} cost={service.cost} />
          </Link>
        </div>
        <div className="md:w-2/3 flex flex-col h-full">
          <CardHeader>
            {service.cost && (
              <div className="mb-2">
                <span className="inline-block bg-gradient-to-r from-odoo-purple via-orange-400 to-odoo-magenta text-white px-4 py-1 rounded-full font-bold text-sm">
                  {service.cost}
                </span>
              </div>
            )}
            <Link to={`/services/${createServiceSlug(service.title)}`} className="block">
              <CardTitle className="text-2xl text-odoo-purple hover:text-odoo-magenta transition-colors">
                {service.title}
              </CardTitle>
            </Link>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-600">
              {service.details}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center flex-wrap gap-3 mt-auto border-t pt-3 px-4">
            <Button variant="outline" asChild>
              <Link to={`/services/${createServiceSlug(service.title)}`}>
                {t('View Details', 'عرض التفاصيل')}
              </Link>
            </Button>
            <Button 
              onClick={onWhatsAppClick} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <WhatsAppIcon />
              {t('Request via WhatsApp', 'طلب عبر واتساب')}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCardContent;
