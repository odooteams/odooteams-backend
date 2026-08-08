/**
 * Backend Helper Utilities
 * Common utility functions for backend operations
 */

/**
 * Format error message for user display
 */
export function formatError(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.message) return error.message;
  
  return 'An unexpected error occurred';
}

/**
 * Generate slug from text (for URLs)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse array from comma-separated string
 */
export function parseArrayFromString(str: string | null | undefined): string[] {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Convert array to comma-separated string
 */
export function arrayToString(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return '';
  return arr.join(', ');
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop();
  const name = filename.replace(`.${ext}`, '');
  const sanitized = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${sanitized}.${ext}`;
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(filename: string): string {
  const ext = filename.split('.').pop();
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename.replace(`.${ext}`, ''));
  
  return `${sanitized}-${timestamp}.${ext}`;
}

/**
 * Calculate pagination offset
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Delay execution (useful for rate limiting)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delayMs = initialDelay * Math.pow(2, i);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
