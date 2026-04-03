
import React from 'react';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BreadcrumbNav from '@/components/services/BreadcrumbNav';
import ServiceHero from '@/components/services/ServiceHero';
import ServiceDescription from '@/components/services/ServiceDescription';
import ServiceProcess from '@/components/services/ServiceProcess';
import ServiceGallery from '@/components/services/ServiceGallery';
import ServiceCta from '@/components/services/ServiceCta';

import { useServiceDetails } from '@/hooks/useServiceDetails';
import { useLanguage } from '@/lib/LanguageContext';
import SEOHead from '@/components/seo/SEOHead';
import { createServiceStructuredData, createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { createServiceSlug } from '@/lib/serviceUtils';
import { generateAlternateUrls } from '@/lib/canonicalUtils';

const ServiceDetails = () => {
  const { dir, t } = useLanguage();
  const { service, handleWhatsAppRequest, handleShare } = useServiceDetails();
  
  // Create structured data for service details
  const serviceStructuredData = [
    createServiceStructuredData(service),
    createBreadcrumbStructuredData([
      { name: 'Home', url: 'https://odooteams.com' },
      { name: 'Services', url: 'https://odooteams.com/services' },
      { name: service.title, url: `https://odooteams.com/services/${createServiceSlug(service.title)}` }
    ])
  ];
  
  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title={service.seo_title || `${service.title} - Professional Odoo Service | OdooTeams`}
        description={service.seo_description || `${service.details} Get expert ${service.title.toLowerCase()} services with professional Odoo implementation and support.`}
        keywords={service.seo_keywords || `${service.title}, Odoo ${service.title.toLowerCase()}, ERP ${service.title.toLowerCase()}, ${service.category}, Odoo implementation`}
        canonicalUrl={`https://odooteams.com/services/${createServiceSlug(service.title)}`}
        structuredData={serviceStructuredData}
        alternateUrls={generateAlternateUrls(`/services/${createServiceSlug(service.title)}`)}
      />
      <TopHeader />
      <Navbar />
      <main>
        {/* Breadcrumb */}
        <BreadcrumbNav serviceTitle={service.title} />

        {/* Hero Section */}
        <ServiceHero 
          service={service}
          onWhatsAppRequest={handleWhatsAppRequest}
          onShare={handleShare}
        />

        {/* Detailed Description */}
        <ServiceDescription 
          fullDescription={service.fullDescription}
          benefits={service.benefits}
        />
        
        {/* Process Steps */}
        <ServiceProcess steps={service.process} />
        
        {/* Gallery */}
        <ServiceGallery 
          serviceTitle={service.title}
          images={service.gallery}
        />
        
        {/* CTA Section */}
        <ServiceCta onWhatsAppRequest={handleWhatsAppRequest} />
        
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetails;
