
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import useWhatsAppShare from './useWhatsAppShare';
import { useServiceSheet } from './useServiceSheet';
import { findServiceBySlug } from '@/lib/serviceUtils';

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceDetails {
  id: number;
  category: string;
  title: string;
  details: string;
  fullDescription: string;
  benefits: string[];
  process: ProcessStep[];
  image: string;
  gallery: string[];
}

export const useServiceDetails = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();
  const { services, isLoading, error } = useServiceSheet();
  const [service, setService] = useState<ServiceDetails>({
    id: 0,
    category: '',
    title: '',
    details: '',
    fullDescription: '',
    benefits: [],
    process: [],
    image: '/placeholder.svg',
    gallery: []
  });

  useEffect(() => {
    if (!isLoading && services.length > 0) {
      const foundService = findServiceBySlug(services, slug || "");
      
      if (foundService) {
        // Extract gallery images, ensuring they exist
        const galleryImages = (foundService.gallery || [])
          .filter(img => img && img.trim() !== '');
            
        // Create a full service object with all details
        setService({
          id: foundService.id,
          category: foundService.category,
          title: foundService.title,
          details: foundService.details,
          fullDescription: foundService.details, // Using details as full description since it's already localized
          benefits: foundService.benefits || [],
          process: foundService.process || [],
          image: foundService.image || '/placeholder.svg',
          gallery: galleryImages.length > 0 ? galleryImages : [foundService.image].filter(Boolean)
        });
      }
    }
  }, [slug, isLoading, services, language]);
  
  // Handle WhatsApp request
  const handleWhatsAppRequest = () => {
    requestServiceViaWhatsApp(service.title);
  };
  
  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.details,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert(t('Link copied to clipboard!', 'تم نسخ الرابط إلى الحافظة!'));
    }
  };

  return {
    service,
    isLoading,
    error,
    handleWhatsAppRequest,
    handleShare
  };
};
