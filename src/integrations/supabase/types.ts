export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          severity?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backups: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          error_message: string | null
          file_size: number | null
          file_url: string | null
          id: string
          name: string
          records_count: Json | null
          started_at: string | null
          status: string
          tables_included: string[] | null
          updated_at: string
        }
        Insert: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          name: string
          records_count?: Json | null
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
          updated_at?: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          name?: string
          records_count?: Json | null
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_ar: string | null
          category_en: string | null
          content_ar: string
          content_en: string
          created_at: string
          created_by: string | null
          excerpt_ar: string | null
          excerpt_en: string | null
          focus_keyword_ar: string | null
          focus_keyword_en: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          is_published: boolean | null
          keywords_ar: string[] | null
          keywords_en: string[] | null
          og_image: string | null
          published_at: string | null
          robots: string | null
          schema_type: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords_ar: string | null
          seo_keywords_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          structured_data: Json | null
          tags: string[] | null
          tags_ar: string[] | null
          title_ar: string
          title_en: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_ar?: string | null
          category_en?: string | null
          content_ar: string
          content_en: string
          created_at?: string
          created_by?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords_ar?: string[] | null
          keywords_en?: string[] | null
          og_image?: string | null
          published_at?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          structured_data?: Json | null
          tags?: string[] | null
          tags_ar?: string[] | null
          title_ar: string
          title_en: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_ar?: string | null
          category_en?: string | null
          content_ar?: string
          content_en?: string
          created_at?: string
          created_by?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords_ar?: string[] | null
          keywords_en?: string[] | null
          og_image?: string | null
          published_at?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          structured_data?: Json | null
          tags?: string[] | null
          tags_ar?: string[] | null
          title_ar?: string
          title_en?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      chatbot_responses: {
        Row: {
          answer_ar: string
          answer_en: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          question_ar: string
          question_en: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          answer_ar: string
          answer_en: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question_ar: string
          question_en: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          answer_ar?: string
          answer_en?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          question_ar?: string
          question_en?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          dedupe_hash: string | null
          email: string
          full_name: string
          id: string
          message: string
          notes: string | null
          phone: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          dedupe_hash?: string | null
          email: string
          full_name: string
          id?: string
          message: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          dedupe_hash?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer_ar: string
          answer_en: string
          category_ar: string
          category_en: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          question_ar: string
          question_en: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer_ar: string
          answer_en: string
          category_ar: string
          category_en: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          question_ar: string
          question_en: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer_ar?: string
          answer_en?: string
          category_ar?: string
          category_en?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          question_ar?: string
          question_en?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ip_blacklist: {
        Row: {
          attempts: number
          auto: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          ip: string
          last_route: string | null
          notes: string | null
          reason: string
          severity: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          auto?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip: string
          last_route?: string | null
          notes?: string | null
          reason?: string
          severity?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          auto?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          ip?: string
          last_route?: string | null
          notes?: string | null
          reason?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      ip_whitelist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          ip: string
          note: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learn_resources: {
        Row: {
          author_ar: string | null
          author_en: string | null
          canonical_url: string | null
          category_ar: string
          category_en: string
          contents_ar: string
          contents_en: string
          created_at: string
          created_by: string | null
          download_url: string | null
          focus_keyword_ar: string | null
          focus_keyword_en: string | null
          id: string
          image: string | null
          is_active: boolean | null
          main_header_ar: string
          main_header_en: string
          og_image: string | null
          published_date: string | null
          robots: string | null
          schema_type: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords_ar: string | null
          seo_keywords_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          structured_data: Json | null
          title_ar: string
          title_en: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_ar?: string | null
          author_en?: string | null
          canonical_url?: string | null
          category_ar: string
          category_en: string
          contents_ar: string
          contents_en: string
          created_at?: string
          created_by?: string | null
          download_url?: string | null
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          main_header_ar: string
          main_header_en: string
          og_image?: string | null
          published_date?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          structured_data?: Json | null
          title_ar: string
          title_en: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_ar?: string | null
          author_en?: string | null
          canonical_url?: string | null
          category_ar?: string
          category_en?: string
          contents_ar?: string
          contents_en?: string
          created_at?: string
          created_by?: string | null
          download_url?: string | null
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          main_header_ar?: string
          main_header_en?: string
          og_image?: string | null
          published_date?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          structured_data?: Json | null
          title_ar?: string
          title_en?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          keywords_ar: string | null
          keywords_en: string | null
          og_image: string | null
          page_key: string
          page_path: string
          robots: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          keywords_ar?: string | null
          keywords_en?: string | null
          og_image?: string | null
          page_key: string
          page_path: string
          robots?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          keywords_ar?: string | null
          keywords_en?: string | null
          og_image?: string | null
          page_key?: string
          page_path?: string
          robots?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name_ar: string
          name_en: string
          sort_order: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_ar: string
          name_en: string
          sort_order?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_ar?: string
          name_en?: string
          sort_order?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          content_ar: string
          content_en: string
          created_at: string
          created_by: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          policy_type: string
          slug: string
          title_ar: string
          title_en: string
          updated_at: string
          version: string | null
        }
        Insert: {
          content_ar: string
          content_en: string
          created_at?: string
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          policy_type: string
          slug: string
          title_ar: string
          title_en: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          content_ar?: string
          content_en?: string
          created_at?: string
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          policy_type?: string
          slug?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          canonical_url: string | null
          category_ar: string
          category_en: string
          client_name: string | null
          completion_date: string | null
          cost: string | null
          created_at: string
          created_by: string | null
          description_ar: string
          description_en: string
          focus_keyword_ar: string | null
          focus_keyword_en: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          og_image: string | null
          processing_steps_ar: string | null
          processing_steps_en: string | null
          project_url: string | null
          robots: string | null
          schema_type: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords_ar: string | null
          seo_keywords_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          structured_data: Json | null
          technologies: string[] | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          category_ar: string
          category_en: string
          client_name?: string | null
          completion_date?: string | null
          cost?: string | null
          created_at?: string
          created_by?: string | null
          description_ar: string
          description_en: string
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          og_image?: string | null
          processing_steps_ar?: string | null
          processing_steps_en?: string | null
          project_url?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          structured_data?: Json | null
          technologies?: string[] | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          category_ar?: string
          category_en?: string
          client_name?: string | null
          completion_date?: string | null
          cost?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string
          description_en?: string
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          og_image?: string | null
          processing_steps_ar?: string | null
          processing_steps_en?: string | null
          project_url?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          structured_data?: Json | null
          technologies?: string[] | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip: string | null
          route: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip?: string | null
          route?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip?: string | null
          route?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_scans: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          label: string
          report: Json
          started_at: string | null
          summary: Json
          target_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          label: string
          report: Json
          started_at?: string | null
          summary?: Json
          target_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          label?: string
          report?: Json
          started_at?: string | null
          summary?: Json
          target_url?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          canonical_url: string | null
          category_ar: string
          category_en: string
          created_at: string
          created_by: string | null
          details_ar: string
          details_en: string
          duration: string | null
          focus_keyword_ar: string | null
          focus_keyword_en: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          og_image: string | null
          price: number | null
          processing_steps_ar: string | null
          processing_steps_en: string | null
          robots: string | null
          schema_type: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_keywords_ar: string | null
          seo_keywords_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          structured_data: Json | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          category_ar: string
          category_en: string
          created_at?: string
          created_by?: string | null
          details_ar: string
          details_en: string
          duration?: string | null
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          og_image?: string | null
          price?: number | null
          processing_steps_ar?: string | null
          processing_steps_en?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          structured_data?: Json | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          category_ar?: string
          category_en?: string
          created_at?: string
          created_by?: string | null
          details_ar?: string
          details_en?: string
          duration?: string | null
          focus_keyword_ar?: string | null
          focus_keyword_en?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          og_image?: string | null
          price?: number | null
          processing_steps_ar?: string | null
          processing_steps_en?: string | null
          robots?: string | null
          schema_type?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_keywords_ar?: string | null
          seo_keywords_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          structured_data?: Json | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      submission_rate_limits: {
        Row: {
          created_at: string
          dedupe_hash: string
          id: string
          ip_address: string
          submission_type: string
        }
        Insert: {
          created_at?: string
          dedupe_hash: string
          id?: string
          ip_address: string
          submission_type: string
        }
        Update: {
          created_at?: string
          dedupe_hash?: string
          id?: string
          ip_address?: string
          submission_type?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          image: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name_ar: string
          name_en: string
          position_ar: string
          position_en: string
          sort_order: number | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name_ar: string
          name_en: string
          position_ar: string
          position_en: string
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name_ar?: string
          name_en?: string
          position_ar?: string
          position_en?: string
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name_ar: string
          client_name_en: string
          company_ar: string | null
          company_en: string | null
          created_at: string
          created_by: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          position_ar: string | null
          position_en: string | null
          rating: number | null
          testimonial_ar: string
          testimonial_en: string
          updated_at: string
        }
        Insert: {
          client_name_ar: string
          client_name_en: string
          company_ar?: string | null
          company_en?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          position_ar?: string | null
          position_en?: string | null
          rating?: number | null
          testimonial_ar: string
          testimonial_en: string
          updated_at?: string
        }
        Update: {
          client_name_ar?: string
          client_name_en?: string
          company_ar?: string | null
          company_en?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          position_ar?: string | null
          position_en?: string | null
          rating?: number | null
          testimonial_ar?: string
          testimonial_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          created_by: string | null
          description_ar: string
          description_en: string
          id: string
          image: string | null
          is_active: boolean | null
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description_ar: string
          description_en: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description_ar?: string
          description_en?: string
          id?: string
          image?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_add: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          page_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_add?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          page_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_add?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          page_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_visitors: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          is_new_visitor: boolean | null
          os_name: string | null
          os_version: string | null
          page_url: string
          referrer_url: string | null
          session_id: string | null
          user_id: string | null
          visit_duration: number | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_new_visitor?: boolean | null
          os_name?: string | null
          os_version?: string | null
          page_url: string
          referrer_url?: string | null
          session_id?: string | null
          user_id?: string | null
          visit_duration?: number | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_new_visitor?: boolean | null
          os_name?: string | null
          os_version?: string | null
          page_url?: string
          referrer_url?: string | null
          session_id?: string | null
          user_id?: string | null
          visit_duration?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _action: string; _page_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
