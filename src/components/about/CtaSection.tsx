
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

const CtaSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-odoo-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t('Ready to Transform Your Business?', 'هل أنت مستعد لتحويل عملك؟')}
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
          {t(
            'Contact us today to discuss how our Odoo expertise can help you achieve your business goals.',
            'اتصل بنا اليوم لمناقشة كيف يمكن لخبرتنا في أودو مساعدتك في تحقيق أهداف عملك.'
          )}
        </p>
        <a 
          href="/contact" 
          className="bg-white text-odoo-purple hover:bg-odoo-gold font-bold py-3 px-8 rounded-md inline-block shadow-lg transition duration-300"
        >
          {t('Get In Touch', 'تواصل معنا')}
        </a>
      </div>
    </section>
  );
};

export default CtaSection;
