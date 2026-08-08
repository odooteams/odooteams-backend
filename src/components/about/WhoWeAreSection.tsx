
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { CheckCircle } from 'lucide-react';
import { siteSettingsQueries } from '@/lib/supabase/queries';
import { Skeleton } from '@/components/ui/skeleton';

const WhoWeAreSection = () => {
  const { t, dir, language } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getContent = async () => {
      try {
        setLoading(true);
        const data = await siteSettingsQueries.getBySetting('about_who_we_are');
        
        if (data && data.setting_value) {
          setContent(data.setting_value);
        }
      } catch (err: any) {
        console.error('Error fetching who we are content:', err);
        // Fallback to default content
        setContent({
          title_en: 'Who We Are',
          title_ar: 'من نحن',
          description_en: 'OdooTeams is a specialized consultancy providing top-tier Odoo ERP solutions for businesses across various industries. With years of experience and a passion for excellence, our team ensures successful implementation and continued support for all your Odoo needs.',
          description_ar: 'أودو تيمز هي شركة استشارية متخصصة تقدم حلول أودو ERP عالية المستوى للشركات عبر مختلف الصناعات. بفضل سنوات من الخبرة وشغف بالتميز، يضمن فريقنا التنفيذ الناجح والدعم المستمر لجميع احتياجات أودو الخاصة بك.',
          image: '/uploads/e8433aef-9332-4de5-a325-42043909dbab.png',
          mission_title_en: 'Our Mission',
          mission_title_ar: 'مهمتنا',
          mission_en: 'To empower businesses with tailored Odoo solutions that streamline operations, enhance productivity, and drive growth.',
          mission_ar: 'تمكين الشركات بحلول أودو المخصصة التي تبسط العمليات، وتعزز الإنتاجية، وتدفع النمو.',
          vision_title_en: 'Our Vision',
          vision_title_ar: 'رؤيتنا',
          vision_en: 'To be the leading Odoo solution provider in the region, recognized for excellence, innovation, and customer satisfaction.',
          vision_ar: 'أن نكون مزود حلول أودو الرائد في المنطقة، معروفين بالتميز والابتكار ورضا العملاء.',
          values_title_en: 'Our Values',
          values_title_ar: 'قيمنا',
          values_en: 'Excellence, integrity, innovation, collaboration, and customer-centricity guide everything we do.',
          values_ar: 'التميز، النزاهة، الابتكار، التعاون، والتركيز على العملاء توجه كل ما نقوم به.'
        });
      } finally {
        setLoading(false);
      }
    };

    getContent();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className={`${dir === 'rtl' ? 'lg:order-2' : ''}`}>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className={`${dir === 'rtl' ? 'lg:order-1' : ''}`}>
              <Skeleton className="h-10 w-48 mb-6" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className={`${dir === 'rtl' ? 'lg:order-2' : ''}`}>
            <img 
              src={content?.image || '/uploads/e8433aef-9332-4de5-a325-42043909dbab.png'} 
              alt={language === 'ar' ? content?.title_ar : content?.title_en} 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
          
          <div className={`${dir === 'rtl' ? 'lg:order-1' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-odoo-purple mb-6">
              {language === 'ar' ? content?.title_ar : content?.title_en}
            </h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              {language === 'ar' ? content?.description_ar : content?.description_en}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex">
                <div className="mr-4 ml-reverse:rtl text-odoo-magenta">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-odoo-purple mb-2">
                    {language === 'ar' ? content?.mission_title_ar : content?.mission_title_en}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? content?.mission_ar : content?.mission_en}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 ml-reverse:rtl text-odoo-magenta">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-odoo-purple mb-2">
                    {language === 'ar' ? content?.vision_title_ar : content?.vision_title_en}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? content?.vision_ar : content?.vision_en}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 ml-reverse:rtl text-odoo-magenta">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-odoo-purple mb-2">
                    {language === 'ar' ? content?.values_title_ar : content?.values_title_en}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? content?.values_ar : content?.values_en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;
