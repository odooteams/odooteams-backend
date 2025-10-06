
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { GOOGLE_SHEETS_CONFIG, fetchSheetData } from '@/lib/googleSheets';

export interface FAQ {
  id: number;
  category: string;
  question: string;
  contents: string;
}

export const useFaqs = (categoryFilter: string = '') => {
  const { language } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSheetData(
          GOOGLE_SHEETS_CONFIG.API_KEY,
          GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
          "faq"
        );

        // Process the FAQs data
        const processedFaqs: FAQ[] = data.map((row: any, index: number) => {
          const category = language === 'ar' ? (row.Category_ar || row.Category_en) : (row.Category_en || row.Category_ar);
          const question = language === 'ar' ? (row.question_ar || row.question_en) : (row.question_en || row.question_ar);
          const contents = language === 'ar' ? (row.contents_ar || row.contents_en) : (row.contents_en || row.contents_ar);
          
          return {
            id: index + 1,
            category,
            question,
            contents
          };
        });

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(processedFaqs.map(faq => faq.category)));
        
        setFaqs(processedFaqs);
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        console.error('Error loading FAQs:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaqs();
  }, [language]);

  // Filter FAQs by category if provided
  const filteredFaqs = categoryFilter 
    ? faqs.filter(faq => faq.category === categoryFilter)
    : faqs;

  return { faqs: filteredFaqs, categories, isLoading, error };
};

export default useFaqs;
