import React from 'react';
import { Play, RefreshCw, Trash2 } from 'lucide-react';
import { getImgUrl } from '@/utils/image';

const MediaCard = ({ item, onPreview, onReplaceClick, onDeleteClick }) => {
  const getMediaSrc = (item) => getImgUrl(item.url);

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer"
      onClick={() => onPreview(item)}
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
        <img src={getMediaSrc(item)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 text-left">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => onReplaceClick(e, item.id)}
            title="Replace this file"
            className="p-1.5 bg-white/90 rounded-lg hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1A1A1A]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteClick(item.id);
            }}
            title="Delete this file"
            className="p-1.5 bg-white/90 rounded-lg hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
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
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-fit ${item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
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
  );
};

export default MediaCard;
