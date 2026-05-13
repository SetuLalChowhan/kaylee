import React, { useState, useRef } from 'react';
import { MoreVertical, CheckCircle, FileEdit, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import natureVideo from '@/assets/videos/nature.mp4';

const BrandContentGallery = ({ mediaItems, onApproveFile, onRequestChanges, requestChangesId, changeText, setChangeText, sendChangeRequest, setRequestChangesId }) => {
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            onMouseLeave={() => setOpenMenuId(null)}
            className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden group"
          >
            {/* Title & Menu */}
            <div className="p-4 pb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A1A]">{item.title}</h4>
                  <p className="text-[10px] text-gray-400">{item.date}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
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
                        <button onClick={() => handleApprove(item.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <CheckCircle className="w-4 h-4" /> Approve this file
                        </button>
                        <button onClick={() => handleRequest(item.id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <FileEdit className="w-4 h-4" /> Request for changes
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
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative cursor-pointer group/media"
                onClick={() => setPreviewItem(item)}
              >
                {item.type === 'video' ? (
                  <>
                    <video
                      ref={(el) => { if (el) videoRefs.current[item.id] = el; }}
                      src={natureVideo}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/media:opacity-0 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                )}

                {/* Hover overlay with description */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 pointer-events-none">
                  {item.description && <p className="text-white text-xs leading-relaxed mb-1">{item.description}</p>}
                  <p className="text-white/70 text-[10px]">{item.title}</p>
                  <p className="text-white/50 text-[10px]">{item.date}</p>
                </div>
              </div>

              {item.status === 'approved' && (
                <div className="mt-2 flex items-center gap-1.5 text-green-500">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">Approved</span>
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
                  className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all resize-none mb-3"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => { setRequestChangesId(null); setChangeText(''); }} className="text-sm text-gray-500 font-medium hover:text-[#1A1A1A]">Cancel</button>
                  <button onClick={sendChangeRequest} className="bg-Primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all">Send</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
              <button onClick={() => setPreviewItem(null)} className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="rounded-2xl overflow-hidden bg-black">
                {previewItem.type === 'video' ? (
                  <video src={natureVideo} className="w-full max-h-[80vh]" controls autoPlay />
                ) : (
                  <img src={previewItem.url} alt={previewItem.title} className="w-full max-h-[80vh] object-contain" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="text-white font-bold text-sm">{previewItem.title}</p>
                {previewItem.description && <p className="text-white/60 text-xs mt-1">{previewItem.description}</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrandContentGallery;
