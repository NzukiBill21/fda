/**
 * API Configuration
 * Centralized API URL management
 */

// HARDCODED: Force use of mondas-api (temporary fix until env vars work)
const API_BASE_URL = 'http://localhost/mondas-api';

/**
 * Creates a full API URL from a relative path
 * @param path - Relative API path (e.g., 'api/menu' or '/api/menu')
 * @returns Full API URL
 */
export function createApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Ensure API_BASE_URL doesn't end with slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${baseUrl}/${cleanPath}`;
}

export default {
  createApiUrl,
  API_BASE_URL
};
