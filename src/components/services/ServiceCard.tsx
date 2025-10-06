
import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import WhatsAppPopup from './WhatsAppPopup';
import ServiceCardContent from './ServiceCardContent';

interface ServiceCardProps {
  service: {
    id: number;
    category: string;
    title: string;
    details: string;
    image: string;
    gallery?: string[];
    cost?: string;
  };
  isGridView: boolean;
  onRequestViaWhatsApp: (service: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isGridView,
  onRequestViaWhatsApp
}) => {
  const { t, dir } = useLanguage();
  const [whatsappOpen, setWhatsappOpen] = useState(false);

  // Prefer image from gallery
  const galleryImage = service.gallery && service.gallery.length > 0
    ? service.gallery[0]
    : service.image;

  // WhatsApp send (popup) handler - open WhatsApp with prefilled message
  const handlePopupSend = (form: { name: string, phone: string, company: string, message: string }) => {
    try {
      const costStr = service.cost ? `\n${t('Cost', 'التكلفة')}: ${service.cost}` : '';
      const companyStr = form.company ? `\n${t('Company', 'الشركة')}: ${form.company}` : '';
      const msgStr = form.message ? `\n${t('Message', 'رسالتك')}: ${form.message}` : '';
      const waMsg =
        `${t('Service Request', 'طلب خدمة')}: ${service.title}\n` +
        `${t('Name', 'الاسم')}: ${form.name}\n` +
        `${t('Phone', 'الهاتف')}: ${form.phone}` +
        companyStr +
        costStr +
        msgStr;

      const encodedMsg = encodeURIComponent(waMsg);
      const whatsappUrl = `https://wa.me/201007419344?text=${encodedMsg}`;
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      // Fallback if popup blocked
      if (!newWindow || newWindow.closed) {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      console.warn('WhatsApp failed:', error);
      alert(`WhatsApp unavailable. Please call: +201007419344`);
    }
  };

  return (
    <>
      <div className="programming-element digital-glow">
        <ServiceCardContent
          service={service}
          isGridView={isGridView}
          galleryImage={galleryImage}
          onWhatsAppClick={() => setWhatsappOpen(true)}
        />
      </div>
      <WhatsAppPopup
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        serviceName={service.title}
        cost={service.cost || ''}
        onSend={handlePopupSend}
      />
    </>
  );
};

export default ServiceCard;
