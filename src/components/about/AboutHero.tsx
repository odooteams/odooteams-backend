
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { siteSettingsQueries } from '@/lib/supabase/queries';
import { Skeleton } from '@/components/ui/skeleton';

const AboutHero = () => {
  const { t, language } = useLanguage();
  const [heroData, setHeroData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHeroData = async () => {
      try {
        setLoading(true);
        const data = await siteSettingsQueries.getBySetting('about_hero');
        
        if (data && data.setting_value) {
          setHeroData(data.setting_value);
        }
      } catch (err: any) {
        console.error('Error fetching hero data:', err);
        // Fallback to default content
        setHeroData({
          title_en: 'About Us',
          title_ar: 'من نحن',
          subtitle_en: 'We are a dedicated team of Odoo experts committed to your business success.',
          subtitle_ar: 'نحن فريق متخصص من خبراء أودو ملتزمون بنجاح عملك.'
        });
      } finally {
        setLoading(false);
      }
    };

    getHeroData();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Skeleton className="h-12 w-64 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-8 w-96 mx-auto bg-white/20" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-hero text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'ar' ? heroData?.title_ar : heroData?.title_en}
          </h1>
          <p className="text-xl opacity-90">
            {language === 'ar' ? heroData?.subtitle_ar : heroData?.subtitle_en}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
