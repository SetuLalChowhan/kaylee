import React, { useState, useRef } from 'react';
import { Image as ImageIcon, CloudUpload, Play, RefreshCw, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import natureVideo from '@/assets/videos/nature.mp4';

const ContentGallery = () => {
  const fileRef = useRef(null);
  const [items, setItems] = useState([
    { id: 1, name: 'Product-photo.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', description: '', date: 'Apr 20, 2026' },
    { id: 2, name: 'BTS-video.mp4', type: 'video', url: '', description: 'Behind the scenes footage', date: 'Apr 20, 2026' },
    { id: 3, name: 'Final-edit.mp4', type: 'video', url: '', description: 'Behind the scenes shot with product. Final edited version.', date: 'Apr 20, 2026' },
  ]);

  // Caption modal state
  const [captionModal, setCaptionModal] = useState({ open: false, files: [] });
  const [captions, setCaptions] = useState({});

  // Preview modal
  const [previewItem, setPreviewItem] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const mapped = files.map(f => ({
      file: f,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
    }));
    setCaptionModal({ open: true, files: mapped });
    setCaptions({});
  };

  const handleUpload = () => {
    const newItems = captionModal.files.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      type: f.type,
      url: f.url,
      description: captions[f.name] || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    }));
    setItems(prev => [...prev, ...newItems]);
    console.log('Content Uploaded:', newItems);
    setCaptionModal({ open: false, files: [] });
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    console.log('Content Deleted:', id);
  };

  const getMediaSrc = (item) => {
    if (item.type === 'video' && !item.url) return natureVideo;
    return item.url;
  };

  const getThumbSrc = (item) => {
    if (item.type === 'video' && !item.url) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
    return item.url;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Content Gallery</h3>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-6"
      >
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
        <CloudUpload className="w-8 h-8 text-Primary/40 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-400">Drag & drop files here</p>
        <p className="text-xs text-gray-300 italic my-1">or</p>
        <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
      </div>

      {/* Grid */}
      {items.length > 0 && (
        <>
          <h4 className="text-sm font-bold text-[#1A1A1A] mb-4">Uploaded Content</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer"
                onClick={() => setPreviewItem(item)}
              >
                {item.type === 'video' ? (
                  <>
                    <video
                      src={getMediaSrc(item)}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => { e.target.play().catch(() => { }); }}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                )}

                {/* Hover overlay with details */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                  {item.description && <p className="text-white text-xs leading-relaxed mb-1">{item.description}</p>}
                  <p className="text-white/60 text-[10px]">{item.name}</p>
                  <p className="text-white/40 text-[10px]">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Download lock notice */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">Downloads are locked for brand</h4>
        <p className="text-xs text-gray-400">After brand approval, click "Release Files" to allow downloads. Brand can view but not download until released.</p>
      </div>

      {/* Caption Modal */}
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
              <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">Add descriptions to help the brand understand your content Campaigns</p>

              <div className="space-y-4 md:space-y-5">
                {captionModal.files.map((file) => (
                  <div key={file.name} className="flex items-start gap-3 md:gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {file.type === 'video' ? (
                        <video src={file.url} className="w-full h-full object-cover" muted preload="metadata" />
                      ) : (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-bold text-[#1A1A1A] mb-1 md:mb-2">{file.name}</p>
                      <input
                        type="text"
                        placeholder="e.g. 'Behind the scenes shot with product', etc."
                        value={captions[file.name] || ''}
                        onChange={(e) => setCaptions(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="w-full bg-white border border-gray-100 rounded-xl py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm focus:border-Primary focus:outline-none transition-all"
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
                  <video src={getMediaSrc(previewItem)} className="w-full max-h-[80vh]" controls autoPlay />
                ) : (
                  <img src={previewItem.url} alt={previewItem.name} className="w-full max-h-[80vh] object-contain" />
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
