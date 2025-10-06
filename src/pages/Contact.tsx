
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import StickyContact from '@/components/common/StickyContact';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import ContactFAQ from '@/components/contact/ContactFAQ';

const Contact = () => {
  const { dir } = useLanguage();
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main>
        <ContactHero />

        {/* Contact section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <ContactForm />
              
              {/* Contact Info */}
              <ContactInfo />
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <ContactFAQ />
      </main>
      <StickyContact />
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" /> {/* Spacer for bottom navigation */}
    </div>
  );
};

export default Contact;
