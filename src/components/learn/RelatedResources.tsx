
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LearnResource } from '@/lib/learnResources';

interface RelatedResourcesProps {
  relatedResources: LearnResource[];
}

const RelatedResources: React.FC<RelatedResourcesProps> = ({ relatedResources }) => {
  const { t, dir, language } = useLanguage();
  
  if (relatedResources.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-odoo-purple">
          {t('Related Resources', 'موارد ذات صلة')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedResources.map((relResource, index) => {
            const relTitle = language === 'en' ? relResource.Title_en : relResource.Title_ar;
            const relCategory = language === 'en' ? relResource.Category_en : relResource.Category_ar;
            const relAuthor = language === 'en' ? relResource.Auther_en : relResource.Auther_ar;
            const relContent = language === 'en' ? relResource.contents_en : relResource.contents_ar;
            
            return (
              <Card key={index} className="overflow-hidden group">
                <div className="relative h-48">
                  <img 
                    src={relResource.image || '/placeholder.svg'} 
                    alt={relTitle} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
                    <span className="bg-odoo-purple text-white px-3 py-1 text-sm rounded">
                      {relCategory}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-odoo-purple group-hover:text-odoo-magenta transition-colors">
                    {relTitle}
                  </h3>
                  <p className="text-gray-700 text-sm mb-3">
                    {t('By', 'بواسطة')}: {relAuthor}
                  </p>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {relContent.substring(0, 120)}...
                  </p>
                  <Link to={`/learn-odoo/${relResource.id}`} className="text-odoo-purple font-medium hover:text-odoo-magenta transition-colors flex items-center">
                    {t('View Resource', 'عرض المورد')}
                    {dir === 'rtl' ? (
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2" />
                    )}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedResources;
