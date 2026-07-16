import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import natureVideo from '@/assets/videos/nature.mp4';

const PreviewMediaGrid = ({ items, onPreview }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pb-32">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative rounded-2xl md:rounded-[32px] overflow-hidden group aspect-square bg-gray-50 border border-gray-100 shadow-sm cursor-pointer"
            onClick={() => onPreview && onPreview(item)}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
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
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  draggable="false"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                  </div>
                </div>
              </>
            ) : (
              <img src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy" 
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                draggable="false"
              />
            )}

            {/* STAKD Watermark */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden bg-black/5">
              <span className="text-white/45 text-5xl font-black tracking-[0.2em] uppercase transform -rotate-45 drop-shadow-md select-none">
                STAKD
              </span>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 md:p-8 flex flex-col justify-end z-20">
              <h4 className="text-white font-bold text-sm md:text-lg mb-0.5 md:mb-1">{item.title}</h4>
              <p className="text-white/70 text-[9px] md:text-[11px] font-bold uppercase tracking-wider">{item.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PreviewMediaGrid;
