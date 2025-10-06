import React from 'react';

// Service Structured Data
export const createServiceStructuredData = (service: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.details,
    "provider": {
      "@type": "Organization",
      "name": "OdooTeams",
      "url": "https://odooteams.com"
    },
    "serviceType": service.category,
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Odoo Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.title
          }
        }
      ]
    }
  };
};

// Project/Portfolio Structured Data
export const createProjectStructuredData = (project: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description,
    "image": project.image,
    "creator": {
      "@type": "Organization",
      "name": "OdooTeams",
      "url": "https://odooteams.com"
    },
    "dateCreated": project.completionDate,
    "keywords": project.technologies?.join(', '),
    "url": project.projectUrl,
    "workExample": {
      "@type": "CreativeWork",
      "name": project.title,
      "description": project.description
    }
  };
};

// FAQ Structured Data
export const createFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Breadcrumb Structured Data
export const createBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

// Local Business Structured Data
export const createLocalBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "OdooTeams",
    "image": "https://odooteams.com/lovable-uploads/e8433aef-9332-4de5-a325-42043909dbab.png",
    "description": "Professional Odoo ERP implementation, customization, and development services",
    "url": "https://odooteams.com",
    "telephone": "+971-XXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.2048",
      "longitude": "55.2708"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "serviceArea": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Odoo Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Odoo Implementation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Odoo Customization"
          }
        },
        {
          "@type": "Service",
          "itemOffered": {
            "@type": "Service",
            "name": "Odoo Training"
          }
        }
      ]
    }
  };
};

// Review/Testimonial Structured Data
export const createReviewStructuredData = (reviews: Array<{
  author: string;
  rating: number;
  text: string;
  date?: string;
}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OdooTeams",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length,
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.text,
      "datePublished": review.date || new Date().toISOString()
    }))
  };
};

export default {
  createServiceStructuredData,
  createProjectStructuredData,
  createFAQStructuredData,
  createBreadcrumbStructuredData,
  createLocalBusinessStructuredData,
  createReviewStructuredData
};