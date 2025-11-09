// Backend Database Query Helpers
import { supabase } from "@/integrations/supabase/client";
import type { 
  Service, 
  Project, 
  LearnResource, 
  FAQ, 
  ChatbotResponse, 
  TeamMember, 
  ContactSubmission,
  Testimonial,
  TimelineEvent,
  Policy
} from "./types";

// ============================================
// SERVICES
// ============================================

export const servicesQueries = {
  getAll: async (language: 'en' | 'ar' = 'en') => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Service[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Service;
  },

  getFeatured: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (error) throw error;
    return data as Service[];
  },

  getByCategory: async (category: string, language: 'en' | 'ar' = 'en') => {
    const categoryField = language === 'ar' ? 'category_ar' : 'category_en';
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq(categoryField, category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Service[];
  }
};

// ============================================
// PROJECTS
// ============================================

export const projectsQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Project[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Project;
  },

  getFeatured: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (error) throw error;
    return data as Project[];
  }
};

// ============================================
// LEARN RESOURCES
// ============================================

export const learnResourcesQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('learn_resources')
      .select('*')
      .eq('is_active', true)
      .order('published_date', { ascending: false });
    
    if (error) throw error;
    return data as LearnResource[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('learn_resources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Increment view count (fire and forget)
    if (data) {
      supabase
        .from('learn_resources')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id)
        .then(() => {});
    }
    
    return data as LearnResource;
  },

  getByCategory: async (category: string, language: 'en' | 'ar' = 'en') => {
    const categoryField = language === 'ar' ? 'category_ar' : 'category_en';
    const { data, error } = await supabase
      .from('learn_resources')
      .select('*')
      .eq('is_active', true)
      .eq(categoryField, category)
      .order('published_date', { ascending: false });
    
    if (error) throw error;
    return data as LearnResource[];
  }
};

// ============================================
// FAQs
// ============================================

export const faqsQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as FAQ[];
  },

  getByCategory: async (category: string, language: 'en' | 'ar' = 'en') => {
    const categoryField = language === 'ar' ? 'category_ar' : 'category_en';
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .eq(categoryField, category)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as FAQ[];
  }
};

// ============================================
// CHATBOT RESPONSES
// ============================================

export const chatbotQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('chatbot_responses')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data as ChatbotResponse[];
  },

  search: async (query: string, language: 'en' | 'ar' = 'en') => {
    const questionField = language === 'ar' ? 'question_ar' : 'question_en';
    const { data, error } = await supabase
      .from('chatbot_responses')
      .select('*')
      .eq('is_active', true)
      .ilike(questionField, `%${query}%`);
    
    if (error) throw error;
    return data as ChatbotResponse[];
  },

  incrementUsage: async (id: string) => {
    // Get current count first
    const { data: current } = await supabase
      .from('chatbot_responses')
      .select('usage_count')
      .eq('id', id)
      .single();
    
    if (current) {
      const { error } = await supabase
        .from('chatbot_responses')
        .update({ usage_count: (current.usage_count || 0) + 1 })
        .eq('id', id);
      
      if (error) throw error;
    }
  }
};

// ============================================
// TEAM MEMBERS
// ============================================

export const teamQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as TeamMember[];
  }
};

// ============================================
// CONTACT SUBMISSIONS
// ============================================

export const contactQueries = {
  create: async (submission: Omit<ContactSubmission, 'id' | 'status' | 'assigned_to' | 'notes' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert(submission)
      .select()
      .single();
    
    if (error) throw error;
    return data as ContactSubmission;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ContactSubmission[];
  },

  updateStatus: async (id: string, status: ContactSubmission['status'], notes?: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status, notes })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// TESTIMONIALS
// ============================================

export const testimonialsQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Testimonial[];
  },

  getFeatured: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as Testimonial[];
  }
};

// ============================================
// TIMELINE EVENTS
// ============================================

export const timelineQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false })
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as TimelineEvent[];
  }
};

// ============================================
// PAGE ANALYTICS
// ============================================

export const analyticsQueries = {
  trackPageView: async (pagePath: string) => {
    const { error } = await supabase
      .from('page_views')
      .insert({
        page_path: pagePath,
        session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
        referrer: document.referrer,
        user_agent: navigator.userAgent
      });
    
    if (error) console.error('Analytics tracking error:', error);
  }
};

// ============================================
// POLICIES
// ============================================

export const policiesQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Policy[];
  },

  getBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data as Policy;
  },

  getByType: async (policyType: string) => {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('policy_type', policyType)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as Policy;
  }
};
