
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { siteSettingsQueries } from '@/lib/supabase/queries';
import { Skeleton } from '@/components/ui/skeleton';

const CtaSection = () => {
  const { t, language } = useLanguage();
  const [ctaData, setCtaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCtaData = async () => {
      try {
        setLoading(true);
        const data = await siteSettingsQueries.getBySetting('about_cta');
        
        if (data && data.setting_value) {
          setCtaData(data.setting_value);
        }
      } catch (err: any) {
        console.error('Error fetching CTA data:', err);
        // Fallback to default content
        setCtaData({
          title_en: 'Ready to Transform Your Business?',
          title_ar: 'هل أنت مستعد لتحويل عملك؟',
          description_en: 'Contact us today to discuss how our Odoo expertise can help you achieve your business goals.',
          description_ar: 'اتصل بنا اليوم لمناقشة كيف يمكن لخبرتنا في أودو مساعدتك في تحقيق أهداف عملك.',
          button_text_en: 'Get In Touch',
          button_text_ar: 'تواصل معنا',
          button_link: '/contact'
        });
      } finally {
        setLoading(false);
      }
    };

    getCtaData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-odoo-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-12 w-96 mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-8 w-[600px] mx-auto mb-8 bg-white/20" />
          <Skeleton className="h-12 w-40 mx-auto bg-white/20" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-odoo-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {language === 'ar' ? ctaData?.title_ar : ctaData?.title_en}
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
          {language === 'ar' ? ctaData?.description_ar : ctaData?.description_en}
        </p>
        <a 
          href={ctaData?.button_link || '/contact'}
          className="bg-white text-odoo-purple hover:bg-odoo-gold font-bold py-3 px-8 rounded-md inline-block shadow-lg transition duration-300"
        >
          {language === 'ar' ? ctaData?.button_text_ar : ctaData?.button_text_en}
        </a>
      </div>
    </section>
  );
};

export default CtaSection;
