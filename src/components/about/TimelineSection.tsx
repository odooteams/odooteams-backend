import React, { useState, useEffect } from 'react';
import RichText from '@/components/common/RichText';
import { useLanguage } from '@/lib/LanguageContext';
import { timelineQueries } from '@/lib/supabase/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface TimelineItem {
  year: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
}

const TimelineSection = () => {
  const { t, dir, language } = useLanguage();
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await timelineQueries.getAll();
        
        if (data && data.length > 0) {
          const typedData = data.map(item => ({
            year: item.year,
            title_en: item.title_en,
            title_ar: item.title_ar,
            description_en: item.description_en,
            description_ar: item.description_ar
          }));
          
          setTimelineData(typedData);
        } else {
          setTimelineData([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-odoo-purple mb-8 md:mb-12">
          {t('Our Journey', 'رحلتنا')}
        </h2>
        
        {/* Desktop Timeline */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-odoo-purple"></div>
          
          <div className="space-y-16">
            {loading ? (
              // Loading state
              Array(4).fill(0).map((_, index) => (
                <div className="relative" key={`loading-${index}`}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4 w-8 h-8 rounded-full border-4 border-odoo-purple bg-white">
                    <Skeleton className="w-4 h-4 rounded-full" />
                  </div>
                  <div className={`bg-white rounded-lg shadow-md p-6 w-5/12 ${index % 2 === 0 ? (dir === 'rtl' ? 'mr-auto pr-8' : 'ml-auto pl-8') : (dir === 'rtl' ? 'ml-0 pl-8' : 'mr-auto pr-8')}`}>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : (
              // Data loaded
              timelineData.map((item, index) => (
                <div className="relative" key={`${item.year}-${index}`}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4 w-8 h-8 rounded-full border-4 border-odoo-purple bg-white flex items-center justify-center">
                    <Clock className="h-4 w-4 text-odoo-purple" />
                  </div>
                  <div className={`bg-white rounded-lg shadow-md p-6 w-5/12 ${index % 2 === 0 ? (dir === 'rtl' ? 'mr-auto pr-8' : 'ml-auto pl-8') : (dir === 'rtl' ? 'ml-0 pl-8' : 'mr-auto pr-8')}`}>
                    <div className="font-bold text-odoo-magenta mb-2">{item.year}</div>
                    <h3 className="text-xl font-bold text-odoo-purple mb-2">
                      {language === 'en' ? item.title_en : item.title_ar}
                    </h3>
                    <RichText className="text-gray-600" html={language === 'en' ? item.description_en : item.description_ar} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden relative max-w-lg mx-auto">
          {/* Mobile Timeline line */}
          <div className={`absolute ${dir === 'rtl' ? 'right-6' : 'left-6'} top-0 h-full w-0.5 bg-odoo-purple`}></div>
          
          <div className="space-y-6">
            {loading ? (
              // Loading state for mobile
              Array(4).fill(0).map((_, index) => (
                <div className="relative flex items-start" key={`mobile-loading-${index}`}>
                  <div className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} w-4 h-4 rounded-full border-2 border-odoo-purple bg-white`}>
                  </div>
                  <div className={`bg-white rounded-lg shadow-md p-4 ${dir === 'rtl' ? 'mr-12' : 'ml-12'} w-full`}>
                    <Skeleton className="h-3 w-12 mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            ) : error ? (
              // Error state for mobile
              <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center mx-4">
                {error}
              </div>
            ) : (
              // Data loaded for mobile
              timelineData.map((item, index) => (
                <div className="relative flex items-start" key={`mobile-${item.year}-${index}`}>
                  <div className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} w-4 h-4 rounded-full border-2 border-odoo-purple bg-white flex items-center justify-center`}>
                    <div className="w-2 h-2 rounded-full bg-odoo-purple"></div>
                  </div>
                  <div className={`bg-white rounded-lg shadow-md p-4 ${dir === 'rtl' ? 'mr-12' : 'ml-12'} w-full transition-all duration-300 hover:shadow-lg`}>
                    <div className="font-bold text-odoo-magenta text-sm mb-1">{item.year}</div>
                    <h3 className="text-lg font-bold text-odoo-purple mb-2 leading-tight">
                      {language === 'en' ? item.title_en : item.title_ar}
                    </h3>
                    <RichText className="text-gray-600 text-sm leading-relaxed" html={language === 'en' ? item.description_en : item.description_ar} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
