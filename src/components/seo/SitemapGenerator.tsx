import { useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { useProjects } from '@/hooks/useProjects';
import { createProjectSlug } from '@/lib/projectUtils';
import { createServiceSlug } from '@/lib/serviceUtils';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates?: Array<{ hreflang: string; href: string; }>;
}

export const generateSitemapXML = (urls: SitemapURL[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
  const urlsetClose = '</urlset>';

  const urlElements = urls.map(url => {
    const alternateLinks = url.alternates?.map(alt => 
      `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
    ).join('\n') || '';

    return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
${alternateLinks}
  </url>`;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
};

export const useAutomaticSitemapGeneration = () => {
  const { services } = useServices();
  const { projects } = useProjects();

  useEffect(() => {
    if (!services || !projects) return;

    const baseUrl = 'https://odooteams.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Static pages
    const staticUrls: SitemapURL[] = [
      {
        loc: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 1.0,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/?lang=ar` }
        ]
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/about?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/about?lang=ar` }
        ]
      },
      {
        loc: `${baseUrl}/services`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.9,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/services?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/services?lang=ar` }
        ]
      },
      {
        loc: `${baseUrl}/projects`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.8,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/projects?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/projects?lang=ar` }
        ]
      },
      {
        loc: `${baseUrl}/learn-odoo`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.8,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/learn-odoo?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/learn-odoo?lang=ar` }
        ]
      },
      {
        loc: `${baseUrl}/faqs`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/faqs?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/faqs?lang=ar` }
        ]
      },
      {
        loc: `${baseUrl}/contact`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: 0.6,
        alternates: [
          { hreflang: 'en', href: `${baseUrl}/contact?lang=en` },
          { hreflang: 'ar', href: `${baseUrl}/contact?lang=ar` }
        ]
      }
    ];

    // Dynamic service pages
    const serviceUrls: SitemapURL[] = services.map(service => ({
      loc: `${baseUrl}/services/${createServiceSlug(service.title)}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7,
      alternates: [
        { hreflang: 'en', href: `${baseUrl}/services/${createServiceSlug(service.title)}?lang=en` },
        { hreflang: 'ar', href: `${baseUrl}/services/${createServiceSlug(service.title)}?lang=ar` }
      ]
    }));

    // Dynamic project pages
    const projectUrls: SitemapURL[] = projects.map(project => ({
      loc: `${baseUrl}/projects/${createProjectSlug(project.title)}`,
      lastmod: project.completionDate || currentDate,
      changefreq: 'yearly',
      priority: 0.6,
      alternates: [
        { hreflang: 'en', href: `${baseUrl}/projects/${createProjectSlug(project.title)}?lang=en` },
        { hreflang: 'ar', href: `${baseUrl}/projects/${createProjectSlug(project.title)}?lang=ar` }
      ]
    }));

    const allUrls = [...staticUrls, ...serviceUrls, ...projectUrls];
    const sitemapXML = generateSitemapXML(allUrls);

    // In a real implementation, you would send this to your backend or generate files
    console.log('Generated sitemap:', sitemapXML);
    
    // Store in localStorage for development purposes
    localStorage.setItem('generatedSitemap', sitemapXML);
  }, [services, projects]);
};

// Hook for generating robots.txt
export const useRobotsGenerator = () => {
  const generateRobotsTxt = () => {
    return `User-agent: *
Allow: /

# Specific crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Disallow admin or sensitive areas
Disallow: /admin/
Disallow: /private/
Disallow: /.well-known/

# Sitemap location
Sitemap: https://odooteams.com/sitemap.xml
Sitemap: https://odooteams.com/sitemap-pages.xml
Sitemap: https://odooteams.com/sitemap-services.xml
Sitemap: https://odooteams.com/sitemap-projects.xml

# Crawl delay
Crawl-delay: 1`;
  };

  return { generateRobotsTxt };
};