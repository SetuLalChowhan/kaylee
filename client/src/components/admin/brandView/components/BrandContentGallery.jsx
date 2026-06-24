import React, { useState, useRef } from 'react';
import { MoreVertical, CheckCircle, FileEdit, Play, X, Download, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-toastify';
import { getImgUrl } from '@/utils/image';
import { downloadFileDirectly } from '@/utils/download';

const BrandContentGallery = ({
  mediaItems,
  onApproveFile,
  onRequestChanges,
  requestChangesId,
  changeText,
  setChangeText,
  sendChangeRequest,
  setRequestChangesId,
  releaseFiles,
  pendingApproveId
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const videoRefs = useRef({});

  const handleApprove = (id) => {
    onApproveFile(id);
    setOpenMenuId(null);
  };

  const handleRequest = (id) => {
    onRequestChanges(id);
    setOpenMenuId(null);
  };

  const handleDownload = (item) => {
    if (!releaseFiles) {
      toast.error("Downloads are locked. The creator has not released files yet.");
      return;
    }
    downloadFileDirectly(item.url, item.name);
    setOpenMenuId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const approvedItems = mediaItems.filter(item => item.status === 'approved');
  const reviewItems = mediaItems.filter(item => item.status !== 'approved');

  const renderGrid = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <div
          key={item.id}
          onMouseLeave={() => setOpenMenuId(null)}
          className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden group shadow-sm"
        >
          {/* Title & Menu */}
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{item.name}</h4>
                <p className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</p>
              </div>
              <div className="relative shrink-0 ml-2">
                <button
                  onClick={() => {
                    const isPending = pendingApproveId === item.id || (pendingApproveId === 'all' && item.status !== 'approved');
                    if (!isPending) {
                      setOpenMenuId(openMenuId === item.id ? null : item.id);
                    }
                  }}
                  disabled={pendingApproveId === item.id || (pendingApproveId === 'all' && item.status !== 'approved')}
                  className="p-1.5 hover:bg-gray-50 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {openMenuId === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden"
                    >
                      <button onClick={() => handleApprove(item.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                        <CheckCircle className="w-4 h-4 text-Primary" /> Approve this file
                      </button>
                      <button onClick={() => handleRequest(item.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                        <FileEdit className="w-4 h-4 text-orange-500" /> Request for changes
                      </button>
                      <button onClick={() => handleDownload(item)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-left">
                        {releaseFiles ? <Download className="w-4 h-4 text-Primary" /> : <Lock className="w-4 h-4 text-orange-400" />}
                        {releaseFiles ? 'Download this file' : 'Download Locked'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="px-4 pb-4">
            <div
              className={`aspect-square rounded-xl overflow-hidden bg-gray-100 relative group/media ${
                pendingApproveId === item.id || (pendingApproveId === 'all' && item.status !== 'approved')
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              onClick={() => {
                const isPending = pendingApproveId === item.id || (pendingApproveId === 'all' && item.status !== 'approved');
                if (!isPending) {
                  setPreviewItem(item);
                }
              }}
            >
              {item.type === 'video' ? (
                <>
                  <video
                    ref={(el) => { if (el) videoRefs.current[item.id] = el; }}
                    src={getImgUrl(item.url)}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onMouseEnter={(e) => { e.target.play().catch(() => { }); }}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/media:opacity-0 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                    </div>
                  </div>
                </>
              ) : (
                <img src={getImgUrl(item.url)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              )}

              {/* Hover overlay with description */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 pointer-events-none">
                {item.description && <p className="text-white text-xs leading-relaxed mb-1">{item.description}</p>}
                <p className="text-white/70 text-[10px] truncate">{item.name}</p>
                <p className="text-white/50 text-[10px]">{formatDate(item.createdAt)}</p>
              </div>

              {/* Loading spinner overlay */}
              {(pendingApproveId === item.id || (pendingApproveId === 'all' && item.status !== 'approved')) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 pointer-events-auto">
                  <Loader2 className="w-8 h-8 text-Primary animate-spin mb-1.5" />
                  <span className="text-[10px] font-bold text-Primary">Approving...</span>
                </div>
              )}
            </div>

            {item.status && (
              <div className="mt-2 flex items-center gap-1.5">
                {item.status === 'approved' ? (
                  <div className="flex items-center gap-1.5 text-Primary">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Approved & Verified</span>
                  </div>
                ) : item.status === 'changes_requested' ? (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <FileEdit className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Revision Requested</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-bold">Under Review</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Request Changes inline */}
          {requestChangesId === item.id && (
            <div className="px-4 pb-4">
              <textarea
                placeholder="Write your changes..."
                value={changeText}
                onChange={(e) => setChangeText(e.target.value)}
                rows={3}
                className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all resize-none mb-3 text-[#1A1A1A]"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setRequestChangesId(null); setChangeText(''); }} className="text-sm text-gray-500 font-medium hover:text-[#1A1A1A] cursor-pointer">Cancel</button>
                <button onClick={sendChangeRequest} className="bg-Primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all cursor-pointer">Send</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {reviewItems.length > 0 && (
        <div className="bg-white border border-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            Under Review / Revisions ({reviewItems.length})
          </h3>
          {renderGrid(reviewItems)}
        </div>
      )}

      {approvedItems.length > 0 && (
        <div className="bg-white border border-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-Primary mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-Primary" />
            Verified & Approved Assets ({approvedItems.length})
          </h3>
          {renderGrid(approvedItems)}
        </div>
      )}

      {mediaItems.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-[32px] shadow-sm">
          <p className="text-gray-400 font-medium text-sm">No content has been uploaded to the gallery yet.</p>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewItem(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full"
            >
              <button onClick={() => setPreviewItem(null)} className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="rounded-2xl overflow-hidden bg-black">
                {previewItem.type === 'video' ? (
                  <video src={getImgUrl(previewItem.url)} className="w-full max-h-[80vh]" controls autoPlay />
                ) : (
                  <img src={getImgUrl(previewItem.url)} alt={previewItem.name} className="w-full max-h-[80vh] object-contain" loading="lazy" />
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

export default BrandContentGallery;
