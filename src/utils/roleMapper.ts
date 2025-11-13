/**
 * Role mapping utilities
 * Normalizes backend roles to frontend dashboard routes
 */

import type { BackendRole } from '../types/api';

export type DashboardRoute = 
  | 'superadmin' 
  | 'admin' 
  | 'delivery' 
  | 'caterer' 
  | 'customer';

/**
 * Normalize a role string to canonical BackendRole
 */
export const normalizeRole = (r?: string | null): BackendRole => {
  if (!r) return 'USER';
  
  const x = String(r).toUpperCase().trim();
  
  // Handle synonyms
  if (x === 'DELIVERY' || x === 'DELIVERY GUY' || x === 'DELIVERYGUY') {
    return 'DELIVERY_GUY';
  }
  if (x === 'SUPER ADMIN' || x === 'SUPERADMIN') {
    return 'SUPER_ADMIN';
  }
  if (x === 'SUB ADMIN' || x === 'SUBADMIN') {
    return 'SUB_ADMIN';
  }
  if (x === 'MANAGER' || x === 'CHEF') {
    return 'ADMIN'; // Manager/Chef maps to ADMIN
  }
  
  // Validate against canonical roles
  const validRoles: BackendRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'SUB_ADMIN',
    'USER',
    'DELIVERY_GUY',
    'CATERER'
  ];
  
  return validRoles.includes(x as BackendRole) ? (x as BackendRole) : 'USER';
};

/**
 * Map a single backend role to a dashboard route
 */
export const mapRoleToDashboard = (role: string): DashboardRoute => {
  const normalized = normalizeRole(role);
  
  switch (normalized) {
    case 'SUPER_ADMIN':
      return 'superadmin';
    case 'ADMIN':
    case 'SUB_ADMIN':
      return 'admin';
    case 'DELIVERY_GUY':
      return 'delivery';
    case 'CATERER':
      return 'caterer';
    case 'USER':
    default:
      return 'customer';
  }
};

/**
 * Get the highest priority dashboard route from an array of roles
 * Priority: SUPER_ADMIN > ADMIN > DELIVERY_GUY > CATERER > USER
 */
export const getDashboardRouteFromRoles = (
  roles: string[] | undefined | null
): DashboardRoute => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return 'customer';
  }
  
  // Normalize all roles
  const normalizedRoles = roles.map(normalizeRole);
  
  // Priority order
  if (normalizedRoles.includes('SUPER_ADMIN')) {
    return 'superadmin';
  }
  if (normalizedRoles.includes('ADMIN') || normalizedRoles.includes('SUB_ADMIN')) {
    return 'admin';
  }
  if (normalizedRoles.includes('DELIVERY_GUY')) {
    return 'delivery';
  }
  if (normalizedRoles.includes('CATERER')) {
    return 'caterer';
  }
  
  return 'customer';
};

/**
 * Check if user has any dashboard role (not just USER)
 */
export const hasDashboardRole = (
  roles: string[] | undefined | null
): boolean => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  
  const normalizedRoles = roles.map(normalizeRole);
  const dashboardRoles: BackendRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'SUB_ADMIN',
    'DELIVERY_GUY',
    'CATERER'
  ];
  
  return normalizedRoles.some(r => dashboardRoles.includes(r));
};
