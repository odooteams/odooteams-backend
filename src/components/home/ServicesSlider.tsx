import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServiceSheet } from '@/hooks/useServiceSheet';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { createServiceSlug } from '@/lib/serviceUtils';

const ServicesSlider = () => {
  const { t, language, dir } = useLanguage();
  const { services, isLoading, error } = useServiceSheet();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <section className={`py-16 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  return (
    <section className={`py-16 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="section-title animate-slide-up">{t('Our Services', 'خدماتنا')}</h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            {t(
              'We provide end-to-end Odoo services to help your business achieve operational excellence.',
              'نقدم خدمات أودو الشاملة لمساعدة عملك على تحقيق التميز التشغيلي.'
            )}
          </p>
        </div>

        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
            direction: dir === 'rtl' ? 'rtl' : 'ltr',
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {services.map((service) => (
              <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-full">
                <div className="card p-6 h-full hover:border-l-4 hover:border-primary transition-all duration-300 animate-scale-in hover:animate-pulse-glow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {service.image && (
                      <div className="md:w-2/5 flex-shrink-0">
                        <img 
                          src={service.image} 
                          alt={service.title}
                          className="w-full h-48 md:h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-3 text-primary">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-4">
                          {service.details}
                        </p>
                      </div>
                      <Link 
                        to={`/services/${createServiceSlug(service.title)}`} 
                        className="inline-flex items-center font-medium text-primary hover:text-primary/80 transition-colors w-fit"
                      >
                        {t('Learn more', 'اعرف المزيد')}
                        <Arrow className="ml-2 mr-reverse:rtl h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="text-center mt-10">
          <Link 
            to="/services" 
            className="btn-primary inline-flex items-center"
          >
            {t('View All Services', 'عرض جميع الخدمات')}
            <Arrow className="ml-2 mr-reverse:rtl h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSlider;
