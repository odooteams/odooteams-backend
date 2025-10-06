
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Search } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface HeroSectionProps {
  searchTerm: string;
  categoryFilter: string;
  isGridView: boolean; 
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onViewChange: (isGrid: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchTerm,
  categoryFilter,
  isGridView,
  categories,
  onSearchChange,
  onCategoryChange,
  onViewChange
}) => {
  const { t, dir } = useLanguage();
  
  return (
    <section className="bg-gradient-hero text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('Our Services', 'خدماتنا')}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {t(
              'Discover our comprehensive range of Odoo services tailored to your business needs.',
              'اكتشف مجموعتنا الشاملة من خدمات أودو المصممة خصيصًا لاحتياجات عملك.'
            )}
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5`} />
                <input
                  type="text"
                  placeholder={t('Search services...', 'بحث في الخدمات...')}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-odoo-magenta text-gray-800`}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[180px] text-gray-800 border border-gray-300">
                  <SelectValue placeholder={t('All Categories', 'جميع الفئات')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories', 'جميع الفئات')}</SelectItem>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category || `category-${index}`}>
                      {category || t('Uncategorized', 'غير مصنف')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <button
                  className={`p-2 border ${isGridView ? 'bg-odoo-purple text-white' : 'bg-white text-gray-700'} rounded transition-colors`}
                  onClick={() => onViewChange(true)}
                  aria-label={t('Grid view', 'عرض شبكي')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </button>
                <button
                  className={`p-2 border ${!isGridView ? 'bg-odoo-purple text-white' : 'bg-white text-gray-700'} rounded transition-colors`}
                  onClick={() => onViewChange(false)}
                  aria-label={t('List view', 'عرض قائمة')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
