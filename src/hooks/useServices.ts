
import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import useWhatsAppShare from "./useWhatsAppShare";
import { useQuery } from "@tanstack/react-query";
import { servicesQueries } from "@/lib/supabase/queries";

export const useServices = () => {
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();

  // Fetch services from Supabase
  const { data: rawServices = [], isLoading, error } = useQuery({
    queryKey: ['services', language],
    queryFn: () => servicesQueries.getAll(language),
  });

  // Transform to match the expected format
  const allServices = useMemo(() => 
    rawServices.map((s: any) => ({
      id: s.id,
      title: language === 'ar' ? s.title_ar : s.title_en,
      category: language === 'ar' ? s.category_ar : s.category_en,
      details: language === 'ar' ? s.details_ar : s.details_en,
      processingSteps: language === 'ar' ? s.processing_steps_ar : s.processing_steps_en,
      image: s.image,
      price: s.price,
      duration: s.duration,
      keywords: s.keywords || [],
      is_featured: s.is_featured,
      is_active: s.is_active,
    })), 
  [rawServices, language]);

  // States for filtering and view
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Extract unique categories
  const categories = useMemo(
    () => Array.from(new Set(allServices.map((s) => s.category))).filter(Boolean),
    [allServices]
  );

  // Filter services
  const filteredServices = useMemo(() => {
    const match = (text: string, term: string) =>
      text?.toLowerCase().includes(term.toLowerCase());

    return allServices.filter((service) => {
      const matchesTerm =
        match(service.title, searchTerm) ||
        match(service.details, searchTerm) ||
        (service.keywords || []).some((k: string) =>
          match(k, searchTerm)
        );
      const matchesCategory =
        !categoryFilter || service.category === categoryFilter;
      return matchesTerm && matchesCategory;
    });
  }, [allServices, searchTerm, categoryFilter]);

  // WhatsApp request
  const handleWhatsAppRequest = (serviceName: string) => {
    requestServiceViaWhatsApp(serviceName);
  };

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const currentServices = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredServices, currentPage, itemsPerPage]);

  return {
    services: currentServices,
    filteredServicesCount: filteredServices.length,
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
    handleWhatsAppRequest,
    isLoading,
    error,
  };
};
