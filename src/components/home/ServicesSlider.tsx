import React, { useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicesQueries } from '@/lib/supabase/queries';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { createServiceSlug } from '@/lib/serviceUtils';

const ServicesSlider = () => {
  const { t, language, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const { data: rawServices = [], isLoading, error } = useQuery({
    queryKey: ['services', language],
    queryFn: () => servicesQueries.getAll(language),
  });

  const services = useMemo(() => 
    rawServices.map((s: any) => ({
      id: s.id,
      title: language === 'ar' ? s.title_ar : s.title_en,
      category: language === 'ar' ? s.category_ar : s.category_en,
      details: language === 'ar' ? s.details_ar : s.details_en,
      image: s.image,
      price: s.price,
      duration: s.duration,
    })), 
  [rawServices, language]);

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
    <section className={`py-20 bg-muted/30 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 animate-fade-in">
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
          plugins={[plugin.current as any]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
            direction: dir === 'rtl' ? 'rtl' : 'ltr',
          }}
        >
          <CarouselContent className="-ml-4">
            {services.map((service) => (
              <CarouselItem key={service.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="card p-0 h-full flex flex-col bg-card border border-border/50 hover:border-primary/50 transition-all duration-300">
                  {service.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-3 text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {service.details}
                    </p>
                    <Link 
                      to={`/services/${createServiceSlug(service.title)}`} 
                      className="inline-flex items-center font-medium text-primary hover:text-primary/80 transition-colors w-fit"
                    >
                      {t('Learn more', 'اعرف المزيد')}
                      <Arrow className="ml-2 mr-reverse:rtl h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>

        <div className="text-center mt-12">
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
