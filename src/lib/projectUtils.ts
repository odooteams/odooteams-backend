/**
 * Utility functions for project operations
 */

/**
 * Converts a project title to a URL-friendly slug
 */
export const createProjectSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep Unicode letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Finds a project by its slug from the projects array
 */
export const findProjectBySlug = (projects: any[], slug: string) => {
  return projects.find(project => 
    createProjectSlug(project.title) === slug
  );
};