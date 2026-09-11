import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const HOMEPAGE_CONTENT_KEY = 'homepage_content';

export interface HomepageContent {
  hero_highlight_en: string;
  hero_highlight_ar: string;
  hero_cta_primary_en: string;
  hero_cta_primary_ar: string;
  hero_cta_primary_link: string;
  hero_cta_secondary_en: string;
  hero_cta_secondary_ar: string;
  hero_cta_secondary_link: string;
  stat_projects_value: string;
  stat_projects_en: string;
  stat_projects_ar: string;
  stat_clients_value: string;
  stat_clients_en: string;
  stat_clients_ar: string;
  stat_years_value: string;
  stat_years_en: string;
  stat_years_ar: string;
  footer_tagline_en: string;
  footer_tagline_ar: string;
  footer_copyright_en: string;
  footer_copyright_ar: string;
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero_highlight_en: 'with OdooTeams',
  hero_highlight_ar: 'مع فريق مطورين أودو',
  hero_cta_primary_en: 'Explore Our Services',
  hero_cta_primary_ar: 'استكشف خدماتنا',
  hero_cta_primary_link: '/services',
  hero_cta_secondary_en: 'Talk to an Expert',
  hero_cta_secondary_ar: 'تحدث إلى خبير',
  hero_cta_secondary_link: '/contact',
  stat_projects_value: '200+',
  stat_projects_en: 'Projects Delivered',
  stat_projects_ar: 'مشروع منجز',
  stat_clients_value: '50+',
  stat_clients_en: 'Happy Clients',
  stat_clients_ar: 'عميل سعيد',
  stat_years_value: '5+',
  stat_years_en: 'Years of Experience',
  stat_years_ar: 'سنوات من الخبرة',
  footer_tagline_en:
    'OdooTeams delivers Odoo ERP implementation, customization, training and support for growing businesses across the Middle East.',
  footer_tagline_ar:
    'يقدم فريق مطورين أودو خدمات تنفيذ وتخصيص وتدريب ودعم نظام أودو للشركات النامية في الشرق الأوسط.',
  footer_copyright_en: 'OdooTeams',
  footer_copyright_ar: 'فريق مطورين أودو',
};


let cached: HomepageContent | null = null;

export async function fetchHomepageContent(): Promise<HomepageContent> {
  const { data } = await (supabase as any)
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', HOMEPAGE_CONTENT_KEY)
    .maybeSingle();

  const value = (data?.setting_value ?? {}) as Partial<HomepageContent>;
  return { ...DEFAULT_HOMEPAGE_CONTENT, ...value };
}

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent>(cached ?? DEFAULT_HOMEPAGE_CONTENT);

  useEffect(() => {
    let active = true;
    fetchHomepageContent()
      .then((result) => {
        cached = result;
        if (active) setContent(result);
      })
      .catch((error) => console.error('Error loading homepage content:', error));
    return () => {
      active = false;
    };
  }, []);

  return content;
}
