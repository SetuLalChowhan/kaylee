/**
 * Prepend the image base URL (`VITE_IMG_URL`) to relative server paths.
 *
 * The server stores files with relative paths like:
 *   "uploads/avatars/1781846610321-938440392.jpg"
 *   "uploads/brand-logos/logo1.jpg"
 *
 * These need the server origin in front to render:
 *   "http://localhost:3000/uploads/avatars/1781846610321-938440392.jpg"
 */
export function getImgUrl(path) {
  if (!path) return '';
  // Already absolute — return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path;
  if (path.startsWith('blob:')) return path;

  const base = import.meta.env.VITE_IMG_URL || 'http://localhost:3000/';
  // Normalise slashes
  const normalizedBase = base.endsWith('/') ? base : base + '/';
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return normalizedBase + normalizedPath;
}

/**
 * Get the full avatar URL from a user object.
 */
export function getAvatar(user) {
  if (!user) return '';
  return getImgUrl(user.avatar);
}

/**
 * Get the full URL for each brand logo in the brandLogos array.
 */
export function getBrandLogos(user) {
  if (!user?.brandLogos || !Array.isArray(user.brandLogos)) return [];
  return user.brandLogos.map((logo) => getImgUrl(logo));
}
