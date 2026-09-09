import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SliderData {
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  main_image_url: string;
  image1_url: string;
  image2_url: string;
  image3_url: string;
  image4_url: string;
  image5_url: string;
  image6_url: string;
}

/**
 * Hero slider content, stored in site_settings under the `hero_slider` key
 * as a JSON array of slides. Returns an empty list when nothing is configured,
 * so the hero falls back to its built-in slide.
 */
export const useSlider = () => {
  const [sliderData, setSliderData] = useState<SliderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSliderData = async () => {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'hero_slider')
          .maybeSingle();

        if (dbError) throw dbError;
        if (cancelled) return;

        const value = data?.setting_value as unknown;
        setSliderData(Array.isArray(value) ? (value as SliderData[]) : []);
        setError(null);
      } catch (err) {
        console.error('Error loading slider data:', err);
        if (!cancelled) setError('Failed to load slider data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSliderData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { sliderData, loading, error };
};
