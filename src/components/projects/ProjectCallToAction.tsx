
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

interface ProjectCtaProps {
  onContactRequest: () => void;
}

const ProjectCallToAction: React.FC<ProjectCtaProps> = ({ onContactRequest }) => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t('Interested in a similar project?', 'مهتم بمشروع مماثل؟')}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          {t('Contact us today to discuss how we can help with your business needs.', 'اتصل بنا اليوم لمناقشة كيف يمكننا المساعدة في احتياجات عملك.')}
        </p>
        <div className="flex justify-center gap-4 sticky bottom-0 bg-gray-100 py-4">
          <Button 
            onClick={onContactRequest}
            className="bg-odoo-magenta hover:bg-odoo-purple"
          >
            {t('Request Now', 'اطلب الآن')}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">
              {t('Contact Us', 'اتصل بنا')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectCallToAction;
