import React, { useState, useRef } from 'react';
import { Image as ImageIcon, CloudUpload, Play, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUploadCampaignMedia, useDeleteCampaignMedia, useReplaceCampaignMedia } from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';
import { toast } from 'react-toastify';

const ContentGallery = ({ campaign }) => {
  const fileRef = useRef(null);
  // Per-item replace: keyed by media id
  const replaceRefs = useRef({});

  const uploadMutation = useUploadCampaignMedia();
  const deleteMutation = useDeleteCampaignMedia();
  const replaceMutation = useReplaceCampaignMedia();

  // Caption modal state (for new uploads)
  const [captionModal, setCaptionModal] = useState({ open: false, files: [] });
  const [captions, setCaptions] = useState({});
  const [titles, setTitles] = useState({});
  const [assetTypes, setAssetTypes] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // Replace caption modal state (for individual replace)
  const [replaceModal, setReplaceModal] = useState({ open: false, itemId: null, file: null, url: null, type: null });
  const [replaceCaption, setReplaceCaption] = useState('');
  const [replaceTitle, setReplaceTitle] = useState('');
  const [replaceAssetType, setReplaceAssetType] = useState('Video');

  // Preview modal
  const [previewItem, setPreviewItem] = useState(null);

  const items = campaign.media || [];

  // ── New upload (adds to gallery) ──────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter valid files and toast errors for invalid ones
    const validFiles = [];
    for (const f of files) {
      const type = f.type.startsWith('video') ? 'video' : 'image';
      if (type === 'image' && f.size > 20 * 1024 * 1024) {
        toast.error(`Image "${f.name}" exceeds the 20MB limit.`);
        continue;
      }
      if (type === 'video' && f.size > 100 * 1024 * 1024) {
        toast.error(`Video "${f.name}" exceeds the 100MB limit.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const mapped = validFiles.map(f => ({
      file: f,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
    }));
    const initialAssetTypes = {};
    validFiles.forEach(f => {
      const isVideo = f.type.startsWith('video');
      initialAssetTypes[f.name] = isVideo ? 'Video' : 'Photo';
    });
    setAssetTypes(initialAssetTypes);
    setCaptionModal({ open: true, files: mapped });
    setCaptions({});
    setTitles({});
    // reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleUpload = () => {
    captionModal.files.forEach(f => {
      const formData = new FormData();
      formData.append('file', f.file);
      formData.append('title', titles[f.name] || f.name);
      formData.append('description', captions[f.name] || '');
      formData.append('assetType', assetTypes[f.name] || (f.type === 'video' ? 'Video' : 'Photo'));

      setUploadProgress(prev => ({ ...prev, [f.name]: 0 }));

      uploadMutation.mutate({
        campaignId: campaign.id,
        formData,
        onProgress: (percent) => {
          setUploadProgress(prev => ({ ...prev, [f.name]: percent }));
        }
      }, {
        onSuccess: () => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[f.name];
            return next;
          });
        },
        onError: () => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[f.name];
            return next;
          });
        }
      });
    });
    setCaptionModal({ open: false, files: [] });
  };

  // ── Individual replace (replaces only that one card) ─────────────────────
  const handleReplaceClick = (e, itemId) => {
    e.stopPropagation();
    if (replaceRefs.current[itemId]) {
      replaceRefs.current[itemId].value = '';
      replaceRefs.current[itemId].click();
    }
  };

  const handleReplaceFileSelect = (e, itemId) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith('video') ? 'video' : 'image';
    if (type === 'image' && file.size > 20 * 1024 * 1024) {
      toast.error(`Image "${file.name}" exceeds the 20MB limit.`);
      e.target.value = '';
      return;
    }
    if (type === 'video' && file.size > 100 * 1024 * 1024) {
      toast.error(`Video "${file.name}" exceeds the 100MB limit.`);
      e.target.value = '';
      return;
    }

    setReplaceCaption('');
    setReplaceTitle('');
    setReplaceAssetType(type === 'video' ? 'Video' : 'Photo');
    setReplaceModal({
      open: true,
      itemId,
      file,
      url: URL.createObjectURL(file),
      type,
    });
    e.target.value = '';
  };

  const handleReplaceUpload = () => {
    if (!replaceModal.file || !replaceModal.itemId) return;
    const formData = new FormData();
    formData.append('file', replaceModal.file);
    formData.append('title', replaceTitle || replaceModal.file.name);
    formData.append('description', replaceCaption);
    formData.append('assetType', replaceAssetType);

    replaceMutation.mutate({
      campaignId: campaign.id,
      id: replaceModal.itemId,
      formData,
    });
    setReplaceModal({ open: false, itemId: null, file: null, url: null, type: null });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this media content?")) {
      deleteMutation.mutate({ campaignId: campaign.id, id });
    }
  };

  const getMediaSrc = (item) => getImgUrl(item.url);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
          <ImageIcon className="w-5 h-5 text-Primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Content Gallery</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Upload deliverables here for brand to see via their unique link</p>
        </div>
      </div>

      {/* Upload Area — adds new files to the gallery */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-6"
      >
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
        <CloudUpload className="w-8 h-8 text-Primary/40 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-400">Drag &amp; drop files here</p>
        <p className="text-xs text-gray-300 italic my-1">or</p>
        <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
      </div>

      {/* Grid */}
      {(items.length > 0 || Object.keys(uploadProgress).length > 0) && (
        <>
          <h4 className="text-sm font-bold text-[#1A1A1A] mb-4">Uploaded Content</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-Primary animate-spin mb-2" />
                <span className="text-xs font-bold text-[#1A1A1A] text-center truncate w-full px-2">{filename}</span>
                <span className="text-[10px] font-bold text-Primary mt-1">{progress}%</span>
                <div className="absolute bottom-0 left-0 h-1 bg-Primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            ))}
            {items.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer"
                onClick={() => setPreviewItem(item)}
              >
                {/* Hidden per-item replace input — stopPropagation prevents bubble to parent card */}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  ref={(el) => { if (el) replaceRefs.current[item.id] = el; }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleReplaceFileSelect(e, item.id)}
                />

                {item.type === 'video' ? (
                  <>
                    <video
                      src={getMediaSrc(item)}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => { e.target.play().catch(() => {}); }}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={getMediaSrc(item)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 text-left">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {/* Replace this specific item */}
                    <button
                      onClick={(e) => handleReplaceClick(e, item.id)}
                      title="Replace this file"
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                  {item.description && <p className="text-white text-xs leading-relaxed mb-1">{item.description}</p>}
                  <p className="text-white/60 text-[10px] truncate">{item.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {item.assetType && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {item.assetType}
                      </span>
                    )}
                    {item.status && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-fit ${
                        item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'changes_requested' ? 'bg-red-500/20 text-red-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {item.status === 'approved' ? 'Approved' :
                         item.status === 'changes_requested' ? 'Revision Requested' :
                         'Pending Review'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Download lock notice */}
      <div className={`rounded-xl p-4 border transition-all ${
        campaign.releaseFiles
          ? 'bg-green-50 border-green-100'
          : 'bg-orange-50 border-orange-100'
      }`}>
        <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">
          {campaign.releaseFiles ? 'Downloads are unlocked for brand' : 'Downloads are locked for brand'}
        </h4>
        <p className="text-xs text-gray-400">
          {campaign.releaseFiles
            ? 'Files have been released. The brand can download all content and documents directly.'
            : 'After brand approval, select "Release Files" to allow downloads. The brand can view but not download content until released.'}
        </p>
      </div>

      {/* Caption Modal (for new uploads) */}
      <AnimatePresence>
        {captionModal.open && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCaptionModal({ open: false, files: [] })}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl md:rounded-[32px] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setCaptionModal({ open: false, files: [] })}
                className="absolute top-6 right-6 p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-1">Add Captions to Your Content</h2>
              <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Add descriptions to help the brand understand your content</p>

              <div className="space-y-4 md:space-y-5">
                {captionModal.files.map((file) => (
                  <div key={file.name} className="flex items-start gap-3 md:gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {file.type === 'video' ? (
                        <video src={file.url} className="w-full h-full object-cover" muted preload="metadata" />
                      ) : (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs md:text-sm font-bold text-[#1A1A1A] mb-1 text-left">{file.name}</p>
                      <input
                        type="text"
                        placeholder="File Title (e.g. 'OTWAY PASTURES PRODUCT PHOTO')"
                        value={titles[file.name] || ''}
                        onChange={(e) => setTitles(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-3 text-xs focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
                      />
                      <select
                        value={assetTypes[file.name] || 'Video'}
                        onChange={(e) => setAssetTypes(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-3 text-xs focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] cursor-pointer"
                      >
                        <option value="Video">Video</option>
                        <option value="Raw Footage">Raw Footage</option>
                        <option value="B-Roll">B-Roll</option>
                        <option value="Photo">Photo</option>
                        <option value="Graphic">Graphic</option>
                        <option value="Audio">Audio</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="e.g. 'Behind the scenes shot with product', etc."
                        value={captions[file.name] || ''}
                        onChange={(e) => setCaptions(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-3 text-xs focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-50">
                <button onClick={handleUpload} className="text-xs md:text-sm text-gray-500 font-medium hover:text-[#1A1A1A] transition-colors">Skip Caption</button>
                <button onClick={handleUpload} className="bg-Primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-Primary/90 transition-all">Upload</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Replace Caption Modal — shown when replacing a single item via the refresh icon */}
      <AnimatePresence>
        {replaceModal.open && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReplaceModal({ open: false, itemId: null, file: null, url: null, type: null })}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl md:rounded-[32px] shadow-2xl p-6 md:p-8"
            >
              <button
                onClick={() => setReplaceModal({ open: false, itemId: null, file: null, url: null, type: null })}
                className="absolute top-6 right-6 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-Primary" />
                <h2 className="text-lg font-bold text-[#1A1A1A]">Replace Content</h2>
              </div>
              <p className="text-xs text-gray-400 mb-5">Optionally update the title/description for this replacement file</p>

              <div className="flex items-start gap-4">
                {/* Preview thumbnail of new file */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {replaceModal.type === 'video' ? (
                    <video src={replaceModal.url} className="w-full h-full object-cover" muted preload="metadata" />
                  ) : (
                    <img src={replaceModal.url} alt="replacement preview" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold text-[#1A1A1A] mb-1 text-left truncate">{replaceModal.file?.name}</p>
                  <input
                    type="text"
                    placeholder="File Title (e.g. 'OTWAY PASTURES PRODUCT PHOTO')"
                    value={replaceTitle}
                    onChange={(e) => setReplaceTitle(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-3 text-xs focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
                  />
                  <select
                    value={replaceAssetType}
                    onChange={(e) => setReplaceAssetType(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-3 text-xs focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] cursor-pointer"
                  >
                    <option value="Video">Video</option>
                    <option value="Raw Footage">Raw Footage</option>
                    <option value="B-Roll">B-Roll</option>
                    <option value="Photo">Photo</option>
                    <option value="Graphic">Graphic</option>
                    <option value="Audio">Audio</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. 'Final version with logo', etc."
                    value={replaceCaption}
                    onChange={(e) => setReplaceCaption(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-3 text-xs focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-50">
                <button
                  onClick={handleReplaceUpload}
                  className="text-sm text-gray-500 font-medium hover:text-[#1A1A1A] transition-colors"
                >
                  Skip & Replace
                </button>
                <button
                  onClick={handleReplaceUpload}
                  className="bg-Primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all"
                >
                  Replace Content
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewItem(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full"
            >
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="rounded-2xl overflow-hidden bg-black">
                {previewItem.type === 'video' ? (
                  <video src={getMediaSrc(previewItem)} className="w-full max-h-[80vh]" controls autoPlay controlsList="nodownload" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} draggable="false" />
                ) : (
                  <img src={getMediaSrc(previewItem)} alt={previewItem.name} className="w-full max-h-[80vh] object-contain" loading="lazy" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="text-white font-bold text-sm">{previewItem.name}</p>
                {previewItem.description && <p className="text-white/60 text-xs mt-1">{previewItem.description}</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentGallery;
