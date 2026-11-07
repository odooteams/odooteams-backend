
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Calendar, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearnResource } from '@/lib/learnResources';

interface ResourceHeroProps {
  resource: LearnResource;
  formatDate: (dateString: string) => string;
  handleShare: () => void;
}

const ResourceHero: React.FC<ResourceHeroProps> = ({ resource, formatDate, handleShare }) => {
  const { language } = useLanguage();
  
  // Extract title and content based on language
  const title = language === 'en' ? resource.title_en : resource.title_ar;
  const content = language === 'en' ? resource.contents_en : resource.contents_ar;
  const category = language === 'en' ? resource.category_en : resource.category_ar;
  const author = language === 'en' ? resource.author_en : resource.author_ar;
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-3/5">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block bg-odoo-purple text-white px-3 py-1 text-sm rounded">
                {category}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="h-4 w-4 mr-1 ml-reverse:rtl" />
                <time dateTime={resource.published_date || ''}>{formatDate(resource.published_date || '')}</time>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-odoo-purple">
              {title}
            </h1>
            
            <div className="flex items-center mb-6">
              <img 
                src={resource.image || '/placeholder.svg'} 
                alt={author || ''}
                className="w-10 h-10 rounded-full mr-3 ml-reverse:rtl object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div>
                <p className="font-medium text-gray-800">{author}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 ml-reverse:rtl" />
                <span>{Math.ceil(content.length / 1000)} min read</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 text-lg">
              {content.slice(0, 200)}...
            </p>
            
            <div className="flex flex-wrap gap-3">
              {resource.download_url && (
                <a 
                  href={resource.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-odoo-gold hover:bg-yellow-400 text-odoo-purple font-medium py-2 px-6 rounded inline-flex items-center transition-colors"
                >
                  <Download className="h-5 w-5 mr-2 ml-reverse:rtl" />
                  <span>{language === 'en' ? 'Download' : 'تحميل'}</span>
                </a>
              )}
              <Button 
                onClick={handleShare}
                variant="outline"
              >
                <Share2 className="h-4 w-4 mr-2 ml-reverse:rtl" />
                <span>{language === 'en' ? 'Share' : 'مشاركة'}</span>
              </Button>
            </div>
          </div>
          <div className="md:w-2/5">
            <img 
              src={resource.image || '/placeholder.svg'} 
              alt={title} 
              className="w-full h-auto rounded-lg shadow-md object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourceHero;
