import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useSlider } from '@/hooks/useSlider';
import Autoplay from "embla-carousel-autoplay";

const HeroSection = () => {
  const { t, dir } = useLanguage();
  const { sliderData, loading, error } = useSlider();
  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Fallback data when loading or error
  const fallbackData = {
    title_en: 'Transform Your Business',
    title_ar: 'حول عملك',
    subtitle_en: 'Expert implementation, training, and development services that drive growth and efficiency for your enterprise.',
    subtitle_ar: 'خدمات التنفيذ والتدريب والتطوير المتخصصة التي تدفع النمو والكفاءة لمؤسستك.',
    main_image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&h=600',
    image1_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=300',
    image2_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=300',
    image3_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&h=300',
    image4_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&h=300',
    image5_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=300',
    image6_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&h=300'
  };

  // Combine slider data with fallback
  const allSlides = sliderData.length > 0 ? sliderData : [fallbackData];
  
  const getGridImages = (slide: any) => [
    slide.image1_url,
    slide.image2_url,
    slide.image3_url,
    slide.image4_url,
    slide.image5_url,
    slide.image6_url
  ].filter(img => img && img.trim() !== '');
  return <section className="relative overflow-hidden min-h-[100svh] flex items-center">
      {/* Enhanced gradient background with overlay */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Floating geometric shapes - hidden on mobile for performance */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse hidden md:block"></div>
      <div className="absolute bottom-40 right-20 w-24 h-24 bg-odoo-gold/10 rounded-full blur-2xl animate-pulse hidden md:block" style={{
      animationDelay: '1s'
    }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-odoo-pink/10 rounded-full blur-xl animate-pulse hidden md:block" style={{
      animationDelay: '2s'
    }}></div>
      
      {/* Carousel Container */}
      <Carousel 
        className="w-full h-full"
        plugins={[autoplayPlugin.current]}
        onMouseEnter={autoplayPlugin.current.stop}
        onMouseLeave={autoplayPlugin.current.reset}
      >
        <CarouselContent>
          {allSlides.map((slide, slideIndex) => {
            const gridImages = getGridImages(slide);
            return (
              <CarouselItem key={slideIndex}>
                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-16 lg:py-20 relative z-10 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                    <div className={`text-white space-y-5 md:space-y-10 ${dir === 'rtl' ? 'lg:order-2' : ''}`}>
                      {/* Premium Badge */}
                      <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-2xl animate-fade-in">
                        <div className="w-2 h-2 bg-odoo-gold rounded-full mr-2 md:mr-3 animate-pulse"></div>
                        <span className="text-xs md:text-sm font-semibold text-odoo-gold tracking-wide">✨ {t('Premium Odoo Solutions', 'حلول أودو المتميزة')}</span>
                      </div>
                      
                      {/* Main Heading */}
                      <div className="space-y-6">
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.15] animate-fade-in tracking-tight" style={{
                          animationDelay: '0.1s'
                        }}>
                          <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                            {t(slide.title_en, slide.title_ar)}
                          </span>
                          <br />
                          <span className="bg-gradient-to-r from-odoo-gold to-yellow-300 bg-clip-text text-transparent">
                            {t('with Odoo Excellence', 'بتميز أودو')}
                          </span>
                        </h1>
                        
                        <p className="text-base md:text-xl lg:text-2xl leading-relaxed text-white/80 max-w-2xl animate-fade-in font-light" style={{
                          animationDelay: '0.2s'
                        }}>
                          {t(slide.subtitle_en, slide.subtitle_ar)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-6 pt-3 md:pt-6 animate-fade-in" style={{
                        animationDelay: '0.4s'
                      }}>
                        <Link to="/services" className="group relative bg-gradient-to-r from-odoo-gold to-yellow-400 hover:from-yellow-300 hover:to-odoo-gold text-odoo-purple font-bold py-3.5 md:py-5 px-6 md:px-10 rounded-xl md:rounded-2xl shadow-2xl hover:shadow-odoo-gold/30 transition-all duration-500 flex items-center justify-center transform hover:scale-[1.02] hover:-translate-y-2">
                          <span className="relative z-10 text-sm md:text-lg">{t('Explore Services', 'استكشف الخدمات')}</span>
                          <Arrow className="ml-3 md:ml-4 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-white/30 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </Link>
                        
                        <Link to="/contact" className="group relative bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-white font-bold py-3.5 md:py-5 px-6 md:px-10 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 flex items-center justify-center transform hover:scale-[1.02] hover:-translate-y-2">
                          <span className="relative z-10 text-sm md:text-lg">{t('Get Started', 'ابدأ الآن')}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </Link>
                      </div>
                      
                      {/* Enhanced Stats */}
                      <div className="flex items-center justify-between md:justify-start gap-4 md:gap-10 pt-6 md:pt-10 animate-fade-in" style={{
                        animationDelay: '0.6s'
                      }}>
                        <div className="text-center group">
                          <div className="text-2xl md:text-4xl font-bold text-odoo-gold mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">200+</div>
                          <div className="text-[10px] md:text-sm text-white/60 uppercase tracking-wider font-medium">{t('Projects', 'مشاريع')}</div>
                        </div>
                        <div className="w-px h-10 md:h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                        <div className="text-center group">
                          <div className="text-2xl md:text-4xl font-bold text-odoo-gold mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
                          <div className="text-[10px] md:text-sm text-white/60 uppercase tracking-wider font-medium">{t('Clients', 'عملاء')}</div>
                        </div>
                        <div className="w-px h-10 md:h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                        <div className="text-center group">
                          <div className="text-2xl md:text-4xl font-bold text-odoo-gold mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300">5+</div>
                          <div className="text-[10px] md:text-sm text-white/60 uppercase tracking-wider font-medium">{t('Years', 'سنوات')}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Professional Hero Image - hidden on mobile for cleaner layout */}
                    <div className={`${dir === 'rtl' ? 'lg:order-1' : ''} hidden lg:flex justify-center relative`}>
                      <div className="relative w-full max-w-2xl">
                        {/* Enhanced background effects */}
                        <div className="absolute -inset-8 bg-gradient-to-r from-odoo-gold/15 via-odoo-pink/15 to-odoo-purple/15 rounded-[3rem] blur-3xl animate-pulse"></div>
                        <div className="absolute -inset-4 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl backdrop-blur-sm"></div>
                        
                        {/* Main Image Container */}
                        <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in" style={{
                          animationDelay: '0.3s'
                        }}>
                          <div className="absolute inset-0 bg-gradient-to-br from-odoo-purple/20 via-transparent to-odoo-gold/20 z-10"></div>
                          <img 
                            src={slide.main_image_url} 
                            alt={t('Professional ERP Solutions', 'حلول تخطيط موارد المؤسسة المهنية')}
                            className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
                          />
                          {/* Floating elements */}
                          <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md rounded-2xl p-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
                            <div className="w-12 h-12 bg-odoo-gold/80 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-lg">ERP</span>
                            </div>
                          </div>
                          <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-md rounded-2xl p-6 animate-fade-in" style={{animationDelay: '1s'}}>
                            <div className="text-white">
                              <div className="text-2xl font-bold">99%</div>
                              <div className="text-sm opacity-80">{t('Success Rate', 'معدل النجاح')}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-odoo-gold/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
                        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-odoo-pink/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ERP/App Systems Images Grid */}
                  <div className="mt-8 md:mt-20 mb-8 md:mb-16">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 opacity-80">
                      {gridImages.map((src, index) => (
                        <div key={index} className="relative group overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 animate-fade-in hover:scale-110 hover:-translate-y-2" style={{
                          animationDelay: `${0.8 + index * 0.1}s`
                        }}>
                          <img src={src} alt={`ERP System ${index + 1}`} className="w-full h-24 md:h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-odoo-purple/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation Controls */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white" />
      </Carousel>
      
      {/* Professional Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-[60px] md:h-[80px] lg:h-[100px]" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          <path 
            d="M0,0 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" 
            fill="currentColor"
            className="text-background"
          />
          <path 
            d="M0,20 C150,100 350,20 600,80 C850,140 1050,20 1200,80 L1200,120 L0,120 Z" 
            fill="url(#waveGradient)"
            opacity="0.6"
          />
          <path 
            d="M0,40 C150,80 350,40 600,100 C850,160 1050,40 1200,100 L1200,120 L0,120 Z" 
            fill="url(#waveGradient)"
            opacity="0.3"
          />
        </svg>
      </div>
    </section>;
};
export default HeroSection;