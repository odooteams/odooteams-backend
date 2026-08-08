
import React from 'react';
import { User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotMessageProps {
  message: Message;
  isRtl: boolean;
}

const ChatbotMessage: React.FC<ChatbotMessageProps> = ({ message, isRtl }) => {
  return (
    <div className={`flex gap-2 ${message.isUser ? (isRtl ? 'justify-start' : 'justify-end') : (isRtl ? 'justify-end' : 'justify-start')}`}>
      {!message.isUser && !isRtl && (
        <img 
          src="/uploads/2f416289-3a03-4f5b-9636-25f2e7913a13.png" 
          alt="Chatbot" 
          className="w-5 h-5 mt-1"
        />
      )}
      
      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
        message.isUser 
          ? 'bg-odoo-purple text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm">{message.text}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {message.isUser && (
        <User className="w-5 h-5 mt-1 text-odoo-purple" />
      )}
      
      {!message.isUser && isRtl && (
        <img 
          src="/uploads/2f416289-3a03-4f5b-9636-25f2e7913a13.png" 
          alt="Chatbot" 
          className="w-5 h-5 mt-1"
        />
      )}
    </div>
  );
};

export default ChatbotMessage;
