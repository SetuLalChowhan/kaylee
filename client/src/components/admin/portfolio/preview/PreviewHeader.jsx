import React from 'react';

const PreviewHeader = ({ profile }) => {
  return (
    <div className="relative w-full mb-10">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 bg-gradient-to-r from-Primary via-Primary/80 to-Primary rounded-b-[40px] shadow-lg shadow-Primary/10" />
      
      {/* Profile Overlap Info */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col items-start -mt-16 md:-mt-32 relative z-10">
          <div className="w-28 h-28 md:w-48 md:h-48 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-2xl bg-white mb-4 md:mb-6">
            <img src={profile.image} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-1">{profile.name}</h1>
          <p className="text-sm font-bold text-Primary mb-2">@{profile.slug}</p>
          <a 
            href={profile.portfolioLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-gray-400 hover:text-Primary transition-colors"
          >
            {profile.portfolioLink}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PreviewHeader;
