/**
 * Fix Cloudinary PDF URLs uploaded incorrectly as "image/upload" instead of "raw/upload".
 * Also works fine with raw/upload and non-Cloudinary URLs.
 */
export const fixPdfUrl = (url) => {
  if (!url) return url;
  // Cloudinary PDF stored as image → convert to raw for proper serving
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/') && url.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
    return url.replace('/image/upload/', '/raw/upload/');
  }
  return url;
};

/**
 * Force download of a file from a URL (handles cross-origin Cloudinary URLs).
 * Uses fl_attachment for Cloudinary, or creates a blob for same-origin.
 */
export const downloadFile = async (url, filename) => {
  const fixed = fixPdfUrl(url);
  if (fixed.includes('res.cloudinary.com')) {
    // Cloudinary: inject fl_attachment flag to force browser download
    const dlUrl = fixed.replace('/raw/upload/', '/raw/upload/fl_attachment/').replace('/image/upload/', '/raw/upload/fl_attachment/');
    window.open(dlUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  // Same-origin / local files: fetch as blob
  try {
    const res = await fetch(fixed);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'contrat.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(fixed, '_blank', 'noopener,noreferrer');
  }
};
