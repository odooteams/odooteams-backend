
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import ProjectHeroSection from '@/components/projects/ProjectHeroSection';
import ProjectsList from '@/components/projects/ProjectsList';
import Pagination from '@/components/services/Pagination';
import { useProjects } from '@/hooks/useProjects';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { generateAlternateUrls } from '@/lib/canonicalUtils';
import { ScrollReveal } from '@/components/common/ScrollReveal';

const Projects = () => {
  const { dir } = useLanguage();
  const { 
    projects, loading, searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter, isGridView, setIsGridView,
    categories, currentPage, setCurrentPage, totalPages, handleContactRequest
  } = useProjects();
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'} dir={dir}>
      <SEOHead
        title="Our Projects - Odoo ERP Success Stories | OdooTeams"
        description="Explore OdooTeams' portfolio of successful Odoo ERP implementations across industries with custom solutions."
        keywords="Odoo projects, ERP portfolio, Odoo success stories, business transformation, Odoo case studies"
        structuredData={[
          createBreadcrumbStructuredData([
            { name: 'Home', url: 'https://odooteams.com' },
            { name: 'Projects', url: 'https://odooteams.com/projects' }
          ])
        ]}
        alternateUrls={generateAlternateUrls('/projects')}
      />
      <TopHeader />
      <Navbar />
      <main>
        <ProjectHeroSection 
          searchTerm={searchTerm}
          categoryFilter={categoryFilter || "all"}
          isGridView={isGridView}
          categories={categories}
          onSearchChange={setSearchTerm}
          onCategoryChange={(value) => setCategoryFilter(value === "all" ? "" : value)}
          onViewChange={setIsGridView}
        />
        <ScrollReveal variant="fade-up" duration={700}>
          <section className="py-20 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4">
              <ProjectsList 
                projects={projects}
                isGridView={isGridView}
                onContactRequest={handleContactRequest}
                loading={loading}
              />
              {totalPages > 1 && (
                <div className="mt-16">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Projects;
