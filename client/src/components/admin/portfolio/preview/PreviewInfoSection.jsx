import React from 'react';
import { Instagram, Youtube, MoreHorizontal, Star } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const PreviewInfoSection = ({ profile }) => {
  const services = profile?.services ? profile.services.split('\n').filter(s => s.trim()) : [];
  const showRating = Boolean(profile?.showClientRating && profile?.clientSatisfaction !== undefined && profile?.clientSatisfaction !== null);

  const getSocialUrl = (platform, usernameOrUrl) => {
    if (!usernameOrUrl) return '#';
    if (usernameOrUrl.startsWith('http://') || usernameOrUrl.startsWith('https://')) {
      return usernameOrUrl;
    }
    const cleanValue = usernameOrUrl.replace(/^@/, '');
    if (platform === 'instagram') {
      return `https://instagram.com/${cleanValue}`;
    }
    if (platform === 'tiktok') {
      return `https://tiktok.com/@${cleanValue}`;
    }
    if (platform === 'youtube') {
      return `https://youtube.com/@${cleanValue}`;
    }
    return usernameOrUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
        {/* Bio & Socials */}
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-tight">Bio:</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-[300px]">
              {profile.bio}
            </p>
          </div>

          {/* Client Satisfaction Highlight */}
          {/* {showRating && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200/70 shadow-xs max-w-[300px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Client Satisfaction</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        Number(profile.clientSatisfaction) > 0 && s <= Math.round(Number(profile.clientSatisfaction))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-black text-[#1A1A1A]">{profile.clientSatisfaction}</span>
                <span className="text-xs font-semibold text-gray-400">/ 5 Rating</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                {Number(profile.ratingCount) > 0
                  ? `Verified rating based on ${profile.ratingCount} delivered campaign${Number(profile.ratingCount) > 1 ? 's' : ''}`
                  : 'Verified creator client satisfaction rating'}
              </p>
            </div>
          )} */}

          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 uppercase tracking-tight">Social links:</h3>
            <div className="flex items-center gap-3 text-gray-400">
              {profile.socials?.instagram && (
                <a 
                  href={getSocialUrl('instagram', profile.socials.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-Primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.socials?.tiktok && (
                <a 
                  href={getSocialUrl('tiktok', profile.socials.tiktok)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-Primary transition-colors"
                >
                  <FaTiktok className="w-4 h-4" />
                </a>
              )}
              {profile.socials?.youtube && (
                <a 
                  href={getSocialUrl('youtube', profile.socials.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-Primary transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {profile.otherLink && (
                <a 
                  href={profile.otherLink.startsWith('http') ? profile.otherLink : `https://${profile.otherLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-Primary transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-tight">Services:</h3>
          <ul className="space-y-1.5">
            {services.map((service, idx) => (
              <li key={idx} className="text-xs text-gray-500 font-medium">{service}</li>
            ))}
          </ul>
        </div>

        {/* Brands */}
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 uppercase tracking-tight">Brands I've worked with:</h3>
          <div className="flex flex-wrap gap-3">
            {profile.brands.map((brand, idx) => (
              <div key={idx} className="w-16 h-16 rounded-full border border-gray-100 p-2 bg-white flex items-center justify-center shadow-sm">
                <img src={brand} alt="Brand" className="max-w-full max-h-full object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewInfoSection;
