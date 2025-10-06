import { useState, useEffect } from 'react';
import { fetchSheetData, GOOGLE_SHEETS_CONFIG } from '@/lib/googleSheets';

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

export const useSlider = () => {
  const [sliderData, setSliderData] = useState<SliderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSliderData = async () => {
      try {
        setLoading(true);
        const data = await fetchSheetData(
          GOOGLE_SHEETS_CONFIG.API_KEY,
          GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
          GOOGLE_SHEETS_CONFIG.SHEETS.SLIDER
        );
        setSliderData(data as unknown as SliderData[]);
        setError(null);
      } catch (err) {
        console.error('Error loading slider data:', err);
        setError('Failed to load slider data');
      } finally {
        setLoading(false);
      }
    };

    loadSliderData();
  }, []);

  return { sliderData, loading, error };
};