import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import useWhatsAppShare from './useWhatsAppShare';
import { findServiceBySlug, createServiceSlug } from '@/lib/serviceUtils';
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

  const service = useMemo(() => {
    const empty = {
      id: '0', category: '', title: '', details: '', fullDescription: '',
      benefits: [] as string[], process: [] as ProcessStep[], image: '/placeholder.svg', gallery: [] as string[],
    };
    if (!slug || isLoading || rawServices.length === 0) return empty;

    // Match slug against both English and Arabic titles
    const raw = rawServices.find((s: any) =>
      createServiceSlug(s.title_en) === slug || createServiceSlug(s.title_ar) === slug
    );
    if (!raw) return empty;

    const title = language === 'ar' ? raw.title_ar : raw.title_en;
    const category = language === 'ar' ? raw.category_ar : raw.category_en;
    const details = language === 'ar' ? raw.details_ar : raw.details_en;
    const processingSteps = language === 'ar' ? raw.processing_steps_ar : raw.processing_steps_en;
    const seo_title = language === 'ar' ? raw.seo_title_ar : raw.seo_title_en;
    const seo_description = language === 'ar' ? raw.seo_description_ar : raw.seo_description_en;
    const seo_keywords = language === 'ar' ? raw.seo_keywords_ar : raw.seo_keywords_en;
    const galleryImages: string[] = [];

    return {
      id: raw.id,
      category,
      title,
      details,
      fullDescription: details,
      benefits: [],
      process: [],
      image: raw.image || '/placeholder.svg',
      gallery: galleryImages.length > 0 ? galleryImages : [raw.image].filter(Boolean),
      processingSteps,
      seo_title: seo_title || '',
      seo_description: seo_description || '',
      seo_keywords: seo_keywords || '',
    };
  }, [slug, isLoading, rawServices, language]);
  
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
