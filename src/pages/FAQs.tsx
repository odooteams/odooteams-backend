import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '@/lib/LanguageContext';
import FAQsSection from "@/components/common/FAQsSection";
import TopHeader from '@/components/layout/TopHeader';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt";
import StickyContact from "@/components/common/StickyContact";
import useFaqs from "@/hooks/useFaqs";
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { generateAlternateUrls } from '@/lib/canonicalUtils';

const FAQs = () => {
  const { dir, t } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { faqs, categories, isLoading } = useFaqs();

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.slice(0, 20).map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: (f.contents || '').replace(/<[^>]*>/g, '').slice(0, 500),
      },
    })),
  } : null;

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title="FAQs - Odoo ERP Questions Answered | OdooTeams"
        description="Find answers to frequently asked questions about Odoo ERP implementation, customization, pricing, and support from OdooTeams."
        keywords="Odoo FAQ, ERP questions, Odoo implementation FAQ, Odoo pricing, Odoo support"
        structuredData={[
          createBreadcrumbStructuredData([
            { name: 'Home', url: 'https://odooteams.com' },
            { name: 'FAQs', url: 'https://odooteams.com/faqs' }
          ]),
          ...(faqSchema ? [faqSchema] : []),
        ]}
        alternateUrls={generateAlternateUrls('/faqs')}
      />
      <TopHeader />
      <Navbar />
      <main>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
              {dir === 'rtl' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              {dir === 'rtl' ? 'اكتشف إجابات لأكثر الأسئلة شيوعًا حول خدماتنا وكيفية عملنا.' : 'Find answers to the most common questions about our services and how we work.'}
            </p>
            {!isLoading && categories.length > 0}
          </div>
        </div>
        <div className="py-0">
          <FAQsSection categoryFilter={activeCategory} />
        </div>
      </main>
      <StickyContact />
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default FAQs;
