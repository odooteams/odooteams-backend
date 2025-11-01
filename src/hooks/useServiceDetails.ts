import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import useWhatsAppShare from './useWhatsAppShare';
import { findServiceBySlug } from '@/lib/serviceUtils';
import { useQuery } from '@tanstack/react-query';
import { servicesQueries } from '@/lib/supabase/queries';

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceDetails {
  id: string;
  category: string;
  title: string;
  details: string;
  fullDescription: string;
  benefits: string[];
  process: ProcessStep[];
  image: string;
  gallery: string[];
  processingSteps?: string;
}

export const useServiceDetails = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();

  const { data: rawServices = [], isLoading, error } = useQuery({
    queryKey: ['services', language],
    queryFn: () => servicesQueries.getAll(language),
  });

  const services = useMemo(() => 
    rawServices.map((s: any) => ({
      id: s.id,
      title: language === 'ar' ? s.title_ar : s.title_en,
      category: language === 'ar' ? s.category_ar : s.category_en,
      details: language === 'ar' ? s.details_ar : s.details_en,
      processingSteps: language === 'ar' ? s.processing_steps_ar : s.processing_steps_en,
      image: s.image,
      gallery: s.images || [],
      benefits: [],
      process: [],
    })), 
  [rawServices, language]);

  const service = useMemo(() => {
    if (!slug || isLoading || services.length === 0) {
      return {
        id: '0',
        category: '',
        title: '',
        details: '',
        fullDescription: '',
        benefits: [],
        process: [],
        image: '/placeholder.svg',
        gallery: []
      };
    }

    const foundService = findServiceBySlug(services, slug);
    
    if (foundService) {
      const galleryImages = (foundService.gallery || [])
        .filter((img: string) => img && img.trim() !== '');
        
      return {
        id: foundService.id,
        category: foundService.category,
        title: foundService.title,
        details: foundService.details,
        fullDescription: foundService.details,
        benefits: foundService.benefits || [],
        process: foundService.process || [],
        image: foundService.image || '/placeholder.svg',
        gallery: galleryImages.length > 0 ? galleryImages : [foundService.image].filter(Boolean),
        processingSteps: foundService.processingSteps,
      };
    }

    return {
      id: '0',
      category: '',
      title: '',
      details: '',
      fullDescription: '',
      benefits: [],
      process: [],
      image: '/placeholder.svg',
      gallery: []
    };
  }, [slug, isLoading, services]);
  
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
