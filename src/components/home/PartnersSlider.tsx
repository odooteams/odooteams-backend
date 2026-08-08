import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Partner } from '@/lib/supabase/types';
import { useLanguage } from '@/lib/LanguageContext';

export function PartnersSlider() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('partners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPartners(data as Partner[]);
        }
      } catch (err) {
        console.error('Error fetching partners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading || partners.length === 0) return null;

  // Duplicate items to create infinite scroll effect
  const sliderItems = [...partners, ...partners];

  return (
    <section className="py-16 bg-white overflow-hidden border-t">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl font-bold text-odoo-purple mb-4">
          {t('Our Partners', 'شركاؤنا')}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t(
            'We collaborate with industry leaders to deliver the best solutions.',
            'نتعاون مع رواد الصناعة لتقديم أفضل الحلول.'
          )}
        </p>
      </div>

      <div className="relative w-full flex items-center">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>

        <div className="flex w-full overflow-hidden" dir="ltr">
          <div className="flex w-max animate-scroll hover:[animation-play-state:paused]" style={{ gap: '4rem' }}>
            {sliderItems.map((partner, index) => (
              <div 
                key={`${partner.id}-${index}`} 
                className="flex flex-col items-center justify-center min-w-[150px] md:min-w-[200px] transition-all duration-300 hover:scale-105"
              >
                {partner.website_url ? (
                  <a href={partner.website_url} target="_blank" rel="noreferrer" className="flex flex-col items-center">
                    <PartnerContent partner={partner} language={language} />
                  </a>
                ) : (
                  <div className="flex flex-col items-center">
                    <PartnerContent partner={partner} language={language} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
}

function PartnerContent({ partner, language }: { partner: Partner, language: string }) {
  return (
    <>
      {partner.logo_url ? (
        <img 
          src={partner.logo_url} 
          alt={language === 'ar' ? partner.name_ar : partner.name_en} 
          className="h-16 md:h-20 object-contain mb-3"
        />
      ) : (
        <div className="h-16 md:h-20 w-32 bg-gray-100 rounded flex items-center justify-center mb-3 text-gray-400">
          No Logo
        </div>
      )}
      <span className="text-sm font-medium text-gray-700">
        {language === 'ar' ? partner.name_ar : partner.name_en}
      </span>
    </>
  );
}
