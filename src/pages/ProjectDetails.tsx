
import React from 'react';
import TopHeader from '@/components/layout/TopHeader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import { useProjectDetails } from '@/hooks/useProjectDetails';
import ProjectBreadcrumb from '@/components/projects/ProjectBreadcrumb';
import ProjectHero from '@/components/projects/ProjectHero';
import ProjectDetailsSection from '@/components/projects/ProjectDetails';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectTestimonial from '@/components/projects/ProjectTestimonial';
import ProjectCallToAction from '@/components/projects/ProjectCallToAction';
import { useLanguage } from '@/lib/LanguageContext';
import SEOHead from '@/components/seo/SEOHead';
import { createBreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { createProjectSlug } from '@/lib/projectUtils';
import { generateAlternateUrls } from '@/lib/canonicalUtils';

const ProjectDetails = () => {
  const { dir, t } = useLanguage();
  const { project, handleContactRequest, visitProject, isLoading, error } = useProjectDetails();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[300px] text-xl">{dir === "rtl" ? "جاري التحميل..." : "Loading..."}</div>
  }
  if (!project) {
    return <div className="flex items-center justify-center min-h-[300px] text-xl text-red-500">{dir === "rtl" ? "لم يتم العثور على المشروع" : "Project not found"}</div>
  }

  // Create structured data for project details
  const projectStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": project.title,
      "description": project.description,
      "creator": {
        "@type": "Organization",
        "name": "OdooTeams"
      },
      "dateCreated": project.completionDate,
      "image": project.images?.[0]
    },
    createBreadcrumbStructuredData([
      { name: 'Home', url: 'https://odooteams.com' },
      { name: 'Projects', url: 'https://odooteams.com/projects' },
      { name: project.title, url: `https://odooteams.com/projects/${createProjectSlug(project.title)}` }
    ])
  ];

  return (
    <div className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <SEOHead
        title={`${project.title} - Odoo Project Case Study | OdooTeams`}
        description={`${project.description} View our successful Odoo project implementation with detailed case study and results.`}
        keywords={`${project.title}, Odoo project, ERP implementation, case study, ${project.clientName || 'client'}, Odoo success story`}
        canonicalUrl={`https://odooteams.com/projects/${createProjectSlug(project.title)}`}
        structuredData={projectStructuredData}
        alternateUrls={generateAlternateUrls(`/projects/${createProjectSlug(project.title)}`)}
      />
      <TopHeader />
      <Navbar />
      <main>
        <ProjectBreadcrumb projectTitle={project.title} />
        <ProjectHero 
          project={project}
          onContactRequest={handleContactRequest}
          onVisitProject={visitProject}
        />
        <ProjectDetailsSection
          challenges={project.challenges || ""}
          solutions={project.solutions || ""}
          results={project.results || ""}
        />
        <ProjectGallery 
          projectTitle={project.title}
          images={project.images}
        />
        {project.testimonial && (
          <ProjectTestimonial
            quote={project.testimonial.quote}
            author={project.testimonial.author}
            position={project.testimonial.position}
          />
        )}
        <ProjectCallToAction onContactRequest={handleContactRequest} />
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstallPrompt />
      <div className="h-16 md:hidden" /> {/* Spacer for bottom navigation */}
    </div>
  );
};

export default ProjectDetails;
