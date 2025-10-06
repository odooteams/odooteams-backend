/**
 * Content Management Service
 * Handles CRUD operations for all content types (services, projects, etc.)
 */

import { supabase } from '@/integrations/supabase/client';
import {
  Service,
  ServiceInsert,
  ServiceUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  LearnResource,
  LearnResourceInsert,
  LearnResourceUpdate,
  FAQ,
  FAQInsert,
  FAQUpdate,
  ChatbotResponse,
  ChatbotResponseInsert,
  ChatbotResponseUpdate,
  TeamMember,
  TeamMemberInsert,
  TeamMemberUpdate,
  Testimonial,
  TestimonialInsert,
  TestimonialUpdate,
  TimelineEvent,
  TimelineEventInsert,
  TimelineEventUpdate,
} from '../types/database';

export class ContentService {
  // ============================================
  // SERVICES
  // ============================================

  static async getServices(activeOnly: boolean = true) {
    let query = supabase.from('services').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  static async getServiceById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  static async createService(service: ServiceInsert) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateService(id: string, updates: ServiceUpdate) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // ============================================
  // PROJECTS
  // ============================================

  static async getProjects(activeOnly: boolean = true) {
    let query = supabase.from('projects').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  static async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  static async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // ============================================
  // LEARN RESOURCES
  // ============================================

  static async getLearnResources(activeOnly: boolean = true) {
    let query = supabase.from('learn_resources').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('published_date', { ascending: false });
    return { data, error };
  }

  static async getLearnResourceById(id: string) {
    const { data, error } = await supabase
      .from('learn_resources')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  }

  static async createLearnResource(resource: LearnResourceInsert) {
    const { data, error } = await supabase
      .from('learn_resources')
      .insert(resource)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateLearnResource(id: string, updates: LearnResourceUpdate) {
    const { data, error } = await supabase
      .from('learn_resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async incrementResourceViews(id: string) {
    // Increment view count for a learn resource
    const { data: resource, error: fetchError } = await supabase
      .from('learn_resources')
      .select('views_count')
      .eq('id', id)
      .single();

    if (fetchError || !resource) return { error: fetchError };

    const { error } = await supabase
      .from('learn_resources')
      .update({ views_count: (resource.views_count || 0) + 1 })
      .eq('id', id);

    return { error };
  }

  // ============================================
  // FAQs
  // ============================================

  static async getFAQs(category?: string, activeOnly: boolean = true) {
    let query = supabase.from('faqs').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    if (category) {
      query = query.or(`category_en.eq.${category},category_ar.eq.${category}`);
    }
    
    const { data, error } = await query.order('sort_order', { ascending: true });
    return { data, error };
  }

  static async createFAQ(faq: FAQInsert) {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faq)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateFAQ(id: string, updates: FAQUpdate) {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  static async deleteFAQ(id: string) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // ============================================
  // CHATBOT RESPONSES
  // ============================================

  static async getChatbotResponses(activeOnly: boolean = true) {
    let query = supabase.from('chatbot_responses').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  static async createChatbotResponse(response: ChatbotResponseInsert) {
    const { data, error } = await supabase
      .from('chatbot_responses')
      .insert(response)
      .select()
      .single();
    
    return { data, error };
  }

  static async incrementChatbotUsage(id: string) {
    // Increment usage count for a chatbot response
    const { data: response, error: fetchError } = await supabase
      .from('chatbot_responses')
      .select('usage_count')
      .eq('id', id)
      .single();

    if (fetchError || !response) return { error: fetchError };

    const { error } = await supabase
      .from('chatbot_responses')
      .update({ usage_count: (response.usage_count || 0) + 1 })
      .eq('id', id);

    return { error };
  }

  // ============================================
  // TEAM MEMBERS
  // ============================================

  static async getTeamMembers(activeOnly: boolean = true) {
    let query = supabase.from('team_members').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('sort_order', { ascending: true });
    return { data, error };
  }

  static async createTeamMember(member: TeamMemberInsert) {
    const { data, error } = await supabase
      .from('team_members')
      .insert(member)
      .select()
      .single();
    
    return { data, error };
  }

  static async updateTeamMember(id: string, updates: TeamMemberUpdate) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  // ============================================
  // TESTIMONIALS
  // ============================================

  static async getTestimonials(activeOnly: boolean = true, featuredOnly: boolean = false) {
    let query = supabase.from('testimonials').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  static async createTestimonial(testimonial: TestimonialInsert) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();
    
    return { data, error };
  }

  // ============================================
  // TIMELINE EVENTS
  // ============================================

  static async getTimelineEvents(activeOnly: boolean = true) {
    let query = supabase.from('timeline_events').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('year', { ascending: false });
    return { data, error };
  }

  static async createTimelineEvent(event: TimelineEventInsert) {
    const { data, error } = await supabase
      .from('timeline_events')
      .insert(event)
      .select()
      .single();
    
    return { data, error };
  }
}
