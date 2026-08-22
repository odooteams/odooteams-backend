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
  image = "https://odooteams.com/uploads/e8433aef-9332-4de5-a325-42043909dbab.png",
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
  
  // Auto-generate hreflang alternates when none were provided by the page
  const effectiveAlternates = alternateUrls.length ? alternateUrls : [
    { hreflang: 'en', href: `${canonical}${canonical.includes('?') ? '&' : '?'}lang=en` },
    { hreflang: 'ar', href: `${canonical}${canonical.includes('?') ? '&' : '?'}lang=ar` },
    { hreflang: 'x-default', href: canonical },
  ];

  // Global ProfessionalService & Organization Entity Graph for AI & Search Engines
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://odooteams.com/#organization",
    "name": "OdooTeams",
    "alternateName": "OdooTeams ERP Solutions",
    "url": "https://odooteams.com",
    "logo": "https://odooteams.com/uploads/e8433aef-9332-4de5-a325-42043909dbab.png",
    "image": "https://odooteams.com/uploads/e8433aef-9332-4de5-a325-42043909dbab.png",
    "description": "Enterprise Odoo ERP implementation, custom development, version migration, training, and 24/7 SLA support worldwide.",
    "email": "contact@odooteams.com",
    "priceRange": "$$",
    "currenciesAccepted": "USD, AED, SAR, EUR",
    "paymentAccepted": "Bank Transfer, Credit Card, Wire",
    "areaServed": [
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Saudi Arabia" },
      { "@type": "Country", "name": "Egypt" },
      { "@type": "Country", "name": "Qatar" },
      { "@type": "Country", "name": "Kuwait" },
      { "@type": "GeoShape", "name": "Worldwide" }
    ],
    "knowsAbout": [
      "Odoo ERP Implementation",
      "Odoo Custom Module Development",
      "Saudi ZATCA Phase 2 E-Invoicing",
      "UAE FTA VAT Compliance",
      "Odoo Migration to Odoo 17 & 18",
      "Odoo Community and Enterprise",
      "ERP Cloud Hosting & DevOps"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AE",
      "addressLocality": "Dubai"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "Customer Support & Sales",
        "email": "contact@odooteams.com",
        "availableLanguage": ["English", "Arabic"]
      }
    ],
    "sameAs": [
      "https://twitter.com/odooteams",
      "https://linkedin.com/company/odooteams",
      "https://github.com/odooteams"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Odoo ERP Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Odoo Implementation",
            "description": "Full-cycle Odoo ERP deployment tailored to business workflows."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Module Development",
            "description": "Bespoke Python and XML modules for unique business logic."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ZATCA & GCC Localization",
            "description": "Compliant tax invoicing, ZATCA Phase 2 integration, and WPS payroll."
          }
        }
      ]
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://odooteams.com/#website",
    "name": "OdooTeams",
    "url": "https://odooteams.com",
    "publisher": {
      "@id": "https://odooteams.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://odooteams.com/services?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Breadcrumb schema generation for inner pages
  const pathSegments = location.pathname.split('/').filter(Boolean);
  let breadcrumbData: object | null = null;
  if (pathSegments.length > 0) {
    breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://odooteams.com"
        },
        ...pathSegments.map((segment, index) => {
          const itemUrl = `https://odooteams.com/${pathSegments.slice(0, index + 1).join('/')}`;
          const formattedName = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          return {
            "@type": "ListItem",
            "position": index + 2,
            "name": formattedName,
            "item": itemUrl
          };
        })
      ]
    };
  }

  const allStructuredData = [
    organizationData,
    websiteData,
    ...(breadcrumbData ? [breadcrumbData] : []),
    ...structuredData
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Alternate URLs for i18n */}
      {effectiveAlternates.map((alt, index) => (
        <link key={index} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}

      {/* LLMs text discovery link */}
      <link rel="alternate" type="text/markdown" title="LLM Knowledge Base" href="/llms.txt" />
      
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
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
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