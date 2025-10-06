/**
 * Backend Database Types
 * Comprehensive type definitions for all database tables
 */

import { Database } from '@/integrations/supabase/types';

// Re-export Supabase generated types
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// User Management Types
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type UserRole = Tables['user_roles']['Row'];
export type AppRole = 'admin' | 'user';

// Content Types
export type Service = Tables['services']['Row'];
export type ServiceInsert = Tables['services']['Insert'];
export type ServiceUpdate = Tables['services']['Update'];

export type Project = Tables['projects']['Row'];
export type ProjectInsert = Tables['projects']['Insert'];
export type ProjectUpdate = Tables['projects']['Update'];

export type LearnResource = Tables['learn_resources']['Row'];
export type LearnResourceInsert = Tables['learn_resources']['Insert'];
export type LearnResourceUpdate = Tables['learn_resources']['Update'];

export type FAQ = Tables['faqs']['Row'];
export type FAQInsert = Tables['faqs']['Insert'];
export type FAQUpdate = Tables['faqs']['Update'];

export type ChatbotResponse = Tables['chatbot_responses']['Row'];
export type ChatbotResponseInsert = Tables['chatbot_responses']['Insert'];
export type ChatbotResponseUpdate = Tables['chatbot_responses']['Update'];

export type TeamMember = Tables['team_members']['Row'];
export type TeamMemberInsert = Tables['team_members']['Insert'];
export type TeamMemberUpdate = Tables['team_members']['Update'];

export type ContactSubmission = Tables['contact_submissions']['Row'];
export type ContactSubmissionInsert = Tables['contact_submissions']['Insert'];
export type ContactSubmissionUpdate = Tables['contact_submissions']['Update'];

export type Testimonial = Tables['testimonials']['Row'];
export type TestimonialInsert = Tables['testimonials']['Insert'];
export type TestimonialUpdate = Tables['testimonials']['Update'];

export type TimelineEvent = Tables['timeline_events']['Row'];
export type TimelineEventInsert = Tables['timeline_events']['Insert'];
export type TimelineEventUpdate = Tables['timeline_events']['Update'];

export type PageView = Tables['page_views']['Row'];
export type PageViewInsert = Tables['page_views']['Insert'];

// Helper Types
export interface LanguageFields {
  en: string;
  ar: string;
}

export interface BilingualContent {
  title: LanguageFields;
  category?: LanguageFields;
  description?: LanguageFields;
  content?: LanguageFields;
}

export type ContentStatus = 'active' | 'inactive' | 'draft';
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high';
