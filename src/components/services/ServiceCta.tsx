
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';

interface ServiceCtaProps {
  onWhatsAppRequest: () => void;
}

const ServiceCta: React.FC<ServiceCtaProps> = ({ onWhatsAppRequest }) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-odoo-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t('Ready to get started?', 'هل أنت مستعد للبدء؟')}
        </h2>
        <p className="text-lg mb-8 opacity-90">
          {t('Contact us today to discuss how we can help with your Odoo implementation needs.', 'اتصل بنا اليوم لمناقشة كيف يمكننا المساعدة في احتياجات تنفيذ أودو الخاصة بك.')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={onWhatsAppRequest}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <svg className="w-5 h-5 mr-2 ml-reverse:rtl" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.999 1.98C6.47 1.98 1.98 6.47 1.98 12s4.49 10.02 10.02 10.02 10.02-4.49 10.02-10.02S17.53 1.98 11.999 1.98zm0 18.04C7.58 20.02 4 16.44 4 12s3.58-8.02 8-8.02 8 3.58 8 8.02c0 4.44-3.58 8.02-8 8.02z"/>
            </svg>
            {t('Request via WhatsApp', 'طلب عبر واتساب')}
          </Button>
          <Link to="/contact">
            <Button variant="outline" className="bg-white text-odoo-purple hover:bg-gray-100">
              {t('Contact Us', 'اتصل بنا')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceCta;
