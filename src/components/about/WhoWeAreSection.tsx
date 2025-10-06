
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { CheckCircle } from 'lucide-react';

const WhoWeAreSection = () => {
  const { t, dir } = useLanguage();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className={`${dir === 'rtl' ? 'lg:order-2' : ''}`}>
            <img 
              src="/lovable-uploads/e8433aef-9332-4de5-a325-42043909dbab.png" 
              alt={t('About OdooTeams', 'عن أودو تيمز')} 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
          
          <div className={`${dir === 'rtl' ? 'lg:order-1' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-odoo-purple mb-6">
              {t('Who We Are', 'من نحن')}
            </h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              {t(
                'OdooTeams is a specialized consultancy providing top-tier Odoo ERP solutions for businesses across various industries. With years of experience and a passion for excellence, our team ensures successful implementation and continued support for all your Odoo needs.',
                'أودو تيمز هي شركة استشارية متخصصة تقدم حلول أودو ERP عالية المستوى للشركات عبر مختلف الصناعات. بفضل سنوات من الخبرة وشغف بالتميز، يضمن فريقنا التنفيذ الناجح والدعم المستمر لجميع احتياجات أودو الخاصة بك.'
              )}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex">
                <div className="mr-4 ml-reverse:rtl text-odoo-magenta">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-odoo-purple mb-2">{t('Our Mission', 'مهمتنا')}</h3>
                  <p className="text-gray-600">
                    {t(
                      'To empower businesses with tailored Odoo solutions that streamline operations, enhance productivity, and drive growth.',
                      'تمكين الشركات بحلول أودو المخصصة التي تبسط العمليات، وتعزز الإنتاجية، وتدفع النمو.'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 ml-reverse:rtl text-odoo-magenta">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-odoo-purple mb-2">{t('Our Vision', 'رؤيتنا')}</h3>
                  <p className="text-gray-600">
                    {t(
                      'To be the leading Odoo solution provider in the region, recognized for excellence, innovation, and customer satisfaction.',
                      'أن نكون مزود حلول أودو الرائد في المنطقة، معروفين بالتميز والابتكار ورضا العملاء.'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 ml-reverse:rtl text-odoo-magenta">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-odoo-purple mb-2">{t('Our Values', 'قيمنا')}</h3>
                  <p className="text-gray-600">
                    {t(
                      'Excellence, integrity, innovation, collaboration, and customer-centricity guide everything we do.',
                      'التميز، النزاهة، الابتكار، التعاون، والتركيز على العملاء توجه كل ما نقوم به.'
                    )}
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
