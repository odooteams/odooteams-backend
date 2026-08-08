
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import StickyContact from '@/components/common/StickyContact';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import ContactFAQ from '@/components/contact/ContactFAQ';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { generateAlternateUrls } from '@/lib/canonicalUtils';
import { ScrollReveal } from '@/components/common/ScrollReveal';

const Contact = () => {
  const { dir } = useLanguage();
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title="Contact OdooTeams - Get a Free ERP Consultation"
        description="Contact OdooTeams for expert Odoo ERP implementation, customization, and support. Get a free consultation and transform your business today."
        keywords="contact OdooTeams, Odoo consultation, ERP support, Odoo help, business consultation"
        structuredData={[
          createBreadcrumbStructuredData([
            { name: 'Home', url: 'https://odooteams.com' },
            { name: 'Contact', url: 'https://odooteams.com/contact' }
          ])
        ]}
        alternateUrls={generateAlternateUrls('/contact')}
      />
      <TopHeader />
      <Navbar />
      <main>
        <ContactHero />
        <ScrollReveal variant="fade-up" duration={700}>
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <ScrollReveal variant="fade-right" duration={600}>
                  <ContactForm />
                </ScrollReveal>
                <ScrollReveal variant="fade-left" duration={600} delay={100}>
                  <ContactInfo />
                </ScrollReveal>
              </div>
            </div>
          </section>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" duration={700}>
          <ContactFAQ />
        </ScrollReveal>
      </main>
      <StickyContact />
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Contact;
