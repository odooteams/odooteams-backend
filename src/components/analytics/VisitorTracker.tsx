import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { VisitorService } from '@/backend/services/visitor.service';

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      const pageUrl = `${location.pathname}${location.search}${location.hash}`;
      await VisitorService.trackVisitor(pageUrl);
    };

    trackVisit();
  }, [location.pathname]);

  return null;
};

export default VisitorTracker;
