
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { siteSettingsQueries } from '@/lib/supabase/queries';
import { Skeleton } from '@/components/ui/skeleton';

interface Stat {
  value: string;
  label_en: string;
  label_ar: string;
}

const StatsSection = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const data = await siteSettingsQueries.getBySetting('about_stats');
        
        if (data && data.setting_value && Array.isArray(data.setting_value)) {
          setStats(data.setting_value as unknown as Stat[]);
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        // Fallback to default stats
        setStats([
          { value: '8+', label_en: 'Years of Experience', label_ar: 'سنوات من الخبرة' },
          { value: '200+', label_en: 'Projects Completed', label_ar: 'المشاريع المنجزة' },
          { value: '150+', label_en: 'Happy Clients', label_ar: 'عملاء سعداء' },
          { value: '20+', label_en: 'Odoo Experts', label_ar: 'خبراء أودو' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow-md text-center">
                <Skeleton className="h-12 w-20 mx-auto mb-2" />
                <Skeleton className="h-6 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-odoo-magenta mb-2">{stat.value}</div>
              <div className="text-gray-600">
                {language === 'ar' ? stat.label_ar : stat.label_en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
