import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const page_path = `${location.pathname}${location.search}${location.hash}`;

    window.gtag('event', 'page_view', {
      page_path,
      page_title: document.title,
      page_location: window.location.href,
    });

    // Debug
    console.debug('[Analytics] page_view', { page_path });
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default PageViewTracker;
