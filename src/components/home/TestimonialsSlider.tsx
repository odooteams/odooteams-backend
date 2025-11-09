
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useLanguage } from '@/lib/LanguageContext';
import { User, Quote, Star } from 'lucide-react';
import { testimonialsQueries } from '@/lib/supabase/queries';

const TestimonialsSlider = () => {
  const { t, dir, language } = useLanguage();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const getTestimonials = async () => {
      try {
        setLoading(true);
        const data = await testimonialsQueries.getFeatured();
        setTestimonials(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(t('Failed to load testimonials. Please try again later.', 
                   'فشل في تحميل التوصيات. يرجى المحاولة مرة أخرى في وقت لاحق.'));
      } finally {
        setLoading(false);
      }
    };
    
    getTestimonials();
  }, [t]);

  if (loading) {
    return (
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="section-title">{t('What Our Clients Say', 'ماذا يقول عملاؤنا')}</h2>
            <p className="section-subtitle">
              {t('Hear from businesses that have transformed with our Odoo solutions', 'استمع إلى الشركات التي تحولت مع حلول أودو الخاصة بنا')}
            </p>
          </div>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-odoo-magenta"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="section-title">{t('What Our Clients Say', 'ماذا يقول عملاؤنا')}</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  // Sort testimonials by date (most recent first)
  const sortedTestimonials = [...testimonials].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="section-title animate-slide-up">{t('What Our Clients Say', 'ماذا يقول عملاؤنا')}</h2>
          <p className="section-subtitle">
            {t('Hear from businesses that have transformed with our Odoo solutions', 'استمع إلى الشركات التي تحولت مع حلول أودو الخاصة بنا')}
          </p>
        </div>

        <div className="relative px-10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {sortedTestimonials.map((testimonial, index) => {
                const name = language === 'ar' ? testimonial.client_name_ar : testimonial.client_name_en;
                const position = language === 'ar' ? testimonial.position_ar : testimonial.position_en;
                const company = language === 'ar' ? testimonial.company_ar : testimonial.company_en;
                const testimonialText = language === 'ar' ? testimonial.testimonial_ar : testimonial.testimonial_en;
                const rating = testimonial.rating || 5;
                
                return (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border border-gray-200 hover:border-odoo-magenta transition-colors animate-scale-in seo-highlight"
                          style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Quote className="h-6 w-6 text-odoo-magenta marketing-icon" />
                          <div className="flex flex-col">
                            <div className="flex mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className="h-4 w-4" 
                                  fill={i < rating ? "#FFC107" : "none"} 
                                  stroke={i < rating ? "#FFC107" : "#CBD5E1"} 
                                />
                              ))}
                            </div>
                            <span className={`text-xs text-gray-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                              {new Date(testimonial.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-4">
                        <p className="text-gray-700 mb-4 line-clamp-4">{testimonialText}</p>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 pt-4 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-odoo-purple/10 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-odoo-purple" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{name}</h4>
                          <p className="text-xs text-gray-500">
                            {position}{company ? ` - ${company}` : ''}
                          </p>
                        </div>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className={`${dir === 'rtl' ? '-right-12' : '-left-12'} lg:flex`} />
            <CarouselNext className={`${dir === 'rtl' ? '-left-12' : '-right-12'} lg:flex`} />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
