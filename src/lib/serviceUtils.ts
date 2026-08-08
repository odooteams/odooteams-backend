/**
 * Utility functions for service operations
 */

/**
 * Converts a service title to a URL-friendly slug
 */
export const createServiceSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Finds a service by its slug from the services array
 */
export const findServiceBySlug = (services: any[], slug: string) => {
  return services.find(service => 
    createServiceSlug(service.title) === slug
  );
};