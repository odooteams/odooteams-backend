import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { faqsQueries } from '@/lib/supabase/queries';
import type { FAQ as SupabaseFAQ } from '@/lib/supabase/types';

export interface FAQ {
  id: string;
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
        const data = await faqsQueries.getAll();

        // Process the FAQs data
        const processedFaqs: FAQ[] = data.map((faq: SupabaseFAQ) => {
          const category = language === 'ar' ? faq.category_ar : faq.category_en;
          const question = language === 'ar' ? faq.question_ar : faq.question_en;
          const contents = language === 'ar' ? faq.answer_ar : faq.answer_en;
          
          return {
            id: faq.id,
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
