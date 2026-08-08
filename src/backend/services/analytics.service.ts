/**
 * Analytics Service
 * Handles page view tracking and analytics
 */

import { supabase } from '@/integrations/supabase/client';
import { PageViewInsert } from '../types/database';

export class AnalyticsService {
  /**
   * Track a page view
   */
  static async trackPageView(pagePath: string, sessionId?: string) {
    const { data: { user } } = await supabase.auth.getUser();

    const pageView: PageViewInsert = {
      page_path: pagePath,
      user_id: user?.id || null,
      session_id: sessionId || this.getSessionId(),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      ip_address: null, // Will be captured server-side if needed
    };

    const { error } = await supabase
      .from('page_views')
      .insert(pageView);

    return { error };
  }

  /**
   * Get analytics data (Admin only)
   */
  static async getPageViews(startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('page_views')
      .select('*');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get page view statistics (Admin only)
   */
  static async getStatistics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('page_views')
      .select('page_path, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) return { stats: null, error };

    // Calculate statistics
    const stats = {
      totalViews: data.length,
      uniquePages: new Set(data.map(v => v.page_path)).size,
      topPages: this.getTopPages(data),
      viewsByDay: this.groupByDay(data),
    };

    return { stats, error: null };
  }

  /**
   * Get or create session ID
   */
  private static getSessionId(): string {
    const key = 'analytics_session_id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Get top pages by view count
   */
  private static getTopPages(views: any[], limit: number = 10) {
    const pageCounts = views.reduce((acc, view) => {
      acc[view.page_path] = (acc[view.page_path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pageCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([page, count]) => ({ page, count }));
  }

  /**
   * Group views by day
   */
  private static groupByDay(views: any[]) {
    const byDay = views.reduce((acc, view) => {
      const day = new Date(view.created_at).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }
}
