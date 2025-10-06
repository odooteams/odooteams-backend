
import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { GOOGLE_SHEETS_CONFIG, fetchSheetData } from '@/lib/googleSheets';
import useWhatsAppShare from './useWhatsAppShare';

export interface Project {
  id: number;
  title: string;
  category: string;
  clientName?: string;
  description: string;
  technologies: string[];
  images: string[];
  completionDate?: string;
  featured?: boolean;
  cost?: string;
  projectUrl?: string;
}

export const useProjects = () => {
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();

  const [sheetProjects, setSheetProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // States for filtering and view
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchSheetData(
        GOOGLE_SHEETS_CONFIG.API_KEY,
        GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID,
        "projects"
      );

      // Map Google Sheet row to our project format
      const projects: Project[] = data.map((row: any, i: number) => {
        const title = language === 'ar' ? (row.Title_ar || row.Title_en) : (row.Title_en || row.Title_ar);
        const category = language === 'ar' ? (row.Category_ar || row.Category_en) : (row.Category_en || row.Category_ar);
        const description = language === 'ar'
          ? (row['project-details_ar'] || row['project-details_en'] || '')
          : (row['project-details_en'] || row['project-details_ar'] || '');

        const processing_steps = language === 'ar'
          ? (row['Processing_steps_ar'] || row['Processing_steps_en'] || '')
          : (row['Processing_steps_en'] || row['Processing_steps_ar'] || '');

        const technologies = language === 'ar'
          ? (row['prog_lang_ar'] ? row['prog_lang_ar'].split(',').map((s: string) => s.trim()) : [])
          : (row['prog_lang_en'] ? row['prog_lang_en'].split(',').map((s: string) => s.trim()) : []);

        const images = [row["Gallery-1"], row["Gallery-2"], row["Gallery-3"]].filter(Boolean);

        return {
          id: i + 1, // no "id" column, fallback to index
          title,
          category,
          description,
          technologies,
          images: images.length ? images : [row.image].filter(Boolean),
          cost: row.cost,
          projectUrl: row.project_url,
          // Optional fields:
          clientName: row.clientName || '', // Map if exists
          featured: false,
        };
      });

      setSheetProjects(projects);
      setLoading(false);
    }
    load();
  }, [language]);

  // Extract unique categories for dropdown
  const categories = useMemo(() =>
    Array.from(new Set(sheetProjects.map(project => project.category || ''))),
    [sheetProjects]
  );

  // Filter projects based on search term and category
  const filteredProjects = useMemo(() =>
    sheetProjects.filter(project => {
      const matchesTerm =
        (project.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.technologies || []).some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === '' || project.category === categoryFilter;
      return matchesTerm && matchesCategory;
    }),
    [sheetProjects, searchTerm, categoryFilter]
  );

  // Handle contact via WhatsApp
  const handleContactRequest = () => {
    requestServiceViaWhatsApp(t('I would like to discuss a similar project', 'أود مناقشة مشروع مماثل'));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const currentProjects = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProjects, currentPage, itemsPerPage]);

  return {
    projects: currentProjects,
    filteredProjectsCount: filteredProjects.length,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    isGridView,
    setIsGridView,
    categories,
    currentPage,
    setCurrentPage,
    totalPages,
    handleContactRequest
  };
};

