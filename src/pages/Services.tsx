
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import HeroSection from '@/components/services/HeroSection';
import ServicesList from '@/components/services/ServicesList';
import Pagination from '@/components/services/Pagination';
import { useServices } from '@/hooks/useServices';
import SEOHead from '@/components/seo/SEOHead';
import { createServiceStructuredData, createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { generateAlternateUrls } from '@/lib/canonicalUtils';
import { ScrollReveal } from '@/components/common/ScrollReveal';

const Services = () => {
  const { dir, t } = useLanguage();
  const { 
    services, searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter, isGridView, setIsGridView,
    categories, currentPage, setCurrentPage, totalPages, handleWhatsAppRequest
  } = useServices();

  const servicesStructuredData = [
    createBreadcrumbStructuredData([
      { name: 'Home', url: 'https://odooteams.com' },
      { name: 'Services', url: 'https://odooteams.com/services' }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": services.map((service, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": createServiceStructuredData(service)
      }))
    }
  ];
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'} dir={dir}>
      <SEOHead
        title="Odoo Services — Implementation & Customization | OdooTeams"
        description="Comprehensive Odoo ERP services: implementation, customization, training, and support tailored to your business needs."
        keywords="Odoo services, ERP implementation, Odoo customization, Odoo training, Odoo support, business automation, Odoo modules, ERP consulting"
        structuredData={servicesStructuredData}
        alternateUrls={generateAlternateUrls('/services')}
      />
      <TopHeader />
      <Navbar />
      <main>
        <HeroSection 
          searchTerm={searchTerm}
          categoryFilter={categoryFilter || "all"}
          isGridView={isGridView}
          categories={categories}
          onSearchChange={setSearchTerm}
          onCategoryChange={(value) => setCategoryFilter(value === "all" ? "" : value)}
          onViewChange={setIsGridView}
        />
        <ScrollReveal variant="fade-up" duration={700}>
          <section className="py-16">
            <div className="container mx-auto px-4">
              <ServicesList 
                services={services}
                isGridView={isGridView}
                onRequestViaWhatsApp={handleWhatsAppRequest}
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
        </ScrollReveal>
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Services;
