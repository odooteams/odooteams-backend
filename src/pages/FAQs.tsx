import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '@/lib/LanguageContext';
import FAQsSection from "@/components/common/FAQsSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt";
import StickyContact from "@/components/common/StickyContact";
import useFaqs from "@/hooks/useFaqs";
const FAQs = () => {
  const {
    dir,
    t
  } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const {
    categories,
    isLoading
  } = useFaqs();
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  return <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
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
            
            {/* Categories filter */}
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
      <div className="h-16 md:hidden" /> {/* Spacer for bottom navigation */}
    </div>;
};
export default FAQs;