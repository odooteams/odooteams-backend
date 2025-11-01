import { useParams } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import useWhatsAppShare from "@/hooks/useWhatsAppShare";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { findProjectBySlug } from "@/lib/projectUtils";
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

  const sheetProjects = useMemo(() => 
    rawProjects.map((p: any): ProjectData => ({
      id: p.id,
      title: language === 'ar' ? p.title_ar : p.title_en,
      category: language === 'ar' ? p.category_ar : p.category_en,
      description: language === 'ar' ? p.description_ar : p.description_en,
      processingSteps: language === 'ar' ? p.processing_steps_ar : p.processing_steps_en,
      technologies: p.technologies || [],
      images: p.images || [],
      projectUrl: p.project_url,
      clientName: p.client_name,
      cost: p.cost,
      completionDate: p.completion_date,
      featured: p.is_featured,
      challenges: '',
      solutions: '',
      results: '',
      testimonial: undefined,
    })), 
  [rawProjects, language]);

  const project: ProjectData | undefined = useMemo(() => {
    if (!slug || isLoading) return undefined;
    return findProjectBySlug(sheetProjects, slug);
  }, [slug, sheetProjects, isLoading]);

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
