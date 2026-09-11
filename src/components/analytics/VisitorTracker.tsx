import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { VisitorService } from '@/backend/services/visitor.service';
import { AnalyticsService } from '@/backend/services/analytics.service';

const VisitorTracker = () => {
  const location = useLocation();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    const pageUrl = `${location.pathname}${location.search}`;

    // Avoid double-tracking the same page (e.g. React StrictMode double effects)
    if (lastTracked.current === pageUrl) return;
    lastTracked.current = pageUrl;

    const track = async () => {
      const [visitor, view] = await Promise.all([
        VisitorService.trackVisitor(pageUrl),
        AnalyticsService.trackPageView(location.pathname),
      ]);

      if (visitor?.error) console.error('[Tracking] visitor', visitor.error);
      if (view?.error) console.error('[Tracking] page view', view.error);
    };

    track();
  }, [location.pathname, location.search]);

  return null;
};

export default VisitorTracker;
