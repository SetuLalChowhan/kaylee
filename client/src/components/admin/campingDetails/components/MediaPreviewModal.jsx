import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { getImgUrl } from '@/utils/image';

const MediaPreviewModal = ({ previewItem, onClose }) => {
  if (!previewItem) return null;
  const getMediaSrc = (item) => getImgUrl(item.url);

  return (
    <AnimatePresence>
      <div key="preview-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-3xl w-full z-10"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer z-10"
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
    </AnimatePresence>
  );
};

export default MediaPreviewModal;
