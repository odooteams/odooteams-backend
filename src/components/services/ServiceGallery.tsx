
import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ServiceGalleryProps {
  serviceTitle: string;
  images: string[];
}

const ServiceGallery: React.FC<ServiceGalleryProps> = ({ serviceTitle, images }) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 3;
  
  if (!images || images.length === 0) return null;
  
  // Filter out any empty image URLs
  const validImages = images.filter(img => img && img.trim() !== '');
  
  if (validImages.length === 0) return null;
  
  // Calculate total pages
  const totalPages = Math.ceil(validImages.length / imagesPerPage);
  
  // Get current images
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = validImages.slice(indexOfFirstImage, indexOfLastImage);
  
  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-odoo-purple">
          {t('Gallery', 'معرض الصور')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentImages.map((image, index) => (
            <img 
              key={index}
              src={image}
              alt={`${serviceTitle} - ${indexOfFirstImage + index + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            />
          ))}
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  );
};

export default ServiceGallery;
