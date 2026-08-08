
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSlider from '@/components/home/ServicesSlider';
import RecentPosts from '@/components/home/RecentPosts';
import AboutPreview from '@/components/home/AboutPreview';
import TestimonialsSlider from '@/components/home/TestimonialsSlider';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import { PartnersSlider } from '@/components/home/PartnersSlider';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import StickyContact from '@/components/common/StickyContact';
import SEOHead from '@/components/seo/SEOHead';
import { createLocalBusinessStructuredData } from '@/components/seo/StructuredData';
import { useAutomaticSitemapGeneration } from '@/components/seo/SitemapGenerator';
import { generateAlternateUrls } from '@/lib/canonicalUtils';
import { ScrollReveal } from '@/components/common/ScrollReveal';

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
        title="OdooTeams — Expert Odoo ERP Implementation Services"
        description="Expert Odoo ERP implementation, customization, and development services worldwide. Professional Odoo solutions with 24/7 support."
        keywords="Odoo implementation, Odoo ERP, Odoo customization, Odoo development, Odoo training, ERP solutions, business automation, Odoo consultant"
        structuredData={homeStructuredData}
        alternateUrls={generateAlternateUrls('/')}
      />
      <TopHeader />
      <Navbar />
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <ScrollReveal variant="fade-up" duration={700}>
          <section id="services">
            <ServicesSlider />
          </section>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" duration={700} delay={100}>
          <section id="about">
            <AboutPreview />
          </section>
        </ScrollReveal>
        <ScrollReveal variant="zoom-in" duration={700}>
          <section id="projects">
            <FeaturedProjects />
          </section>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" duration={700}>
          <section id="blog">
            <RecentPosts />
          </section>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" duration={700}>
          <section id="partners">
            <PartnersSlider />
          </section>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" duration={700} delay={100}>
          <section id="testimonials">
            <TestimonialsSlider />
          </section>
        </ScrollReveal>
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
