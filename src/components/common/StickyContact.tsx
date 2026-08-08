
import React, { useState } from 'react';
import { Facebook } from 'lucide-react';
import useWhatsAppShare from '@/hooks/useWhatsAppShare';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Chatbot from '@/components/chatbot/Chatbot';

interface StickyContactProps {
  className?: string;
}

const StickyContact: React.FC<StickyContactProps> = ({ className }) => {
  const { contactViaWhatsApp } = useWhatsAppShare({ phoneNumber: '201007419344' });
  const facebookUrl = 'https://facebook.com'; // This would typically come from your config
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  const WhatsAppIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M11.999 1.98C6.47 1.98 1.98 6.47 1.98 12s4.49 10.02 10.02 10.02 10.02-4.49 10.02-10.02S17.53 1.98 11.999 1.98zm0 18.04C7.58 20.02 4 16.44 4 12s3.58-8.02 8-8.02 8 3.58 8 8.02c0 4.44-3.58 8.02-8 8.02z"/>
    </svg>
  );
  
  return (
    <>
      <div className={cn(
        "fixed bottom-24 md:bottom-6 right-6 flex flex-col gap-3 z-50",
        className
      )}>
        {/* Chatbot Button */}
        <Button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          size="icon"
          className="rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg animate-pulse"
          aria-label="Open chatbot"
        >
          <img 
            src="/uploads/2f416289-3a03-4f5b-9636-25f2e7913a13.png" 
            alt="Chatbot" 
            className="w-5 h-5"
          />
        </Button>

        {/* WhatsApp Button */}
        <Button
          onClick={contactViaWhatsApp}
          size="icon"
          className="rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          aria-label="Contact via WhatsApp"
        >
          <WhatsAppIcon />
        </Button>
        
        {/* Facebook Button */}
        <Button
          onClick={() => window.open(facebookUrl, '_blank')}
          size="icon"
          className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          aria-label="Visit our Facebook page"
        >
          <Facebook className="h-5 w-5" />
        </Button>
      </div>

      {/* Chatbot Component */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
    </>
  );
};

export default StickyContact;
