import { useParams } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import useWhatsAppShare from "@/hooks/useWhatsAppShare";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { findProjectBySlug, createProjectSlug } from "@/lib/projectUtils";
import { projectsQueries } from "@/lib/supabase/queries";

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  clientName?: string;
  description: string;
  technologies: string[];
  images: string[];
  projectUrl?: string;
  completionDate?: string;
  featured?: boolean;
  challenges?: string;
  solutions?: string;
  results?: string;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  cost?: string;
  processingSteps?: string;
}

export const useProjectDetails = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();

  const {
    data: rawProjects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", language],
    queryFn: () => projectsQueries.getAll(),
  });

  const project: ProjectData | undefined = useMemo(() => {
    if (!slug || isLoading) return undefined;
    // Find project by matching slug against both English and Arabic titles
    const raw = rawProjects.find((p: any) => 
      createProjectSlug(p.title_en) === slug || createProjectSlug(p.title_ar) === slug
    );
    if (!raw) return undefined;
    return {
      id: raw.id,
      title: language === 'ar' ? raw.title_ar : raw.title_en,
      category: language === 'ar' ? raw.category_ar : raw.category_en,
      description: language === 'ar' ? raw.description_ar : raw.description_en,
      processingSteps: language === 'ar' ? raw.processing_steps_ar : raw.processing_steps_en,
      technologies: raw.technologies || [],
      images: raw.images || [],
      projectUrl: raw.project_url,
      clientName: raw.client_name,
      cost: raw.cost,
      completionDate: raw.completion_date,
      featured: raw.is_featured,
      challenges: '',
      solutions: '',
      results: '',
      testimonial: undefined,
    } as ProjectData;
  }, [slug, rawProjects, isLoading, language]);

  const handleContactRequest = () => {
    requestServiceViaWhatsApp(
      t("I would like to discuss a similar project to", "أود مناقشة مشروع مماثل لـ") +
        ` ${project?.title ?? ""}`
    );
  };

  const visitProject = () => {
    if (project?.projectUrl) window.open(project.projectUrl, "_blank", "noopener,noreferrer");
  };

  return {
    project,
    isLoading,
    error,
    handleContactRequest,
    visitProject,
  };
};
