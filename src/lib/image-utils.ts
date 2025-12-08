// Utility functions for image handling

/**
 * Normalize image URL to ensure it starts with /images/
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  // If already starts with /images/, return as is
  if (url.startsWith('/images/')) {
    return url;
  }
  
  // If starts with /, assume it's already correct
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a relative path without leading slash, add /images/
  if (!url.startsWith('http')) {
    return `/images/${url}`;
  }
  
  // Return as is for external URLs
  return url;
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid image extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

