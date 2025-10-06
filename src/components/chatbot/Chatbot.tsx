import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/hooks/useChatbot';
import { useLanguage } from '@/lib/LanguageContext';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';
import ChatbotMessage from './ChatbotMessage';
import ChatbotSuggestions from './ChatbotSuggestions';
import WhatsAppNoAnswer from './WhatsAppNoAnswer';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  showWhatsApp?: boolean;
}

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ 
  isOpen: externalIsOpen, 
  onToggle: externalOnToggle 
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnToggle || (() => setInternalIsOpen(!internalIsOpen));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { chatbotData, isLoading } = useChatbot();
  const { t, language, dir } = useLanguage();
  const { contactViaWhatsApp } = useWhatsAppShare({ phoneNumber: '201007419344' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chatbot opens for the first time
      const welcomeMessage: Message = {
        id: 1,
        text: t(
          "Hello! I'm your OdooTeams assistant. How can I help you today?",
          "مرحباً! أنا مساعد OdooTeams. كيف يمكنني مساعدتك اليوم؟"
        ),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    if (inputValue.trim().length > 2 && chatbotData.length > 0) {
      const filteredSuggestions = chatbotData
        .filter(item => 
          item.question.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.keywords.some(keyword => keyword.toLowerCase().includes(inputValue.toLowerCase()))
        )
        .slice(0, 5)
        .map(item => item.question);
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [inputValue, chatbotData]);

  const findBestMatch = (userMessage: string) => {
    if (!chatbotData.length) return null;

    const userWords = userMessage.toLowerCase().split(' ');
    let bestMatch = null;
    let highestScore = 0;

    chatbotData.forEach((item) => {
      let score = 0;
      
      // Check for exact question match first
      if (item.question.toLowerCase().includes(userMessage.toLowerCase())) {
        score += 100;
      }
      
      // Check keyword matches
      userWords.forEach((word) => {
        if (word.length > 2) {
          if (item.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
            score += 10;
          }
          if (item.question.toLowerCase().includes(word)) {
            score += 5;
          }
          if (item.answer.toLowerCase().includes(word)) {
            score += 3;
          }
        }
      });

      if (score > highestScore && score > 5) {
        highestScore = score;
        bestMatch = item;
      }
    });

    return bestMatch;
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const bestMatch = findBestMatch(textToSend);
      let botResponse = '';
      let showWhatsApp = false;

      if (bestMatch) {
        botResponse = bestMatch.answer;
      } else {
        botResponse = t(
          "I'm sorry, I couldn't find a specific answer to your question. Please contact our team for more detailed assistance.",
          "عذراً، لم أتمكن من العثور على إجابة محددة لسؤالك. يرجى الاتصال بفريقنا للحصول على مساعدة أكثر تفصيلاً."
        );
        showWhatsApp = true;
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        showWhatsApp,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        handleSendMessage();
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    handleSendMessage(suggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      {/* Chatbot Toggle Button - Only show if not controlled externally */}
      {externalIsOpen === undefined && !isOpen && (
        <div className={`fixed z-40 ${dir === 'rtl' ? 'right-4' : 'left-4'} bottom-32 ${dir === 'ltr' ? 'md:right-4 md:left-auto' : 'md:left-4 md:right-auto'}`}>
          <Button
            onClick={toggleOpen}
            className="w-14 h-14 rounded-full bg-odoo-purple hover:bg-odoo-magenta shadow-lg transition-all duration-300 hover:scale-110 p-0"
          >
            <img 
              src="/lovable-uploads/2f416289-3a03-4f5b-9636-25f2e7913a13.png" 
              alt="Chatbot" 
              className="w-8 h-8"
            />
          </Button>
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className={`fixed z-40 ${externalIsOpen !== undefined ? 'bottom-24 right-6' : `${dir === 'rtl' ? 'right-4' : 'left-4'} bottom-32 ${dir === 'ltr' ? 'md:right-4 md:left-auto' : 'md:left-4 md:right-auto'}`} w-80 h-[500px] bg-white rounded-lg shadow-2xl border flex flex-col overflow-hidden animate-scale-in`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-odoo-purple to-odoo-magenta text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/2f416289-3a03-4f5b-9636-25f2e7913a13.png" 
                alt="Chatbot" 
                className="w-5 h-5"
              />
              <span className="font-semibold">
                {t('OdooTeams Assistant', 'مساعد OdooTeams')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleOpen}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <ChatbotMessage
                    message={message}
                    isRtl={dir === 'rtl'}
                  />
                  {message.showWhatsApp && (
                    <WhatsAppNoAnswer 
                      isRtl={dir === 'rtl'} 
                      onWhatsAppClick={contactViaWhatsApp}
                    />
                  )}
                </div>
              ))}
              {isTyping && (
                <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                  <img 
                    src="/lovable-uploads/2f416289-3a03-4f5b-9636-25f2e7913a13.png" 
                    alt="Chatbot" 
                    className="w-5 h-5"
                  />
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-odoo-purple rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-odoo-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-odoo-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Suggestions */}
          <ChatbotSuggestions
            chatbotData={chatbotData}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isLoading}
          />

          {/* Input Area with Autocomplete */}
          <div className="p-4 border-t bg-gray-50 relative">
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                      selectedSuggestionIndex === index ? 'bg-odoo-purple/10' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={t('Type your message...', 'اكتب رسالتك...')}
                className="flex-1"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-odoo-purple hover:bg-odoo-magenta"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
