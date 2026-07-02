import JSZip from 'jszip';
import { getImgUrl } from './image';

const MIME_MAP = {
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/x-matroska': '.mkv',
  'video/webm': '.webm',
  'video/3gpp': '.3gp',
  'video/ogg': '.ogv',
  'video/avi': '.avi',
  'video/msvideo': '.avi',
  'video/x-msvideo': '.avi',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'text/plain': '.txt',
  'text/html': '.html',
  'text/csv': '.csv',
};

const getExtensionFromMime = (mimeType) => {
  if (!mimeType) return '';
  const cleanMime = mimeType.split(';')[0].trim().toLowerCase();
  return MIME_MAP[cleanMime] || '';
};

const getExtension = (url) => {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  const filename = cleanUrl.split('/').pop();
  const parts = filename.split('.');
  if (parts.length > 1) {
    const ext = parts.pop();
    // Ignore long hashes or base64 strings as extensions (extensions are usually 2-5 chars)
    if (ext && ext.length >= 2 && ext.length <= 5) {
      return `.${ext}`;
    }
  }
  return '';
};

const getSafeFilename = (originalName, blobType, url) => {
  let name = originalName || 'file';
  
  // 1. Try standard MIME type mapping
  let ext = getExtensionFromMime(blobType);
  
  // 2. Fallback to URL extension
  if (!ext) {
    ext = getExtension(url);
  }

  // 3. Append extension if the name doesn't already end with it
  if (ext) {
    if (!name.toLowerCase().endsWith(ext.toLowerCase())) {
      name = name + ext;
    }
  }
  
  return name;
};

/**
 * Downloads a single file directly as a Blob, forcing browser auto-download.
 */
export const downloadFileDirectly = async (relativeUrl, name) => {
  try {
    const absoluteUrl = getImgUrl(relativeUrl);
    const response = await fetch(absoluteUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const downloadName = getSafeFilename(name, blob.type, relativeUrl);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Direct download failed, falling back to window.open:", error);
    window.open(getImgUrl(relativeUrl), '_blank');
  }
};

/**
 * Packs all media items and documents into a ZIP file and downloads it.
 */
export const downloadCampaignZip = async (campaign) => {
  const zip = new JSZip();
  const mediaList = campaign.media || [];
  const docList = campaign.documents || [];
  
  if (mediaList.length === 0 && docList.length === 0) {
    throw new Error("No files available in this campaign to package.");
  }
  
  // Create folders inside zip
  const mediaFolder = zip.folder("Media");
  const documentsFolder = zip.folder("Documents");
  
  // Download all media and add to ZIP
  const mediaPromises = mediaList.map(async (item, idx) => {
    try {
      const absoluteUrl = getImgUrl(item.url);
      const response = await fetch(absoluteUrl);
      if (!response.ok) throw new Error(`Failed to fetch media item ${item.name}`);
      const blob = await response.blob();
      
      const filename = getSafeFilename(item.name || `media_${idx}`, blob.type, item.url);
      
      mediaFolder.file(filename, blob);
    } catch (err) {
      console.error(`Failed to pack media file ${item.name || idx}:`, err);
    }
  });

  // Download all documents and add to ZIP
  const docPromises = docList.map(async (doc, idx) => {
    try {
      const absoluteUrl = getImgUrl(doc.url);
      const response = await fetch(absoluteUrl);
      if (!response.ok) throw new Error(`Failed to fetch document ${doc.name}`);
      const blob = await response.blob();
      
      const filename = getSafeFilename(doc.name || `doc_${idx}`, blob.type, doc.url);
      
      documentsFolder.file(filename, blob);
    } catch (err) {
      console.error(`Failed to pack document ${doc.name || idx}:`, err);
    }
  });

  // Wait for all downloads to finish
  await Promise.all([...mediaPromises, ...docPromises]);
  
  // Generate the zip file
  const content = await zip.generateAsync({ type: "blob" });
  
  // Trigger download of the zip blob
  const zipName = `${campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_assets.zip`;
  const blobUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};
