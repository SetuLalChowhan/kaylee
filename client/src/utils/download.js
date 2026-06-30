import JSZip from 'jszip';
import { getImgUrl } from './image';

const getExtension = (url) => {
  if (!url) return '';
  const parts = url.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].split('?')[0]; // Strip query parameters
    return `.${ext}`;
  }
  return '';
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
    
    const ext = getExtension(relativeUrl);
    let downloadName = name || 'download';
    if (ext && !downloadName.toLowerCase().endsWith(ext.toLowerCase())) {
      downloadName = downloadName + ext;
    }

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
      
      const ext = getExtension(item.url);
      let filename = item.name || `media_${idx}`;
      if (ext && !filename.toLowerCase().endsWith(ext.toLowerCase())) {
        filename = filename + ext;
      }
      
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
      
      const ext = getExtension(doc.url);
      let filename = doc.name || `doc_${idx}`;
      if (ext && !filename.toLowerCase().endsWith(ext.toLowerCase())) {
        filename = filename + ext;
      }
      
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
