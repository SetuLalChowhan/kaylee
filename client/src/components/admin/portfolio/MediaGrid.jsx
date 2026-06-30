import React, { useState } from 'react';
import { MoreVertical, Edit3, Trash2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import natureVideo from '@/assets/videos/nature.mp4';

const MediaItem = ({ item, onEdit, onDelete, onPreview }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onMouseLeave={() => setShowOptions(false)}
      className="relative rounded-2xl md:rounded-[32px] overflow-hidden group aspect-square bg-gray-50 border border-gray-100 cursor-pointer"
      onClick={() => onPreview(item)}
    >
      {item.type === 'video' ? (
        <>
          <video 
            src={item.url || natureVideo} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            muted
            playsInline
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
            </div>
          </div>
        </>
      ) : item.url ? (
        <img src={item.url} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        loading="lazy" />
      ) : (
        <div className="w-full h-full bg-[#E5E9F2]" />
      )}

      {/* Overlay info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 md:p-8 flex flex-col justify-end pointer-events-none">
        <h4 className="text-white font-bold text-base md:text-lg mb-1">{item.title}</h4>
        <p className="text-white/70 text-[10px] md:text-[11px] font-bold uppercase tracking-wider">{item.date}</p>
      </div>

      {/* Options button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className={`p-1.5 md:p-2 rounded-full backdrop-blur-md border transition-all ${showOptions ? 'bg-white text-[#1A1A1A] shadow-xl border-gray-100' : 'bg-white text-[#1A1A1A] shadow-xl border-gray-100 hover:scale-110'}`}
          >
            <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute right-0 mt-2 w-32 md:w-40 bg-white rounded-xl md:rounded-2xl shadow-xl z-20 py-1 md:py-2 overflow-hidden border border-gray-50"
              >
                <button 
                  onClick={() => {
                    onDelete(item);
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-500 hover:bg-red-50 transition-colors font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const MediaGrid = ({ items, onEdit, onDelete, onPreview }) => {
  return (
    <div className="flex-1 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {items.length > 0 ? (
        items.map((item) => (
          <MediaItem 
            key={item.id} 
            item={item} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onPreview={onPreview}
          />
        ))
      ) : (
        Array.from({ length: 6 }).map((_, idx) => (
          <MediaItem key={idx} item={{}} onPreview={() => {}} />
        ))
      )}
    </div>
  );
};

export default MediaGrid;
