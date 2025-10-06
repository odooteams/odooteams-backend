import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Enhanced Analytics with Core Web Vitals and SEO metrics
const AdvancedAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const page_path = `${location.pathname}${location.search}${location.hash}`;

    // Enhanced page view tracking
    window.gtag('event', 'page_view', {
      page_path,
      page_title: document.title,
      page_location: window.location.href,
      content_group1: getContentGroup(location.pathname),
      custom_parameter_1: getPageCategory(location.pathname)
    });

    // Track Core Web Vitals
    trackCoreWebVitals();
    
    // Track SEO-related metrics
    trackSEOMetrics();

    console.debug('[Advanced Analytics] Enhanced page_view', { 
      page_path,
      content_group: getContentGroup(location.pathname),
      page_category: getPageCategory(location.pathname)
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
};

// Helper function to categorize content
const getContentGroup = (pathname: string): string => {
  if (pathname.startsWith('/services')) return 'Services';
  if (pathname.startsWith('/projects')) return 'Projects';
  if (pathname.startsWith('/learn-odoo')) return 'Learning';
  if (pathname === '/about') return 'About';
  if (pathname === '/contact') return 'Contact';
  if (pathname === '/faqs') return 'Support';
  if (pathname === '/') return 'Homepage';
  return 'Other';
};

// Helper function to get page category
const getPageCategory = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] || 'home';
};

// Track Core Web Vitals for SEO
const trackCoreWebVitals = () => {
  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        const lcpEntry = entry as any; // Type assertion for LCP entry
        window.gtag?.('event', 'core_web_vitals', {
          metric_name: 'LCP',
          metric_value: Math.round(lcpEntry.startTime),
          metric_rating: lcpEntry.startTime < 2500 ? 'good' : lcpEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
        });
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Track First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.entryType === 'first-input') {
        const fidEntry = entry as any; // Type assertion for FID entry
        const fid = fidEntry.processingStart - fidEntry.startTime;
        window.gtag?.('event', 'core_web_vitals', {
          metric_name: 'FID',
          metric_value: Math.round(fid),
          metric_rating: fid < 100 ? 'good' : fid < 300 ? 'needs_improvement' : 'poor'
        });
      }
    }
  }).observe({ entryTypes: ['first-input'] });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const clsEntry = entry as any; // Type assertion for CLS entry
      if (!clsEntry.hadRecentInput) {
        clsValue += clsEntry.value;
      }
    }
    window.gtag?.('event', 'core_web_vitals', {
      metric_name: 'CLS',
      metric_value: clsValue,
      metric_rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor'
    });
  }).observe({ entryTypes: ['layout-shift'] });
};

// Track SEO-related metrics
const trackSEOMetrics = () => {
  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    window.gtag?.('event', 'timing_complete', {
      name: 'page_load_time',
      value: loadTime
    });
  });

  // Track if page has proper meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  window.gtag?.('event', 'seo_audit', {
    has_meta_description: !!metaDescription,
    meta_description_length: metaDescription?.getAttribute('content')?.length || 0,
    page_title_length: document.title.length,
    has_h1: !!document.querySelector('h1')
  });

  // Track scroll depth for engagement
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      if (maxScroll === 25 || maxScroll === 50 || maxScroll === 75 || maxScroll === 90) {
        window.gtag?.('event', 'scroll_depth', {
          percent_scrolled: maxScroll
        });
      }
    }
  });
};

// Function to track custom events for SEO
export const trackSEOEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    ...parameters,
    timestamp: new Date().toISOString()
  });
};

// Function to track search queries
export const trackSearchQuery = (query: string, results: number, category?: string) => {
  trackSEOEvent('site_search', {
    search_term: query,
    search_results: results,
    search_category: category || 'all'
  });
};

// Function to track WhatsApp interactions
export const trackWhatsAppInteraction = (action: string, service?: string) => {
  trackSEOEvent('whatsapp_interaction', {
    interaction_type: action,
    service_name: service,
    contact_method: 'whatsapp'
  });
};

export default AdvancedAnalytics;