import React, { useState, useRef } from 'react';
import { Image as ImageIcon, CloudUpload, Play, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUploadCampaignMedia, useDeleteCampaignMedia, useReplaceCampaignMedia } from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';
import { toast } from 'react-toastify';
import MediaCard from './MediaCard';
import MediaPreviewModal from './MediaPreviewModal';
import UploadModal from './UploadModal';
import ReplaceModal from './ReplaceModal';

const ContentGallery = ({ campaign }) => {
  const fileRef = useRef(null);
  const singleReplaceRef = useRef(null);
  const activeReplaceItemIdRef = useRef(null);

  const uploadMutation = useUploadCampaignMedia();
  const deleteMutation = useDeleteCampaignMedia();
  const replaceMutation = useReplaceCampaignMedia();

  // Caption modal state (for new uploads)
  const [captionModal, setCaptionModal] = useState({ open: false, files: [] });
  const [uploadProgress, setUploadProgress] = useState({});

  // Replace caption modal state (for individual replace)
  const [replaceModal, setReplaceModal] = useState({ open: false, itemId: null, file: null, url: null, type: null });

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
      if (type === 'image' && f.size > 50 * 1024 * 1024) {
        toast.error(`Image "${f.name}" exceeds the 50MB limit.`);
        continue;
      }
      if (type === 'video' && f.size > 500 * 1024 * 1024) {
        toast.error(`Video "${f.name}" exceeds the 500MB limit.`);
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
    setCaptionModal({ open: true, files: mapped });
    // reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleUploadSubmit = (uploadDataList) => {
    uploadDataList.forEach(data => {
      const formData = new FormData();
      formData.append('file', data.file.file);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('assetType', data.assetType);

      const filename = data.file.name;
      setUploadProgress(prev => ({ ...prev, [filename]: 0 }));

      uploadMutation.mutate({
        campaignId: campaign.id,
        formData,
        onProgress: (percent) => {
          setUploadProgress(prev => ({ ...prev, [filename]: percent }));
        }
      }, {
        onSuccess: () => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[filename];
            return next;
          });
        },
        onError: () => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[filename];
            return next;
          });
        }
      });
    });
    setCaptionModal({ open: false, files: [] });
  };

  // ── Individual replace (replaces only that one card) ─────────────────────
  const handleReplaceClick = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    activeReplaceItemIdRef.current = itemId;
    if (singleReplaceRef.current) {
      singleReplaceRef.current.value = '';
      singleReplaceRef.current.click();
    }
  };

  const handleReplaceFileSelect = (e) => {
    const file = e.target.files?.[0];
    const itemId = activeReplaceItemIdRef.current;
    if (!file || !itemId) return;

    const type = file.type.startsWith('video') ? 'video' : 'image';
    if (type === 'image' && file.size > 50 * 1024 * 1024) {
      toast.error(`Image "${file.name}" exceeds the 50MB limit.`);
      e.target.value = '';
      return;
    }
    if (type === 'video' && file.size > 500 * 1024 * 1024) {
      toast.error(`Video "${file.name}" exceeds the 500MB limit.`);
      e.target.value = '';
      return;
    }

    setReplaceModal({
      open: true,
      itemId,
      file,
      url: URL.createObjectURL(file),
      type,
    });
    e.target.value = '';
  };

  const handleReplaceSubmit = (replaceData) => {
    const formData = new FormData();
    formData.append('file', replaceData.file);
    formData.append('title', replaceData.title);
    formData.append('description', replaceData.description);
    formData.append('assetType', replaceData.assetType);

    const filename = replaceData.file.name;
    setUploadProgress(prev => ({ ...prev, [filename]: 0 }));

    replaceMutation.mutate({
      campaignId: campaign.id,
      id: replaceData.itemId,
      formData,
      onProgress: (percent) => {
        setUploadProgress(prev => ({ ...prev, [filename]: percent }));
      }
    }, {
      onSuccess: () => {
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[filename];
          return next;
        });
      },
      onError: () => {
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[filename];
          return next;
        });
      }
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

      {/* Hidden file inputs isolated from clickable UI containers to avoid click bubbling and dialog flicker */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={singleReplaceRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleReplaceFileSelect}
      />

      {/* Upload Area — adds new files to the gallery */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          fileRef.current?.click();
        }}
        className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-6"
      >
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
              <div key={filename} className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-Primary/5 via-white to-gray-50 border border-Primary/20 flex flex-col items-center justify-center p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-Primary/10 flex items-center justify-center mb-2">
                  <Loader2 className="w-5 h-5 text-Primary animate-spin" />
                </div>
                <span className="text-xs font-bold text-[#1A1A1A] text-center truncate w-full px-2" title={filename}>{filename}</span>
                <span className="text-xs font-black text-Primary mt-1">{progress}%</span>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-gradient-to-r from-Primary via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-sm" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPreview={setPreviewItem}
                onReplaceClick={handleReplaceClick}
                onDeleteClick={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Download lock notice */}
      <div className={`rounded-xl p-4 border transition-all ${campaign.releaseFiles
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
      <UploadModal
        isOpen={captionModal.open}
        files={captionModal.files}
        onClose={() => setCaptionModal({ open: false, files: [] })}
        onUpload={handleUploadSubmit}
      />

      {/* Replace Caption Modal */}
      <ReplaceModal
        replaceModal={replaceModal}
        onClose={() => setReplaceModal({ open: false, itemId: null, file: null, url: null, type: null })}
        onReplace={handleReplaceSubmit}
      />

      {/* Preview Modal */}
      <MediaPreviewModal previewItem={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};

export default ContentGallery;
