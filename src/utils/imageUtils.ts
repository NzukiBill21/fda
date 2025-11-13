/**
 * Image utility functions for handling various image formats, sizes, and types
 * Supports Base64, URLs, file paths, and provides fallbacks
 */

/**
 * Convert image to safe src attribute
 * Handles raw base64 (from DB), data URIs, URLs, and file paths
 */
export const toImageSrc = (img?: string | null): string => {
  if (!img) {
    return '/fallbacks/placeholder.png';
  }
  
  const imgStr = String(img).trim();
  
  // Already a valid data URI
  if (imgStr.startsWith('data:image/')) {
    return imgStr;
  }
  
  // Valid HTTP/HTTPS URL
  if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
    return imgStr;
  }
  
  // Invalid file path (starts with /src/assets/ - use fallback)
  if (imgStr.includes('/src/assets/')) {
    return '/fallbacks/placeholder.png';
  }
  
  // If it's a filename or relative path, try to construct absolute URL
  if (imgStr.includes('uploads/') || imgStr.includes('items/') || 
      (imgStr.includes('.') && !imgStr.includes('/') && !imgStr.startsWith('http'))) {
    let filename = imgStr;
    if (imgStr.includes('/')) {
      filename = imgStr.split('/').pop() || imgStr;
    }
    
    if (filename && filename.includes('.')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost/mondas-api';
      return `${apiBase}/uploads/items/${filename}`;
    }
  }
  
  // Base64 string without data URI prefix (raw from DB)
  if (imgStr.length > 100 && /^[A-Za-z0-9+/=]+$/.test(imgStr)) {
    // Detect image type from Base64 patterns
    if (imgStr.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${imgStr}`;
    }
    if (imgStr.startsWith('iVBORw0KGgo')) {
      return `data:image/png;base64,${imgStr}`;
    }
    // Default to JPEG for long Base64 strings
    return `data:image/jpeg;base64,${imgStr}`;
  }
  
  // Unknown format, use fallback
  return '/fallbacks/placeholder.png';
};

/**
 * Get a fallback image URL for menu items
 */
export const getFallbackImage = (name?: string, category?: string): string => {
  const imageMap: { [key: string]: string } = {
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=85',
    'pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=85',
    'chicken': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop&q=85',
    'ribs': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=85',
    'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=85',
    'salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=85',
    'drink': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop&q=85',
  };
  
  if (name) {
    const lowerName = name.toLowerCase();
    for (const [key, url] of Object.entries(imageMap)) {
      if (lowerName.includes(key)) {
        return url;
      }
    }
  }
  
  const categoryMap: { [key: string]: string } = {
    'Premium': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=85',
    'African Specials': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=85',
    'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=85',
    'Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=85',
    'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=85',
    'Salads': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&q=85',
    'Chicken': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop&q=85',
    'Drinks': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop&q=85',
  };
  
  return categoryMap[category || ''] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=85';
};

/**
 * Normalize image URL (legacy compatibility)
 */
export const normalizeImageUrl = (
  image: string | null | undefined,
  fallbackName?: string,
  fallbackCategory?: string
): string => {
  if (!image) {
    return getFallbackImage(fallbackName, fallbackCategory);
  }
  
  const normalized = toImageSrc(image);
  if (normalized === '/fallbacks/placeholder.png') {
    return getFallbackImage(fallbackName, fallbackCategory);
  }
  
  return normalized;
};
