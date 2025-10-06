/**
 * Validation Utilities
 * Common validation functions for backend operations
 */

import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email().max(255);

// Password validation (min 8 chars, at least one letter and one number)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Phone validation (international format)
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);

// URL validation
export const urlSchema = z.string().url();

// Contact form validation
export const contactFormSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().trim().max(100).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(1000),
});

// Service validation
export const serviceSchema = z.object({
  title_en: z.string().trim().min(3).max(200),
  title_ar: z.string().trim().min(3).max(200),
  category_en: z.string().trim().min(2).max(100),
  category_ar: z.string().trim().min(2).max(100),
  details_en: z.string().trim().min(10),
  details_ar: z.string().trim().min(10),
  image: urlSchema.optional(),
  price: z.number().positive().optional(),
  duration: z.string().max(50).optional(),
  keywords: z.array(z.string()).optional(),
});

// Project validation
export const projectSchema = z.object({
  title_en: z.string().trim().min(3).max(200),
  title_ar: z.string().trim().min(3).max(200),
  category_en: z.string().trim().min(2).max(100),
  category_ar: z.string().trim().min(2).max(100),
  client_name: z.string().trim().max(100).optional(),
  description_en: z.string().trim().min(10),
  description_ar: z.string().trim().min(10),
  technologies: z.array(z.string()).optional(),
  images: z.array(urlSchema).optional(),
  cost: z.string().max(50).optional(),
  project_url: urlSchema.optional(),
});

// Validate data with schema
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
  };
}
