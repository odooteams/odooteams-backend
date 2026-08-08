
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import { ChatbotData } from '@/hooks/useChatbot';

interface ChatbotSuggestionsProps {
  chatbotData: ChatbotData[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}

const ChatbotSuggestions: React.FC<ChatbotSuggestionsProps> = ({
  chatbotData,
  onSuggestionClick,
  isLoading,
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="px-4 py-2 border-t">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get first 3 questions as suggestions
  const suggestions = chatbotData.slice(0, 3).map(item => item.question);

  if (!suggestions.length) return null;

  return (
    <div className="px-4 py-2 border-t">
      <p className="text-xs text-gray-600 mb-2">
        {t('Quick questions:', 'أسئلة سريعة:')}
      </p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs h-6 px-2 hover:bg-odoo-purple hover:text-white transition-colors"
          >
            {suggestion.length > 25 ? `${suggestion.slice(0, 25)}...` : suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatbotSuggestions;
