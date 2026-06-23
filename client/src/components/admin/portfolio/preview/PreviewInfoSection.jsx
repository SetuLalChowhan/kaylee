import React from 'react';
import { Instagram, Youtube, MoreHorizontal } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const PreviewInfoSection = ({ profile }) => {
  const services = profile.services.split('\n').filter(s => s.trim());

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
              <div key={idx} className="w-12 h-12 rounded-full border border-gray-50 p-2 bg-white flex items-center justify-center shadow-sm">
                <img src={brand} alt="Brand" className="max-w-full h-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewInfoSection;
