import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';
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
  const { t, dir } = useLanguage();
  
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-muted-foreground">
          {t('No services found matching your criteria.', 'لم يتم العثور على خدمات تطابق معايير البحث.')}
        </h3>
      </div>
    );
  }

  const [featuredService, ...remainingServices] = services;
  
  return (
    <div className="space-y-12">
      {/* Featured Service - Large Hero Card */}
      <div className="group relative overflow-hidden rounded-2xl bg-card border shadow-lg hover:shadow-xl transition-all duration-500">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${dir === 'rtl' ? 'lg:flex-row-reverse' : ''}`}>
          {/* Image Section */}
          <div className="relative h-64 lg:h-[400px] overflow-hidden">
            <img
              src={featuredService.image || '/placeholder.svg'}
              alt={featuredService.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              {t('Featured', 'مميز')}
            </Badge>
          </div>
          
          {/* Content Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <Badge variant="outline" className="w-fit mb-4">
              {featuredService.category}
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
              {featuredService.title}
            </h2>
            <p className="text-muted-foreground mb-6 line-clamp-3 lg:line-clamp-4">
              {featuredService.details}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={`/services/${featuredService.id}`}>
                <Button className="gap-2">
                  {t('View Details', 'عرض التفاصيل')}
                  <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => onRequestViaWhatsApp(featuredService.title)}
              >
                <MessageCircle className="h-4 w-4" />
                {t('Request via WhatsApp', 'طلب عبر واتساب')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Services - 4 Cards Per Row Grid */}
      {remainingServices.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {t('More Services', 'المزيد من الخدمات')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-scale-in">
            {remainingServices.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                isGridView={true}
                onRequestViaWhatsApp={onRequestViaWhatsApp}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
