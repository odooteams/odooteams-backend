
import { useQuery } from '@tanstack/react-query';
import { GOOGLE_SHEETS_CONFIG, fetchSheetData } from '@/lib/googleSheets';
import { useLanguage } from '@/lib/LanguageContext';

export interface ChatbotData {
  id: number;
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
      const data = await fetchSheetData(
        GOOGLE_SHEETS_CONFIG.API_KEY,
        GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
        'chatbot'
      );
      return data;
    },
  });

  const chatbotData: ChatbotData[] = (rawData || []).map((row: any, index: number) => {
    const question = language === 'ar' 
      ? (row.question_ar || row.question_en) 
      : (row.question_en || row.question_ar);
    
    const answer = language === 'ar' 
      ? (row.answer_ar || row.answer_en) 
      : (row.answer_en || row.answer_ar);

    // Extract keywords from the question for better matching
    const keywords = question.toLowerCase().split(' ').filter((word: string) => word.length > 2);

    return {
      id: index + 1,
      question: question || '',
      answer: answer || '',
      keywords,
    };
  });

  return {
    chatbotData,
    isLoading,
    error,
  };
}
