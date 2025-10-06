
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import useFaqs from '@/hooks/useFaqs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from "@/components/ui/skeleton";

const ContactFAQ: React.FC = () => {
  const { t } = useLanguage();
  const { faqs, isLoading, error } = useFaqs('contact'); // Filter FAQs for 'contact' category
  
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('Frequently Asked Questions', 'الأسئلة الشائعة')}
        </h2>
        
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            // Loading state
            Array(4).fill(0).map((_, index) => (
              <div className="mb-4" key={`skeleton-${index}`}>
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
              {t('Failed to load FAQs', 'فشل تحميل الأسئلة الشائعة')}
            </div>
          ) : faqs.length === 0 ? (
            // No FAQs found
            <div className="text-center text-gray-500">
              {t('No FAQs available', 'لا توجد أسئلة متكررة متاحة')}
            </div>
          ) : (
            // FAQs loaded
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="bg-white rounded-lg shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-gray-600">
                    <div dangerouslySetInnerHTML={{ __html: faq.contents }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;
