
import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import useWhatsAppShare from "./useWhatsAppShare";
import { useServiceSheet } from "./useServiceSheet";

export const useServices = () => {
  const { t, language } = useLanguage();
  const { requestServiceViaWhatsApp } = useWhatsAppShare();

  // Use data fetched from Google Sheets
  const { services: allServices, isLoading, error } = useServiceSheet();

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
