
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Calendar, Download } from 'lucide-react';
import { LearnResource } from '@/lib/learnResources';

interface ResourcesListProps {
  resources: LearnResource[];
  isGridView: boolean;
  formatDate: (dateString: string) => string;
}

const ResourcesList: React.FC<ResourcesListProps> = ({ 
  resources, 
  isGridView,
  formatDate 
}) => {
  const { t, language } = useLanguage();
  
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-500">
          {t('No resources found matching your criteria.', 'لم يتم العثور على موارد تطابق معايير البحث.')}
        </h3>
      </div>
    );
  }
  
  return (
    <>
      {isGridView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <div key={resource.id} className="card overflow-hidden group">
              <Link to={`/learn-odoo/${resource.id}`} className="block relative h-48">
                <img 
                  src={resource.image || '/placeholder.svg'} 
                  alt={language === 'en' ? resource.title_en : resource.title_ar} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
                  <span className="bg-odoo-purple text-white px-3 py-1 text-sm rounded">
                    {language === 'en' ? resource.category_en : resource.category_ar}
                  </span>
                  <div className="flex items-center text-white">
                    <Calendar className="h-4 w-4 mr-1 ml-reverse:rtl" />
                    <span className="text-sm">{formatDate(resource.published_date || '')}</span>
                  </div>
                </div>
              </Link>
              <div className="p-6">
                <Link to={`/learn-odoo/${resource.id}`} className="block">
                  <h3 className="text-xl font-bold mb-2 text-odoo-purple group-hover:text-odoo-magenta transition-colors">
                    {language === 'en' ? resource.title_en : resource.title_ar}
                  </h3>
                </Link>
                <p className="text-gray-700 text-sm mb-3">
                  {t('By', 'بواسطة')}: {language === 'en' ? resource.author_en : resource.author_ar}
                </p>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {language === 'en' ? resource.contents_en : resource.contents_ar}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link 
                    to={`/learn-odoo/${resource.id}`}
                    className="bg-odoo-purple hover:bg-odoo-magenta text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
                  >
                    {t('View Details', 'عرض التفاصيل')}
                  </Link>
                  {resource.download_url && (
                    <a 
                      href={resource.download_url}
                      className="bg-odoo-gold hover:bg-yellow-400 text-odoo-purple font-medium py-2 px-4 rounded flex items-center justify-center transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-5 w-5 mr-2 ml-reverse:rtl" />
                      {t('Download', 'تحميل')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {resources.map((resource) => (
            <div key={resource.id} className="card overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <Link to={`/learn-odoo/${resource.id}`} className="relative h-64 md:h-auto md:w-1/3 block">
                  <img 
                    src={resource.image || '/placeholder.svg'} 
                    alt={language === 'en' ? resource.title_en : resource.title_ar}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 right-reverse:rtl bg-odoo-purple text-white px-3 py-1 text-sm rounded">
                    {language === 'en' ? resource.category_en : resource.category_ar}
                  </span>
                </Link>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar className="h-4 w-4 mr-1 ml-reverse:rtl" />
                    <time dateTime={resource.published_date || ''}>{formatDate(resource.published_date || '')}</time>
                  </div>
                  <Link to={`/learn-odoo/${resource.id}`} className="block">
                    <h3 className="text-2xl font-bold mb-2 text-odoo-purple hover:text-odoo-magenta transition-colors">
                      {language === 'en' ? resource.title_en : resource.title_ar}
                    </h3>
                  </Link>
                  <p className="text-gray-700 text-sm mb-3">
                    {t('By', 'بواسطة')}: {language === 'en' ? resource.author_en : resource.author_ar}
                  </p>
                  <p className="text-gray-600 mb-6">
                    {language === 'en' ? resource.contents_en : resource.contents_ar}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to={`/learn-odoo/${resource.id}`}
                      className="bg-odoo-purple hover:bg-odoo-magenta text-white py-2 px-6 rounded inline-flex items-center transition-colors"
                    >
                      {t('View Details', 'عرض التفاصيل')}
                    </Link>
                    {resource.download_url && (
                      <a 
                        href={resource.download_url}
                        className="bg-odoo-gold hover:bg-yellow-400 text-odoo-purple font-medium py-2 px-6 rounded inline-flex items-center transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-5 w-5 mr-2 ml-reverse:rtl" />
                        {t('Download', 'تحميل')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ResourcesList;
