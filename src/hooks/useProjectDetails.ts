
import { useParams } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import useWhatsAppShare from "@/hooks/useWhatsAppShare";
import { GOOGLE_SHEETS_CONFIG, fetchSheetData } from "@/lib/googleSheets";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { findProjectBySlug } from "@/lib/projectUtils";

export interface ProjectData {
  id: number;
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
}

export const useProjectDetails = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();

  const {
    data: sheetProjects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects-sheet", language],
    queryFn: async () => {
      const data = await fetchSheetData(
        GOOGLE_SHEETS_CONFIG.API_KEY,
        GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
        "projects"
      );

      return data.map((row: any, i: number): ProjectData => {
        const title =
          language === "ar" ? row.Title_ar || row.Title_en : row.Title_en || row.Title_ar;
        const category =
          language === "ar"
            ? row.Category_ar || row.Category_en
            : row.Category_en || row.Category_ar;
        const description =
          language === "ar"
            ? row["project-details_ar"] || row["project-details_en"] || ""
            : row["project-details_en"] || row["project-details_ar"] || "";
        const technologies =
          language === "ar"
            ? row["prog_lang_ar"]
              ? row["prog_lang_ar"].split(",").map((s: string) => s.trim())
              : []
            : row["prog_lang_en"]
            ? row["prog_lang_en"].split(",").map((s: string) => s.trim())
            : [];
        const images = [
          row["Gallery-1"],
          row["Gallery-2"],
          row["Gallery-3"]
        ].filter(Boolean);

        const projectUrl = row.project_url || "";
        const clientName = row.clientName || "";
        const cost = row.cost || "";

        // Processing steps as challenge/solution/results (if present)
        let challenges = row["Processing_steps_en"] || "";
        let solutions = "";
        let results = "";
        if (language === "ar") {
          challenges = row["Processing_steps_ar"] || challenges;
        }
        // Optionally: you might want to parse real structure based on your sheet layout

        return {
          id: i + 1,
          title,
          category,
          description,
          technologies,
          images: images.length ? images : [row.image].filter(Boolean),
          projectUrl,
          clientName,
          cost,
          // These can be expanded if sheet provides:
          challenges,
          solutions,
          results,
          testimonial: undefined,
          featured: false,
        };
      });
    },
    // Fetch only once per language
    staleTime: 1000 * 60 * 5,
  });

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
