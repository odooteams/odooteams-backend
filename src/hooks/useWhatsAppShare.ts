
import { useLanguage } from '@/lib/LanguageContext';

interface UseWhatsAppShareOptions {
  phoneNumber?: string;
  defaultMessage?: string;
}

const useWhatsAppShare = (options: UseWhatsAppShareOptions = {}) => {
  const { t } = useLanguage();
  const phoneNumber = options.phoneNumber || '201007419344'; // Default phone number
  const defaultMessage = options.defaultMessage || '';

  /**
   * Share to WhatsApp with a custom message
   * @param message - The message to share (will use defaultMessage if not provided)
   * @returns void
   */
  const shareToWhatsApp = (message?: string) => {
    try {
      const textToShare = encodeURIComponent(message || defaultMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${textToShare}`;
      
      // Try opening WhatsApp directly
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      // Fallback if popup blocked
      if (!newWindow || newWindow.closed) {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      console.warn('WhatsApp share failed:', error);
      // Fallback to copying phone number
      navigator.clipboard?.writeText(phoneNumber);
      alert(`WhatsApp unavailable. Phone: ${phoneNumber}`);
    }
  };

  /**
   * Request a service via WhatsApp
   * @param serviceName - The name of the service to request
   * @returns void
   */
  const requestServiceViaWhatsApp = (serviceName: string) => {
    try {
      const message = encodeURIComponent(
        t(`I'm interested in your service: ${serviceName}`, `أنا مهتم بخدمتك: ${serviceName}`)
      );
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed) {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      console.warn('WhatsApp request failed:', error);
      navigator.clipboard?.writeText(phoneNumber);
      alert(`WhatsApp unavailable. Phone: ${phoneNumber}`);
    }
  };

  /**
   * Contact via WhatsApp without a specific message
   * @returns void
   */
  const contactViaWhatsApp = () => {
    try {
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed) {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      console.warn('WhatsApp contact failed:', error);
      navigator.clipboard?.writeText(phoneNumber);
      alert(`WhatsApp unavailable. Phone: ${phoneNumber}`);
    }
  };

  return {
    shareToWhatsApp,
    requestServiceViaWhatsApp,
    contactViaWhatsApp
  };
};

export default useWhatsAppShare;
