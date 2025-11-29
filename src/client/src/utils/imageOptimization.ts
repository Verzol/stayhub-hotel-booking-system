/**
 * Image optimization utilities
 */

const API_BASE_URL = 'http://localhost:8080';

/**
 * Normalize image URL - adds base URL if needed
 */
export const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url) return '/placeholder-hotel.jpg';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
};

/**
 * Generate thumbnail URL if backend supports it
 * Backend generates thumbnails with "thumb_" prefix
 */
export const getThumbnailUrl = (
  url: string | undefined | null
): string | null => {
  if (!url) return null;

  // Extract filename from URL
  const urlObj = new URL(normalizeImageUrl(url));
  const pathname = urlObj.pathname;
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

  // Backend stores thumbnails with "thumb_" prefix
  // Example: /uploads/abc123.jpg -> /uploads/thumb_abc123.jpg
  if (filename && !filename.startsWith('thumb_')) {
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath =
      pathname.substring(0, pathname.lastIndexOf('/') + 1) + thumbnailFilename;
    return `${urlObj.origin}${thumbnailPath}`;
  }

  return null; // Already a thumbnail or invalid
};

/**
 * Preload image for better UX
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (sources: string[]): Promise<void> => {
  await Promise.all(sources.map((src) => preloadImage(src).catch(() => {})));
};

/**
 * Get image dimensions for aspect ratio calculation
 */
export const getImageDimensions = (
  src: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Create a blur placeholder data URL
 */
export const createBlurPlaceholder = (
  width: number = 20,
  height: number = 20
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
};
