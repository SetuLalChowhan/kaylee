import React from 'react';
import { Star } from 'lucide-react';

const PreviewHeader = ({ profile, onAvatarClick }) => {
  const showRating = Boolean(profile?.showClientRating && profile?.clientSatisfaction !== undefined && profile?.clientSatisfaction !== null);

  return (
    <div className="relative w-full mb-10">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 bg-gradient-to-r from-Primary via-Primary/80 to-Primary rounded-b-[40px] shadow-lg shadow-Primary/10" />

      {/* Profile Overlap Info */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col items-start -mt-16 md:-mt-32 relative z-10">
          <div 
            onClick={onAvatarClick}
            className="w-28 h-28 md:w-48 md:h-48 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-2xl bg-white mb-4 md:mb-6 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img src={profile.image} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">{profile.name}</h1>
            
            {showRating && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/80 shadow-xs">
                <div className="flex items-center text-amber-500">
                  <Star className={`w-4 h-4 ${Number(profile.clientSatisfaction) > 0 ? "fill-amber-400 text-amber-400" : "text-amber-500"}`} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-gray-900">{profile.clientSatisfaction}</span>
                  <span className="text-[10px] font-bold text-gray-400">/ 5</span>
                </div>
                <span className="hidden sm:inline text-[11px] font-semibold text-amber-800 pl-1.5 border-l border-amber-200">
                  Client Satisfaction
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewHeader;
