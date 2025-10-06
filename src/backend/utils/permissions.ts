/**
 * Permission Utilities
 * Helper functions for checking user permissions
 */

import { AuthService } from '../services/auth.service';
import { AppRole } from '../types/database';

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await AuthService.getCurrentUser();
  return !!user;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  return AuthService.isAdmin();
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: AppRole): Promise<boolean> {
  const { user } = await AuthService.getCurrentUser();
  if (!user) return false;
  return AuthService.hasRole(user.id, role);
}

/**
 * Require authentication (throws error if not authenticated)
 */
export async function requireAuth(): Promise<string> {
  const { user } = await AuthService.getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user.id;
}

/**
 * Require admin role (throws error if not admin)
 */
export async function requireAdmin(): Promise<string> {
  const userId = await requireAuth();
  const admin = await AuthService.hasRole(userId, 'admin');
  
  if (!admin) {
    throw new Error('Admin access required');
  }
  
  return userId;
}

/**
 * Check if user can edit resource
 */
export async function canEdit(resourceCreatorId?: string | null): Promise<boolean> {
  const { user } = await AuthService.getCurrentUser();
  if (!user) return false;
  
  // Admin can edit anything
  const admin = await AuthService.isAdmin();
  if (admin) return true;
  
  // User can edit their own content
  return resourceCreatorId === user.id;
}

/**
 * Check if user can delete resource
 */
export async function canDelete(resourceCreatorId?: string | null): Promise<boolean> {
  // Only admins can delete for now
  return isAdmin();
}
