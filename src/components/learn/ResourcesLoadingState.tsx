
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Loader2 } from 'lucide-react';

interface ResourcesLoadingStateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ResourcesLoadingState: React.FC<ResourcesLoadingStateProps> = ({
  loading,
  error,
  onRetry
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-odoo-purple mx-auto" />
          <p className="mt-4 text-lg text-gray-600">{t('Loading resources...', 'جاري تحميل الموارد...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">{t('Error', 'خطأ')}</h2>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={onRetry}
              className="mt-4 bg-odoo-purple text-white px-4 py-2 rounded hover:bg-odoo-magenta transition-colors"
            >
              {t('Retry', 'إعادة المحاولة')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ResourcesLoadingState;
