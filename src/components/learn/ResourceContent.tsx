
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Download } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { LearnResource } from '@/lib/learnResources';

interface ResourceContentProps {
  resource: LearnResource;
  mainHeaders: string[];
  content: string;
  formatDate: (dateString: string) => string;
  author: string;
}

const ResourceContent: React.FC<ResourceContentProps> = ({ 
  resource,
  mainHeaders,
  content,
  formatDate,
  author
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-odoo-purple">
        {t('Overview', 'نظرة عامة')}
      </h2>
      <p className="text-gray-700 mb-8 leading-relaxed whitespace-pre-line">
        {content}
      </p>
      
      {/* Content sections from mainheaders */}
      {mainHeaders.length > 0 && (
        <div className="mt-10 space-y-10">
          {mainHeaders.map((header, index) => (
            <div key={index} id={`section-${index}`} className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 text-odoo-purple">
                {header}
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {t('This section covers details about', 'يغطي هذا القسم تفاصيل حول')}: {header}
                </p>
                
                <Table className="mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Topic', 'الموضوع')}</TableHead>
                      <TableHead>{t('Description', 'الوصف')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell>{t('Details about this topic', 'تفاصيل حول هذا الموضوع')}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Author info card */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8">
        <div className="flex items-center">
          <img 
            src={resource.image || '/placeholder.svg'} 
            alt={author} 
            className="w-16 h-16 rounded-full mr-4 ml-reverse:rtl object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div>
            <h4 className="text-lg font-bold text-odoo-purple">
              {t('About the Author', 'عن المؤلف')}
            </h4>
            <p className="font-medium text-gray-800">{author}</p>
            <p className="text-sm text-gray-600">{t('Published on', 'نُشر في')}: {formatDate(resource.published_date || '')}</p>
          </div>
        </div>
      </div>
      
      {/* Download call to action */}
      {resource.download_url && (
        <div className="bg-odoo-purple text-white p-6 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">
            {t('Ready to get started with Odoo?', 'هل أنت جاهز للبدء مع أودو؟')}
          </h3>
          <p className="mb-4 opacity-90">
            {t('Download this resource to keep learning and improving your Odoo skills.', 'قم بتنزيل هذا المورد لمواصلة التعلم وتحسين مهاراتك في أودو.')}
          </p>
          <a 
            href={resource.download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-odoo-gold hover:bg-yellow-400 text-odoo-purple font-medium py-2 px-6 rounded inline-flex items-center transition-colors"
          >
            <Download className="h-5 w-5 mr-2 ml-reverse:rtl" />
            {t('Download Now', 'تحميل الآن')}
          </a>
        </div>
      )}
    </div>
  );
};

export default ResourceContent;
