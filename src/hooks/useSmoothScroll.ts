import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useSmoothScroll() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if it's a hash link for the current page
    if (href.startsWith('#')) {
      e.preventDefault();
      const sectionId = href.substring(1);
      scrollToSection(sectionId);
      return;
    }

    // Check if it's a link to homepage with a hash
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.substring(2);
      
      if (location.pathname === '/') {
        // Already on homepage, just scroll
        scrollToSection(sectionId);
      } else {
        // Navigate to homepage first, then scroll
        navigate('/');
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
      return;
    }
  }, [location.pathname, navigate, scrollToSection]);

  return { scrollToSection, handleNavClick };
}