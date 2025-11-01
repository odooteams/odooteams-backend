import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import useWhatsAppShare from './useWhatsAppShare';
import { useQuery } from '@tanstack/react-query';
import { projectsQueries } from '@/lib/supabase/queries';

export interface Project {
  id: string;
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

  // Fetch projects from Supabase
  const { data: rawProjects = [], isLoading: loading } = useQuery({
    queryKey: ['projects', language],
    queryFn: () => projectsQueries.getAll(),
  });

  // Transform to match the expected format
  const sheetProjects = useMemo(() => 
    rawProjects.map((p: any) => ({
      id: p.id,
      title: language === 'ar' ? p.title_ar : p.title_en,
      category: language === 'ar' ? p.category_ar : p.category_en,
      description: language === 'ar' ? p.description_ar : p.description_en,
      processingSteps: language === 'ar' ? p.processing_steps_ar : p.processing_steps_en,
      images: p.images || [],
      technologies: p.technologies || [],
      cost: p.cost,
      projectUrl: p.project_url,
      completionDate: p.completion_date,
      clientName: p.client_name,
      featured: p.is_featured,
    })), 
  [rawProjects, language]);

  // States for filtering and view
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    categories: categories as string[],
    currentPage,
    setCurrentPage,
    totalPages,
    handleContactRequest
  };
};
