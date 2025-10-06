
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

const AboutHero = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-hero text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('About Us', 'من نحن')}
          </h1>
          <p className="text-xl opacity-90">
            {t(
              'We are a dedicated team of Odoo experts committed to your business success.',
              'نحن فريق متخصص من خبراء أودو ملتزمون بنجاح عملك.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
