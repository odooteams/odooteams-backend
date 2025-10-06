import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { generateCanonicalUrl } from '@/lib/canonicalUtils';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
  alternateUrls?: { hreflang: string; href: string; }[];
  structuredData?: object[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = "https://odooteams.com/lovable-uploads/e8433aef-9332-4de5-a325-42043909dbab.png",
  article = false,
  publishedTime,
  modifiedTime,
  canonicalUrl,
  alternateUrls = [],
  structuredData = []
}) => {
  const location = useLocation();
  // Generate clean canonical URL without query parameters
  const canonical = canonicalUrl || generateCanonicalUrl(location.pathname);

  // Default structured data for organization
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OdooTeams",
    "url": "https://odooteams.com",
    "logo": "https://odooteams.com/lovable-uploads/e8433aef-9332-4de5-a325-42043909dbab.png",
    "description": "Professional Odoo ERP implementation, customization, and development services",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AE"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Arabic"]
    },
    "sameAs": [
      "https://twitter.com/odooteams",
      "https://linkedin.com/company/odooteams"
    ]
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "OdooTeams",
    "url": "https://odooteams.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://odooteams.com/services?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const allStructuredData = [organizationData, websiteData, ...structuredData];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Alternate URLs for i18n */}
      {alternateUrls.map((alt, index) => (
        <link key={index} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="OdooTeams" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ar_AE" />
      
      {/* Article specific OG tags */}
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@odooteams" />
      <meta name="twitter:creator" content="@odooteams" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;