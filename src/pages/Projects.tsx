
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import ProjectHeroSection from '@/components/projects/ProjectHeroSection';
import ProjectsList from '@/components/projects/ProjectsList';
import Pagination from '@/components/services/Pagination';
import { useProjects } from '@/hooks/useProjects';

const Projects = () => {
  const { dir } = useLanguage();
  const { 
    projects,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    isGridView,
    setIsGridView,
    categories,
    currentPage,
    setCurrentPage,
    totalPages,
    handleContactRequest
  } = useProjects();
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
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

        <section className="py-16">
          <div className="container mx-auto px-4">
            <ProjectsList 
              projects={projects}
              isGridView={isGridView}
              onContactRequest={handleContactRequest}
            />
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" /> {/* Spacer for bottom navigation */}
    </div>
  );
};

export default Projects;
