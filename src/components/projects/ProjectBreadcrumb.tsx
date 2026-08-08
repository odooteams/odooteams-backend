
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';

interface ProjectBreadcrumbProps {
  projectTitle: string;
}

const ProjectBreadcrumb: React.FC<ProjectBreadcrumbProps> = ({ projectTitle }) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-gray-100 py-2">
      <div className="container mx-auto px-4">
        <nav className="flex text-sm">
          <Link to="/" className="text-gray-500 hover:text-odoo-magenta">
            {t('Home', 'الرئيسية')}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link to="/projects" className="text-gray-500 hover:text-odoo-magenta">
            {t('Projects', 'المشاريع')}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-odoo-purple">{projectTitle}</span>
        </nav>
      </div>
    </div>
  );
};

export default ProjectBreadcrumb;
