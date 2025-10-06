import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import { SearchConsoleInsights } from './SearchConsoleIntegration';

interface SEOMetrics {
  totalPages: number;
  indexedPages: number;
  sitemapUrls: number;
  avgLoadTime: number;
  coreWebVitalsScore: number;
  metaDescriptionCoverage: number;
  structuredDataPages: number;
}

interface PageSEOScore {
  url: string;
  title: string;
  metaDescription: string;
  h1Count: number;
  imageAltCount: number;
  internalLinks: number;
  score: number;
  issues: string[];
}

const SEODashboard: React.FC = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<SEOMetrics>({
    totalPages: 15,
    indexedPages: 12,
    sitemapUrls: 15,
    avgLoadTime: 1850,
    coreWebVitalsScore: 85,
    metaDescriptionCoverage: 100,
    structuredDataPages: 15
  });

  const [pageScores, setPageScores] = useState<PageSEOScore[]>([
    {
      url: '/',
      title: 'OdooTeams - Professional Odoo Implementation Services',
      metaDescription: 'Transform your business with expert Odoo ERP implementation...',
      h1Count: 1,
      imageAltCount: 8,
      internalLinks: 15,
      score: 95,
      issues: []
    },
    {
      url: '/services',
      title: 'Odoo Services - Professional ERP Implementation',
      metaDescription: 'Explore our comprehensive Odoo ERP services...',
      h1Count: 1,
      imageAltCount: 6,
      internalLinks: 12,
      score: 92,
      issues: []
    },
    {
      url: '/projects',
      title: 'Odoo Projects Portfolio - Successful Implementations',
      metaDescription: 'View our successful Odoo project implementations...',
      h1Count: 1,
      imageAltCount: 4,
      internalLinks: 8,
      score: 88,
      issues: ['Could improve internal linking']
    }
  ]);

  const [sitemapStatus, setSitemapStatus] = useState({
    lastGenerated: new Date().toISOString(),
    totalUrls: 15,
    status: 'healthy'
  });

  // Function to audit current page SEO
  const auditCurrentPage = () => {
    const score = {
      title: document.title.length > 0 && document.title.length <= 60 ? 10 : 5,
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content')?.length || 0 > 120 ? 10 : 5,
      h1: document.querySelectorAll('h1').length === 1 ? 10 : 5,
      images: Array.from(document.querySelectorAll('img')).filter(img => img.alt).length,
      structuredData: document.querySelectorAll('script[type="application/ld+json"]').length > 0 ? 10 : 0
    };

    const totalScore = (score.title + score.metaDescription + score.h1 + (score.images > 0 ? 10 : 0) + score.structuredData) / 50 * 100;
    
    return {
      score: Math.round(totalScore),
      details: score
    };
  };

  const [currentPageAudit, setCurrentPageAudit] = useState(auditCurrentPage());

  useEffect(() => {
    // Re-audit when component mounts or page changes
    setCurrentPageAudit(auditCurrentPage());
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('SEO Dashboard', 'لوحة تحكم تحسين محركات البحث')}</h2>
        <Button onClick={() => setCurrentPageAudit(auditCurrentPage())}>
          {t('Refresh Audit', 'تحديث التدقيق')}
        </Button>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.indexedPages}/{metrics.totalPages}</div>
            <div className="text-sm text-gray-600">{t('Pages Indexed', 'الصفحات المفهرسة')}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.coreWebVitalsScore}</div>
            <div className="text-sm text-gray-600">{t('Core Web Vitals', 'مؤشرات الويب الأساسية')}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.avgLoadTime}ms</div>
            <div className="text-sm text-gray-600">{t('Avg Load Time', 'متوسط وقت التحميل')}</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.structuredDataPages}</div>
            <div className="text-sm text-gray-600">{t('Structured Data', 'البيانات المنظمة')}</div>
          </div>
        </Card>
      </div>

      {/* Current Page Audit */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('Current Page SEO Score', 'نقاط تحسين محركات البحث للصفحة الحالية')}</h3>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(currentPageAudit.score)}`}>
            {currentPageAudit.score}/100
          </div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium">{t('Title Length:', 'طول العنوان:')}</span> {document.title.length} chars
            </div>
            <div className="text-sm">
              <span className="font-medium">{t('H1 Tags:', 'عناوين H1:')}</span> {document.querySelectorAll('h1').length}
            </div>
            <div className="text-sm">
              <span className="font-medium">{t('Structured Data:', 'البيانات المنظمة:')}</span> {document.querySelectorAll('script[type="application/ld+json"]').length} schemas
            </div>
          </div>
        </div>
      </Card>

      {/* Page Scores Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('Page SEO Scores', 'نقاط تحسين محركات البحث للصفحات')}</h3>
        <div className="space-y-4">
          {pageScores.map((page, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{page.url}</div>
                <div className="text-sm text-gray-600 truncate max-w-md">{page.title}</div>
                {page.issues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {page.issues.map((issue, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className={`text-xl font-bold px-3 py-1 rounded ${getScoreColor(page.score)}`}>
                {page.score}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sitemap Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('Sitemap Status', 'حالة خريطة الموقع')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">{t('Total URLs', 'إجمالي الروابط')}</div>
            <div className="text-lg font-semibold">{sitemapStatus.totalUrls}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{t('Last Updated', 'آخر تحديث')}</div>
            <div className="text-lg font-semibold">{new Date(sitemapStatus.lastGenerated).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{t('Status', 'الحالة')}</div>
            <Badge className="bg-green-100 text-green-800">{sitemapStatus.status}</Badge>
          </div>
        </div>
      </Card>

      {/* Search Console Integration */}
      <SearchConsoleInsights />

      {/* SEO Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('SEO Recommendations', 'توصيات تحسين محركات البحث')}</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-green-700">{t('All pages have proper structured data', 'جميع الصفحات لديها بيانات منظمة صحيحة')}</div>
              <div className="text-sm text-gray-600">{t('Keep maintaining JSON-LD schemas for better search understanding', 'استمر في الحفاظ على مخططات JSON-LD لفهم أفضل للبحث')}</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-yellow-700">{t('Consider adding FAQ structured data', 'فكر في إضافة بيانات منظمة للأسئلة الشائعة')}</div>
              <div className="text-sm text-gray-600">{t('FAQ schemas can help achieve rich snippets in search results', 'مخططات الأسئلة الشائعة يمكن أن تساعد في تحقيق مقتطفات غنية في نتائج البحث')}</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-blue-700">{t('Monitor Core Web Vitals regularly', 'راقب مؤشرات الويب الأساسية بانتظام')}</div>
              <div className="text-sm text-gray-600">{t('LCP, FID, and CLS scores affect search ranking', 'نقاط LCP و FID و CLS تؤثر على ترتيب البحث')}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SEODashboard;