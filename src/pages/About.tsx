
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import AboutHero from '@/components/about/AboutHero';
import WhoWeAreSection from '@/components/about/WhoWeAreSection';
import StatsSection from '@/components/about/StatsSection';
import TimelineSection from '@/components/about/TimelineSection';
import TeamSection from '@/components/about/TeamSection';
import CtaSection from '@/components/about/CtaSection';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { generateAlternateUrls } from '@/lib/canonicalUtils';

const About = () => {
  const { dir } = useLanguage();

  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title="About OdooTeams - Expert Odoo ERP Consultants"
        description="Learn about OdooTeams, a leading Odoo ERP implementation partner. Discover our team, expertise, and commitment to delivering world-class business solutions."
        keywords="about OdooTeams, Odoo consultants, ERP experts, Odoo implementation partner, Odoo team"
        structuredData={[
          createBreadcrumbStructuredData([
            { name: 'Home', url: 'https://odooteams.com' },
            { name: 'About', url: 'https://odooteams.com/about' }
          ])
        ]}
        alternateUrls={generateAlternateUrls('/about')}
      />
      <TopHeader />
      <Navbar />
      <main>
        <AboutHero />
        <WhoWeAreSection />
        <StatsSection />
        <TimelineSection />
        <TeamSection />
        <CtaSection />
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default About;
