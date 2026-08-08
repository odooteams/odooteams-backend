import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export interface ChatbotData {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export function useChatbot() {
  const { language } = useLanguage();

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chatbot-data', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_responses')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  const chatbotData: ChatbotData[] = (rawData || []).map((row: any) => {
    const question = language === 'ar' 
      ? (row.question_ar || row.question_en) 
      : (row.question_en || row.question_ar);
    
    const answer = language === 'ar' 
      ? (row.answer_ar || row.answer_en) 
      : (row.answer_en || row.answer_ar);

    // Use stored keywords or extract from question
    const keywords = row.keywords || question.toLowerCase().split(' ').filter((word: string) => word.length > 2);

    return {
      id: row.id,
      question: question || '',
      answer: answer || '',
      keywords,
    };
  });

  // Function to increment usage count when a response is matched
  const incrementUsage = async (id: string) => {
    try {
      // Get current usage count and increment
      const { data: current } = await supabase
        .from('chatbot_responses')
        .select('usage_count')
        .eq('id', id)
        .single();
      
      if (current) {
        await supabase
          .from('chatbot_responses')
          .update({ usage_count: (current.usage_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  };

  return {
    chatbotData,
    isLoading,
    error,
    incrementUsage,
  };
}
