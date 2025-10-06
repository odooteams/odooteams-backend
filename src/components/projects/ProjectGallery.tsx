
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface ProjectGalleryProps {
  projectTitle: string;
  images: string[];
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ projectTitle, images }) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('Project Gallery', 'معرض المشروع')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <img 
                src={image} 
                alt={`${projectTitle} - Image ${index + 1}`} 
                className="w-full h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectGallery;
