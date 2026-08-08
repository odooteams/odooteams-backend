/**
 * Utility functions for handling canonical URLs and preventing duplicate content
 */

/**
 * Normalize URL by removing query parameters and trailing slashes
 * @param url - The URL to normalize
 * @returns Normalized canonical URL
 */
export const normalizeCanonicalUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove query parameters except for important ones like language
    const allowedParams = ['lang'];
    const newSearchParams = new URLSearchParams();
    
    allowedParams.forEach(param => {
      const value = urlObj.searchParams.get(param);
      if (value) {
        newSearchParams.set(param, value);
      }
    });
    
    // Build clean URL
    let cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    
    // Remove trailing slash except for root
    if (cleanUrl.endsWith('/') && cleanUrl !== 'https://odooteams.com/') {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    // Add back allowed parameters if any
    const searchString = newSearchParams.toString();
    if (searchString) {
      cleanUrl += `?${searchString}`;
    }
    
    return cleanUrl;
  } catch (error) {
    console.error('Error normalizing URL:', error);
    return url;
  }
};

/**
 * Generate canonical URL for a given path
 * @param path - The path (e.g., '/services/odoo-implementation')
 * @param includeLanguage - Whether to include language parameter
 * @param language - The language code
 * @returns Canonical URL
 */
export const generateCanonicalUrl = (
  path: string, 
  includeLanguage: boolean = false, 
  language?: string
): string => {
  const baseUrl = 'https://odooteams.com';
  let canonicalUrl = `${baseUrl}${path}`;
  
  // Ensure no trailing slash except for root
  if (canonicalUrl.endsWith('/') && canonicalUrl !== `${baseUrl}/`) {
    canonicalUrl = canonicalUrl.slice(0, -1);
  }
  
  // Add language parameter if needed
  if (includeLanguage && language) {
    canonicalUrl += `?lang=${language}`;
  }
  
  return canonicalUrl;
};

/**
 * Generate alternate URLs for internationalization
 * @param path - The path
 * @returns Array of alternate URLs
 */
export const generateAlternateUrls = (path: string) => {
  const baseUrl = 'https://odooteams.com';
  let cleanPath = path;
  
  // Ensure no trailing slash except for root
  if (cleanPath.endsWith('/') && cleanPath !== '/') {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  return [
    { hreflang: 'en', href: `${baseUrl}${cleanPath}?lang=en` },
    { hreflang: 'ar', href: `${baseUrl}${cleanPath}?lang=ar` },
    { hreflang: 'x-default', href: `${baseUrl}${cleanPath}` }
  ];
};

/**
 * Check if current URL needs canonical redirect
 * @param currentUrl - Current page URL
 * @returns Object with redirect info
 */
export const checkCanonicalRedirect = (currentUrl: string) => {
  const normalizedUrl = normalizeCanonicalUrl(currentUrl);
  const needsRedirect = currentUrl !== normalizedUrl;
  
  return {
    needsRedirect,
    canonicalUrl: normalizedUrl,
    currentUrl
  };
};