
import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/lib/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const [isRefresh, setIsRefresh] = useState(false);
  const [checkingRefresh, setCheckingRefresh] = useState(true);
  const { t, dir } = useLanguage();
  
  // List of valid routes and patterns
  const validRoutes = [
    "/",
    "/services",
    "/projects",
    "/learn-odoo",
    "/about",
    "/contact",
    "/faqs"
  ];
  
  // Valid patterns for dynamic routes
  const validPatterns = [
    { pattern: /^\/services\/\d+$/, baseRoute: "/services" },
    { pattern: /^\/projects\/\d+$/, baseRoute: "/projects" },
    { pattern: /^\/learn-odoo\/[\w-]+$/, baseRoute: "/learn-odoo" }
  ];
  
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check if this is a direct page load or refresh
    const isDirectAccessOrRefresh = !document.referrer || 
      !document.referrer.includes(window.location.host) ||
      (window.performance && 
       performance.getEntriesByType('navigation')[0] && 
       (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type === 'reload');
    
    // Check if current path matches any of our dynamic route patterns
    const matchedPattern = validPatterns.find(
      ({ pattern }) => pattern.test(location.pathname)
    );
    
    if (matchedPattern && isDirectAccessOrRefresh) {
      // If it's a refresh on a valid dynamic route pattern, redirect to base route
      setIsRefresh(true);
    } else {
      // Check base route for non-dynamic routes
      const baseRoute = '/' + location.pathname.split('/')[1];
      const isValidBaseRoute = validRoutes.includes(baseRoute);
      
      if (isValidBaseRoute && isDirectAccessOrRefresh) {
        setIsRefresh(true);
      }
    }
    
    setCheckingRefresh(false);
  }, [location.pathname]);

  if (checkingRefresh) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (isRefresh) {
    // On refresh, first check if it matches a dynamic route pattern
    const matchedPattern = validPatterns.find(
      ({ pattern }) => pattern.test(location.pathname)
    );
    
    if (matchedPattern) {
      // For known dynamic routes, redirect to the base route
      return <Navigate to={matchedPattern.baseRoute} replace />;
    }
    
    // For other routes, try to redirect to the base route
    const baseRoute = '/' + location.pathname.split('/')[1];
    if (validRoutes.includes(baseRoute)) {
      return <Navigate to={baseRoute} replace />;
    }
    
    // If we can't determine a valid route, go to home
    return <Navigate to="/" replace />;
  }

  return (
    <div className={dir === 'rtl' ? 'rtl min-h-screen flex flex-col' : 'ltr min-h-screen flex flex-col'}>
      <Navbar />
      <div className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center p-5">
          <h1 className="text-6xl font-bold mb-4 text-odoo-purple">404</h1>
          <p className="text-xl text-gray-600 mb-6">
            {t("Oops! Page not found", "عفواً! الصفحة غير موجودة")}
          </p>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {t(
              "The page you are looking for might have been removed or temporarily unavailable.",
              "الصفحة التي تبحث عنها قد تكون غير موجودة أو غير متاحة مؤقتًا."
            )}
          </p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-odoo-gold text-odoo-purple rounded-md hover:bg-yellow-500 transition-colors font-medium"
          >
            {t("Return to Home", "العودة للرئيسية")}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
