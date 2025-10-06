
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLearnResources, LearnResource } from '@/lib/learnResources';

const RecentPosts = () => {
  const { t, language, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [resources, setResources] = useState<LearnResource[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const data = await fetchLearnResources();
        // Get the most recent 3 resources based on date
        const sortedResources = [...data].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setResources(sortedResources.slice(0, 3));
      } catch (error) {
        console.error("Failed to load learn resources:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadResources();
  }, [language]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title">{t('Recent Articles', 'أحدث المقالات')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 h-64 animate-pulse">
                <div className="bg-gray-200 h-32 rounded-md mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-3 w-1/3"></div>
                <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('Recent Articles', 'أحدث المقالات')}</h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            {t(
              'Stay updated with our latest insights and news about Odoo ERP.',
              'ابق على اطلاع بأحدث رؤانا وأخبارنا حول نظام أودو ERP.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <article key={resource.id} className="card group bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative overflow-hidden h-48">
                <img 
                  src={resource.image || '/placeholder.svg'} 
                  alt={language === 'en' ? resource.Title_en : resource.Title_ar} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar className="h-4 w-4 mr-2 ml-reverse:rtl" />
                  <time dateTime={resource.date}>{formatDate(resource.date)}</time>
                </div>
                <h3 className="text-xl font-bold mb-2 text-odoo-purple group-hover:text-odoo-magenta transition-colors">
                  {language === 'en' ? resource.Title_en : resource.Title_ar}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {language === 'en' ? resource.contents_en : resource.contents_ar}
                </p>
                <Link 
                  to={`/learn-odoo/${resource.id}`} 
                  className="inline-flex items-center font-medium text-odoo-magenta hover:text-odoo-purple transition-colors"
                >
                  {t('Read more', 'اقرأ المزيد')}
                  <Arrow className="ml-2 mr-reverse:rtl h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link 
            to="/learn-odoo" 
            className="btn-outline inline-flex items-center bg-white px-6 py-3 rounded-md border border-odoo-purple text-odoo-purple hover:bg-odoo-purple hover:text-white transition-colors"
          >
            {t('View All Articles', 'عرض جميع المقالات')}
            <Arrow className="ml-2 mr-reverse:rtl h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentPosts;
