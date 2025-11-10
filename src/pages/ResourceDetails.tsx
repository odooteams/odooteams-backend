
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchLearnResources, LearnResource } from '@/lib/learnResources';
import ResourcesLoadingState from '@/components/learn/ResourcesLoadingState';
import ResourceBreadcrumb from '@/components/learn/ResourceBreadcrumb';
import ResourceHero from '@/components/learn/ResourceHero';
import ResourceTableOfContents from '@/components/learn/ResourceTableOfContents';
import ResourceContent from '@/components/learn/ResourceContent';
import RelatedResources from '@/components/learn/RelatedResources';

const ResourceDetails = () => {
  const { id } = useParams();
  const { language, dir } = useLanguage();
  const [resource, setResource] = useState<LearnResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedResources, setRelatedResources] = useState<LearnResource[]>([]);
  
  useEffect(() => {
    const loadResource = async () => {
      try {
        setLoading(true);
        const data = await fetchLearnResources();
        
        // Find the resource with the matching id
        const foundResource = data.find(item => item.id === id);
        
        if (foundResource) {
          setResource(foundResource);
          
          // Get 3 related resources from the same category
          const related = data
            .filter(item => {
              const sameCategory = language === 'en' 
                ? item.Category_en === foundResource.Category_en
                : item.Category_ar === foundResource.Category_ar;
              return sameCategory && item.id !== id;
            })
            .slice(0, 3);
            
          setRelatedResources(related);
        } else {
          setError(language === 'en' 
            ? 'Resource not found.' 
            : 'لم يتم العثور على المورد.'
          );
        }
      } catch (err) {
        console.error("Failed to load resource:", err);
        setError(language === 'en'
          ? 'Failed to load resource. Please try again later.'
          : 'فشل تحميل المورد. يرجى المحاولة مرة أخرى لاحقًا.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    loadResource();
  }, [id, language]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(dir === 'rtl' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  // Parse mainheaders from string to array
  const parseMainHeaders = (headers: string): string[] => {
    if (!headers) return [];
    try {
      // Assuming headers are comma-separated
      return headers.split(',').map(header => header.trim());
    } catch (e) {
      console.error("Error parsing main headers:", e);
      return [];
    }
  };
  
  // Handle share functionality
  const handleShare = async () => {
    if (!resource) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? resource.Title_en : resource.Title_ar,
          text: language === 'en' ? resource.contents_en : resource.contents_ar,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'en' ? 'Link copied to clipboard!' : 'تم نسخ الرابط إلى الحافظة!');
    }
  };
  
  if (loading || error || !resource) {
    return (
      <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
        <TopHeader />
        <Navbar />
        <ResourcesLoadingState 
          loading={loading} 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
        <Footer />
      </div>
    );
  }
  
  // Extract title and content based on language
  const title = language === 'en' ? resource.Title_en : resource.Title_ar;
  const content = language === 'en' ? resource.contents_en : resource.contents_ar;
  const author = language === 'en' ? resource.Auther_en : resource.Auther_ar;
  const mainHeaders = parseMainHeaders(language === 'en' ? resource.mainheaders_en : resource.mainheaders_ar);
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <TopHeader />
      <Navbar />
      <main>
        {/* Breadcrumb */}
        <ResourceBreadcrumb title={title} />

        {/* Hero Section */}
        <ResourceHero 
          resource={resource}
          formatDate={formatDate}
          handleShare={handleShare}
        />

        {/* Content section with Table of Contents */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Table of contents sidebar using mainheaders */}
              <div className="lg:w-1/4">
                <ResourceTableOfContents mainHeaders={mainHeaders} />
              </div>
              
              {/* Main content */}
              <div className="lg:w-3/4">
                <ResourceContent 
                  resource={resource}
                  mainHeaders={mainHeaders}
                  content={content}
                  formatDate={formatDate}
                  author={author}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Resources */}
        <RelatedResources relatedResources={relatedResources} />
      </main>
      <Footer />
    </div>
  );
};

export default ResourceDetails;
