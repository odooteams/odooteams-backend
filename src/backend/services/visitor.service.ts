/**
 * Visitor Tracking Service
 * Handles website visitor tracking and analytics
 */

import { supabase } from '@/integrations/supabase/client';

interface VisitorData {
  ip_address?: string;
  browser_name?: string;
  browser_version?: string;
  os_name?: string;
  os_version?: string;
  device_type?: string;
  country?: string;
  city?: string;
  page_url: string;
  referrer_url?: string;
  session_id?: string;
  user_id?: string;
  is_new_visitor?: boolean;
}

interface BrowserInfo {
  name: string;
  version: string;
}

interface OSInfo {
  name: string;
  version: string;
}

export class VisitorService {
  /**
   * Track a website visitor
   */
  static async trackVisitor(pageUrl: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const browserInfo = this.getBrowserInfo();
    const osInfo = this.getOSInfo();
    const deviceType = this.getDeviceType();

    const visitorData: VisitorData = {
      page_url: pageUrl,
      browser_name: browserInfo.name,
      browser_version: browserInfo.version,
      os_name: osInfo.name,
      os_version: osInfo.version,
      device_type: deviceType,
      referrer_url: document.referrer || null,
      session_id: this.getSessionId(),
      user_id: user?.id || null,
      is_new_visitor: this.isNewVisitor(),
    };

    const { error } = await supabase
      .from('website_visitors')
      .insert(visitorData);

    return { error };
  }

  /**
   * Get visitor statistics (Admin only)
   */
  static async getVisitorStats(days: number = 30) {
    const currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - days);
    
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - days);

    // Current period data
    const { data: currentData, error: currentError } = await supabase
      .from('website_visitors')
      .select('*')
      .gte('created_at', currentStartDate.toISOString());

    if (currentError) return { stats: null, error: currentError };

    // Previous period data for comparison
    const { data: previousData, error: previousError } = await supabase
      .from('website_visitors')
      .select('*')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', previousEndDate.toISOString());

    if (previousError) return { stats: null, error: previousError };

    const stats = {
      totalVisitors: currentData.length,
      previousTotalVisitors: previousData.length,
      uniqueVisitors: new Set(currentData.map(v => v.session_id)).size,
      previousUniqueVisitors: new Set(previousData.map(v => v.session_id)).size,
      newVisitors: currentData.filter(v => v.is_new_visitor).length,
      previousNewVisitors: previousData.filter(v => v.is_new_visitor).length,
      browserStats: this.groupBy(currentData, 'browser_name'),
      osStats: this.groupBy(currentData, 'os_name'),
      deviceStats: this.groupBy(currentData, 'device_type'),
      countryStats: this.groupBy(currentData, 'country'),
      visitorsByDay: this.groupByDay(currentData),
      recentVisitors: currentData.slice(0, 50),
    };

    return { stats, error: null };
  }

  /**
   * Calculate percentage change between two values
   */
  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get browser information from user agent
   */
  private static getBrowserInfo(): BrowserInfo {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '';

    if (ua.includes('Firefox/')) {
      name = 'Firefox';
      version = ua.split('Firefox/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      name = 'Chrome';
      version = ua.split('Chrome/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      name = 'Safari';
      version = ua.split('Version/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Edg/')) {
      name = 'Edge';
      version = ua.split('Edg/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
      name = 'Opera';
      version = ua.split('OPR/')[1]?.split(' ')[0] || '';
    }

    return { name, version };
  }

  /**
   * Get OS information from user agent
   */
  private static getOSInfo(): OSInfo {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = '';

    if (ua.includes('Windows NT 10.0')) {
      name = 'Windows';
      version = '10/11';
    } else if (ua.includes('Windows NT 6.3')) {
      name = 'Windows';
      version = '8.1';
    } else if (ua.includes('Mac OS X')) {
      name = 'macOS';
      const match = ua.match(/Mac OS X (\d+[._]\d+)/);
      version = match ? match[1].replace('_', '.') : '';
    } else if (ua.includes('Linux')) {
      name = 'Linux';
    } else if (ua.includes('Android')) {
      name = 'Android';
      const match = ua.match(/Android (\d+\.?\d*)/);
      version = match ? match[1] : '';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      name = 'iOS';
      const match = ua.match(/OS (\d+_\d+)/);
      version = match ? match[1].replace('_', '.') : '';
    }

    return { name, version };
  }

  /**
   * Get device type
   */
  private static getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get or create session ID
   */
  private static getSessionId(): string {
    const key = 'visitor_session_id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Check if this is a new visitor
   */
  private static isNewVisitor(): boolean {
    const key = 'returning_visitor';
    const isReturning = localStorage.getItem(key);
    
    if (!isReturning) {
      localStorage.setItem(key, 'true');
      return true;
    }
    
    return false;
  }

  /**
   * Group data by a field
   */
  private static groupBy(data: any[], field: string) {
    const grouped = data.reduce((acc, item) => {
      const key = item[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([name, count]) => ({ name, count }));
  }

  /**
   * Group visitors by day
   */
  private static groupByDay(data: any[]) {
    const byDay = data.reduce((acc, item) => {
      const day = new Date(item.created_at).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }
}
