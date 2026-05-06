/**
 * Cloudinary URL transformation helpers.
 *
 * Cloudinary URLs look like:
 *   https://res.cloudinary.com/<cloud>/image/upload/<options>/path/to/image.jpg
 *
 * We insert transformation parameters before the file path.
 * If the URL is not a Cloudinary URL (e.g. local dev), it is returned unchanged.
 *
 * Why this matters:
 * - Serves WebP/AVIF automatically (f_auto)
 * - Compresses to optimal quality (q_auto)
 * - Resizes to the actual display size (w_N) — avoids sending a 4 MB original
 *   image to a mobile screen that only needs 400 px
 */

function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

function insertTransform(url: string, transforms: string): string {
  // Replace the first occurrence of /upload/ with /upload/<transforms>/
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Returns a responsive, auto-quality Cloudinary URL.
 * @param url     Original image URL (may be null/undefined for products without images)
 * @param width   Target width in pixels (used for `w_N` transform)
 * @param height  Optional target height; if provided adds `h_N,c_fill` (crop to fill)
 */
export function cloudinaryImage(
  url: string | null | undefined,
  width: number,
  height?: number,
): string | null {
  if (!url) return null;
  if (!isCloudinaryUrl(url)) return url; // local dev — pass through unchanged

  const parts = ['q_auto', 'f_auto', `w_${width}`];
  if (height) parts.push(`h_${height}`, 'c_fill');

  return insertTransform(url, parts.join(','));
}

/**
 * Returns a square thumbnail URL (crop to fill).
 * Suitable for product cards, avatars, shop logos.
 */
export function cloudinaryThumbnail(
  url: string | null | undefined,
  size: number,
): string | null {
  return cloudinaryImage(url, size, size);
}
