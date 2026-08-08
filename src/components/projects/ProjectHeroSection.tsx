
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

interface ProjectHeroSectionProps {
  searchTerm: string;
  categoryFilter: string;
  isGridView: boolean; 
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onViewChange: (isGrid: boolean) => void;
}

const ProjectHeroSection: React.FC<ProjectHeroSectionProps> = ({
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
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-block animate-fade-in">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {t('Portfolio', 'المحفظة')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {t('Our Projects', 'مشاريعنا')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t(
              'Transforming businesses through innovative Odoo solutions',
              'تحويل الأعمال من خلال حلول أودو المبتكرة'
            )}
          </p>

          {/* Filter bar */}
          <div className="pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-grow w-full">
                  <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5`} />
                  <input
                    type="text"
                    placeholder={t('Search projects...', 'بحث في المشاريع...')}
                    className={`${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'} w-full py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors`}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
                
                {/* Category filter */}
                <Select value={categoryFilter} onValueChange={onCategoryChange}>
                  <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl border-2">
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
                
                {/* View toggles */}
                <div className="flex gap-2 bg-muted p-1 rounded-xl">
                  <button
                    className={`p-3 rounded-lg transition-all ${isGridView ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                    onClick={() => onViewChange(true)}
                    aria-label={t('Grid view', 'عرض شبكي')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  </button>
                  <button
                    className={`p-3 rounded-lg transition-all ${!isGridView ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                    onClick={() => onViewChange(false)}
                    aria-label={t('List view', 'عرض قائمة')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectHeroSection;
