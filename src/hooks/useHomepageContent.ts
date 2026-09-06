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
  hero_highlight_en: 'with Odoo Excellence',
  hero_highlight_ar: 'بتميز أودو',
  hero_cta_primary_en: 'Explore Services',
  hero_cta_primary_ar: 'استكشف الخدمات',
  hero_cta_primary_link: '/services',
  hero_cta_secondary_en: 'Get Started',
  hero_cta_secondary_ar: 'ابدأ الآن',
  hero_cta_secondary_link: '/contact',
  stat_projects_value: '200+',
  stat_projects_en: 'Projects',
  stat_projects_ar: 'مشاريع',
  stat_clients_value: '50+',
  stat_clients_en: 'Clients',
  stat_clients_ar: 'عملاء',
  stat_years_value: '5+',
  stat_years_en: 'Years',
  stat_years_ar: 'سنوات',
  footer_tagline_en: 'Professional Odoo implementation services to help your business grow.',
  footer_tagline_ar: 'خدمات احترافية لتنفيذ أودو لمساعدة عملك على النمو.',
  footer_copyright_en: 'OdooTeams',
  footer_copyright_ar: 'فريق مطورين اودو',
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
