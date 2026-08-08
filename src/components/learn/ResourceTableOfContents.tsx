
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger
} from '@/components/ui/accordion';

interface ResourceTableOfContentsProps {
  mainHeaders: string[];
}

const ResourceTableOfContents: React.FC<ResourceTableOfContentsProps> = ({ mainHeaders }) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
      <h3 className="text-lg font-bold mb-4 text-odoo-purple border-b pb-2">
        {t('Table of Contents', 'جدول المحتويات')}
      </h3>
      {mainHeaders.length > 0 ? (
        <nav>
          <Accordion type="single" collapsible>
            {mainHeaders.map((header, index) => (
              <AccordionItem key={index} value={`header-${index}`}>
                <AccordionTrigger className="text-gray-800 hover:text-odoo-purple">
                  {header}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 border-l-2 border-gray-200">
                    <a 
                      href={`#section-${index}`}
                      className="block py-2 text-sm text-gray-600 hover:text-odoo-purple"
                    >
                      {t('Go to section', 'الانتقال إلى القسم')}
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>
      ) : (
        <p className="text-gray-500">{t('No contents available', 'لا يوجد محتويات متاحة')}</p>
      )}
    </div>
  );
};

export default ResourceTableOfContents;
