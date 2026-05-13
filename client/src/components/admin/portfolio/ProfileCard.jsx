import React from 'react';
import { Send, Copy, Instagram, Youtube, MoreHorizontal } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const ProfileCard = ({ profile }) => {
  const services = profile.services.split('\n').filter(s => s.trim());

  return (
    <div className="w-full lg:w-[320px] bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm h-fit">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 ring-gray-50 mb-6">
          <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{profile.name}</h2>
        <p className="text-sm font-semibold text-gray-500 mb-4">{profile.niche}</p>
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#4A4A4A] bg-gray-50 px-3 py-1.5 rounded-full mb-8">
          <span>{profile.portfolioLink}</span>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button className="flex-1 bg-Primary text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-Primary/90 transition-all shadow-md shadow-Primary/10">
            <Send className="w-4 h-4" />
            Share you portfolio
          </button>
          <button className="p-3.5 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all">
            <Copy className="w-5 h-5" />
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
            <div key={idx} className="w-12 h-12 rounded-full border border-gray-50 p-2 bg-white flex items-center justify-center">
              <img src={brand} alt="Brand" className="max-w-full h-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div className="flex items-center gap-4 text-gray-400">
        <button className="hover:text-Primary transition-colors"><Instagram className="w-5 h-5" /></button>
        <button className="hover:text-Primary transition-colors"><FaTiktok className="w-4 h-4" /></button>
        <button className="hover:text-Primary transition-colors"><Youtube className="w-5 h-5" /></button>
        <button className="hover:text-Primary transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

export default ProfileCard;
