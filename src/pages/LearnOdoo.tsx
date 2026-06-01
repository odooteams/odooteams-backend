
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import Pagination from '@/components/services/Pagination';
import { fetchLearnResources, LearnResource } from '@/lib/learnResources';
import LearnHeroSection from '@/components/learn/LearnHeroSection';
import ResourcesList from '@/components/learn/ResourcesList';
import ResourcesLoadingState from '@/components/learn/ResourcesLoadingState';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { generateAlternateUrls } from '@/lib/canonicalUtils';

const LearnOdoo = () => {
  const { dir, language } = useLanguage();
  
  const [resources, setResources] = useState<LearnResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await fetchLearnResources();
      setResources(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError(language === 'en'
        ? 'Failed to load learning resources. Please try again later.'
        : 'فشل تحميل موارد التعلم. يرجى المحاولة مرة أخرى لاحقًا.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);
  
  const categories = resources.length > 0 
    ? Array.from(new Set(resources.map(resource => language === 'en' ? resource.category_en : resource.category_ar)))
      .filter(category => category && category.trim() !== '')
    : [];
  
  const authors = resources.length > 0
    ? Array.from(new Set(resources.map(resource => language === 'en' ? resource.author_en : resource.author_ar)))
      .filter(author => author && author.trim() !== '')
    : [];

  const filteredResources = resources.filter(resource => {
    const title = language === 'en' ? resource.title_en : resource.title_ar;
    const content = language === 'en' ? resource.contents_en : resource.contents_ar;
    const category = language === 'en' ? resource.category_en : resource.category_ar;
    const author = language === 'en' ? resource.author_en : resource.author_ar;
    
    const matchesTerm = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    const matchesAuthor = authorFilter === 'all' || author === authorFilter;
    return matchesTerm && matchesCategory && matchesAuthor;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResources.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(dir === 'rtl' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title="Learn Odoo - Free ERP Tutorials & Resources | OdooTeams"
        description="Master Odoo ERP with free tutorials, guides, and learning resources. From beginner to advanced Odoo implementation and customization."
        keywords="learn Odoo, Odoo tutorials, ERP training, Odoo guides, Odoo resources, free Odoo learning"
        structuredData={[
          createBreadcrumbStructuredData([
            { name: 'Home', url: 'https://odooteams.com' },
            { name: 'Learn Odoo', url: 'https://odooteams.com/learn-odoo' }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Odoo Learning Resources",
            itemListElement: resources.slice(0, 50).map((r, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://odooteams.com/learn-odoo/${r.id}`,
              name: language === 'en' ? r.title_en : r.title_ar,
            })),
          },
        ]}
        alternateUrls={generateAlternateUrls('/learn-odoo')}
      />
      <TopHeader />
      <Navbar />
      <main>
        {loading || error ? (
          <ResourcesLoadingState 
            loading={loading} 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        ) : (
          <>
            <LearnHeroSection 
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              authorFilter={authorFilter}
              isGridView={isGridView}
              categories={categories}
              authors={authors}
              onSearchChange={setSearchTerm}
              onCategoryChange={setCategoryFilter}
              onAuthorChange={setAuthorFilter}
              onViewChange={setIsGridView}
            />
            <section className="py-16">
              <div className="container mx-auto px-4">
                <ResourcesList 
                  resources={currentItems} 
                  isGridView={isGridView} 
                  formatDate={formatDate} 
                />
                {filteredResources.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default LearnOdoo;
