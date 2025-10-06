// Backend Database Types for OdooTeams

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Service {
  id: string;
  title_en: string;
  title_ar: string;
  category_en: string;
  category_ar: string;
  details_en: string;
  details_ar: string;
  image: string | null;
  price: number | null;
  duration: string | null;
  keywords: string[] | null;
  processing_steps_en: string | null;
  processing_steps_ar: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Project {
  id: string;
  title_en: string;
  title_ar: string;
  category_en: string;
  category_ar: string;
  client_name: string | null;
  description_en: string;
  description_ar: string;
  processing_steps_en: string | null;
  processing_steps_ar: string | null;
  technologies: string[] | null;
  images: string[] | null;
  completion_date: string | null;
  cost: string | null;
  project_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface LearnResource {
  id: string;
  category_en: string;
  category_ar: string;
  main_header_en: string;
  main_header_ar: string;
  title_en: string;
  title_ar: string;
  contents_en: string;
  contents_ar: string;
  image: string | null;
  author_en: string | null;
  author_ar: string | null;
  published_date: string | null;
  download_url: string | null;
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface FAQ {
  id: string;
  category_en: string;
  category_ar: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ChatbotResponse {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  keywords: string[] | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TeamMember {
  id: string;
  name_en: string;
  name_ar: string;
  position_en: string;
  position_ar: string;
  bio_en: string | null;
  bio_ar: string | null;
  image: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name_en: string;
  client_name_ar: string;
  company_en: string | null;
  company_ar: string | null;
  position_en: string | null;
  position_ar: string | null;
  testimonial_en: string;
  testimonial_ar: string;
  rating: number | null;
  image: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PageView {
  id: string;
  page_path: string;
  user_id: string | null;
  session_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}
