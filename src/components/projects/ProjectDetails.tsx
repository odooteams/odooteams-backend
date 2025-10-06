
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface ProjectDetailsProps {
  challenges: string;
  solutions: string;
  results: string;
}

const ProjectDetailsSection: React.FC<ProjectDetailsProps> = ({
  challenges,
  solutions,
  results
}) => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-odoo-purple">{t('The Challenge', 'التحدي')}</h3>
            <p className="text-gray-700">{challenges}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-odoo-purple">{t('Our Solution', 'الحل')}</h3>
            <p className="text-gray-700">{solutions}</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-odoo-purple">{t('The Results', 'النتائج')}</h3>
            <p className="text-gray-700">{results}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectDetailsSection;
