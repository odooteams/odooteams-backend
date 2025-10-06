
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSlider from '@/components/home/ServicesSlider';
import RecentPosts from '@/components/home/RecentPosts';
import AboutPreview from '@/components/home/AboutPreview';
import TestimonialsSlider from '@/components/home/TestimonialsSlider';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import { useLanguage } from '@/lib/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import StickyContact from '@/components/common/StickyContact';
import SEOHead from '@/components/seo/SEOHead';
import { createLocalBusinessStructuredData } from '@/components/seo/StructuredData';
import { useAutomaticSitemapGeneration } from '@/components/seo/SitemapGenerator';
import { generateAlternateUrls } from '@/lib/canonicalUtils';

const Index = () => {
  const { dir, t } = useLanguage();
  
  // Generate automatic sitemap
  useAutomaticSitemapGeneration();
  
  const homeStructuredData = [
    createLocalBusinessStructuredData(),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "OdooTeams - Professional Odoo Implementation Services",
      "description": "Transform your business with expert Odoo ERP implementation, customization, and development services. Get professional Odoo solutions worldwide.",
      "url": "https://odooteams.com",
      "mainEntity": {
        "@type": "Organization",
        "name": "OdooTeams"
      }
    }
  ];
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title="OdooTeams - Professional Odoo Implementation Services | ERP Solutions"
        description="Transform your business with expert Odoo ERP implementation, customization, and development services. Get professional Odoo solutions worldwide with 24/7 support."
        keywords="Odoo implementation, Odoo ERP, Odoo customization, Odoo development, Odoo training, ERP solutions, business automation, Odoo consultant"
        structuredData={homeStructuredData}
        alternateUrls={generateAlternateUrls('/')}
      />
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSlider />
        <AboutPreview />
        <FeaturedProjects />
        <RecentPosts />
        <TestimonialsSlider />
      </main>
      <StickyContact />
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" /> {/* Spacer for bottom navigation */}
    </div>
  );
};

export default Index;
