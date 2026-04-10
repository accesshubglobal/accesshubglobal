/**
 * Returns the Cloudinary URL as-is for viewing in the browser.
 * Both /image/upload/ and /raw/upload/ paths work correctly for PDFs in Cloudinary.
 * Note: do NOT convert image/upload → raw/upload as that creates 404 for legacy uploads.
 */
export const fixPdfUrl = (url) => {
  if (!url) return '';
  return url;
};

/**
 * Force download of a file from a Cloudinary URL using fl_attachment flag.
 * Works for both image/upload and raw/upload resource types.
 */
export const downloadFile = async (url, filename) => {
  if (!url) return;
  if (url.includes('res.cloudinary.com')) {
    // Add fl_attachment flag to force browser download prompt
    let dlUrl = url;
    if (url.includes('/image/upload/') && !url.includes('fl_attachment')) {
      dlUrl = url.replace('/image/upload/', '/image/upload/fl_attachment/');
    } else if (url.includes('/raw/upload/') && !url.includes('fl_attachment')) {
      dlUrl = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    }
    window.open(dlUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  // Non-Cloudinary: open in new tab (works for local files and external URLs)
  window.open(url, '_blank', 'noopener,noreferrer');
};
