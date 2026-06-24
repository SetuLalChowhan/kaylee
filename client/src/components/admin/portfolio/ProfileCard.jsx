import React from 'react';
import { Send, Copy, Instagram, Youtube, MoreHorizontal, ExternalLink } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { getImgUrl } from '@/utils/image';
import { toast } from 'react-toastify';

const ProfileCard = ({ profile }) => {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.portfolioLink);
    toast.success("Portfolio link copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Portfolio`,
          text: `Check out ${profile.name}'s UGC creator portfolio!`,
          url: profile.portfolioLink,
        });
      } catch (err) {
        // ignore
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full lg:w-[320px] bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm h-fit">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 ring-gray-50 mb-6">
          <img src={getImgUrl(profile.image) || profile.image} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{profile.name}</h2>
        <p className="text-sm font-bold text-Primary mb-4">@{profile.slug}</p>
        <a 
          href={profile.portfolioLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[11px] font-bold text-[#4A4A4A] hover:text-Primary transition-all bg-gray-50 px-4 py-1.5 rounded-full mb-8 group"
        >
          <span>{profile.portfolioLink}</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-Primary transition-colors" />
        </a>

        <div className="flex items-center gap-2 w-full">
          <button 
            onClick={handleShare}
            className="flex-1 bg-Primary text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-Primary/90 transition-all shadow-md shadow-Primary/10 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Share Portfolio
          </button>
          <button 
            onClick={handleCopy}
            className="p-2 md:p-2.5 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all shrink-0"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Bio:</h3>
        <p className="text-xs text-[#4A4A4A] leading-relaxed font-medium">
          {profile.bio}
        </p>
      </div>

      {/* Services */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Services:</h3>
        <ul className="space-y-1.5">
          {services.map((service, idx) => (
            <li key={idx} className="text-xs text-[#4A4A4A] font-medium">{service}</li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Brands I've worked with</h3>
        <div className="flex flex-wrap gap-3">
          {profile.brands.map((brand, idx) => (
            <div key={idx} className="w-16 h-16 rounded-full border border-gray-100 p-2 bg-white flex items-center justify-center shadow-xs">
              <img src={getImgUrl(brand) || brand} alt="Brand" className="max-w-full max-h-full object-contain" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div className="flex items-center gap-4 text-gray-400">
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
  );
};

export default ProfileCard;
