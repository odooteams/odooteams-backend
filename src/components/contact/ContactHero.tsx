
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

const ContactHero: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="bg-gradient-hero text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('Contact Us', 'اتصل بنا')}
          </h1>
          <p className="text-xl opacity-90">
            {t(
              'Have questions or ready to start your Odoo journey? Reach out to us.',
              'لديك أسئلة أو مستعد لبدء رحلتك مع أودو؟ تواصل معنا.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
