
import React, { useState } from "react";
import RichText from '@/components/common/RichText';
import { useFaqs } from "@/hooks/useFaqs";
import { useLanguage } from "@/lib/LanguageContext";
import { ChevronDown } from "lucide-react";

interface FAQsSectionProps {
  categoryFilter?: string;
  limit?: number;
}

const FAQsSection: React.FC<FAQsSectionProps> = ({ categoryFilter = "", limit }) => {
  const { faqs, categories, isLoading } = useFaqs(categoryFilter);
  const { dir } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  // Filter by active category if one is selected
  const filteredFaqs = activeCategory 
    ? faqs.filter(faq => faq.category === activeCategory) 
    : faqs;

  // Apply limit if provided
  const displayFaqs = limit ? filteredFaqs.slice(0, limit) : filteredFaqs;

  if (isLoading) {
    return <div className="py-10 text-center">{dir === "rtl" ? "جاري التحميل..." : "Loading FAQs..."}</div>;
  }
  
  if (!faqs.length) {
    return <div className="py-10 text-center text-gray-400">{dir === "rtl" ? "لا توجد أسئلة شائعة" : "No FAQs available."}</div>
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{dir === "rtl" ? "الأسئلة الشائعة" : "FAQs"}</h2>
        
        {/* Categories filter (show only if multiple categories exist) */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm transition ${
                activeCategory === "" 
                ? "bg-odoo-purple text-white" 
                : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setActiveCategory("")}
            >
              {dir === "rtl" ? "الكل" : "All"}
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  activeCategory === category 
                  ? "bg-odoo-purple text-white" 
                  : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        <div className="max-w-2xl mx-auto">
          {displayFaqs.map((faq, i) => (
            <div key={i} className="mb-4 border rounded shadow-sm bg-gray-50">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-lg font-medium text-odoo-purple focus:outline-none"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="px-5 py-4 border-t text-gray-700 leading-relaxed animate-fade-in">
                  <RichText html={faq.contents} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQsSection;
