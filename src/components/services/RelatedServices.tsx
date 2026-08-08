
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface RelatedServicesProps {
  // In a real app, these would be actual service objects
  relatedIds: number[];
}

const RelatedServices: React.FC<RelatedServicesProps> = ({ relatedIds }) => {
  const { t, dir } = useLanguage();
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-odoo-purple">
          {t('Related Services', 'خدمات ذات صلة')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedIds.map((id) => (
            <Card key={id} className="overflow-hidden group">
              <div className="relative h-48">
                <img 
                  src="/placeholder.svg" 
                  alt="Related Service" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 right-4 left-reverse:rtl bg-odoo-purple text-white px-3 py-1 text-sm rounded">
                  {t('Related', 'ذات صلة')}
                </span>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 text-odoo-purple group-hover:text-odoo-magenta transition-colors">
                  {t(`Related Service ${id}`, `خدمة ذات صلة ${id}`)}
                </h3>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {t(`Short description of related service ${id}...`, `وصف مختصر للخدمة ذات الصلة ${id}...`)}
                </p>
                <Link to={`/services/odoo-erp`} className="text-odoo-purple font-medium hover:text-odoo-magenta transition-colors flex items-center">
                  {t('View Details', 'عرض التفاصيل')}
                  {dir === 'rtl' ? (
                    <ChevronLeft className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;
