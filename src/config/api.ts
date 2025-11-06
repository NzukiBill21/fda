// API Configuration - Environment-based URLs
const getApiUrl = (): string => {
  // Check for production API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Production fallback (if no env var set)
  return window.location.origin.replace(/:\d+$/, ':5000');
};

export const API_URL = getApiUrl();

// Helper function to create full API endpoint URLs
export const createApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

// Export commonly used endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  MENU: '/api/menu',
  ADMIN: {
    MENU: '/api/admin/menu',
    CATEGORIES: '/api/admin/categories',
    DASHBOARD: '/api/admin/dashboard',
    ORDERS: '/api/admin/orders',
  },
  ORDERS: '/api/orders',
  HEALTH: '/api/health',
} as const;

