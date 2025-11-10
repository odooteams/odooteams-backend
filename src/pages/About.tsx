
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

const About = () => {
  const { dir } = useLanguage();

  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
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
      <div className="h-16 md:hidden" /> {/* Spacer for bottom navigation */}
    </div>
  );
};

export default About;
