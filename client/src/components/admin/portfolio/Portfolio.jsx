import React, { useState } from 'react';
import { Edit3, CloudUpload, Play, X } from 'lucide-react';
import ProfileCard from './ProfileCard';
import MediaGrid from './MediaGrid';
import EditPortfolioModal from './modals/EditPortfolioModal';
import UploadContentModal from './modals/UploadContentModal';
import EditContentModal from './modals/EditContentModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import natureVideo from '@/assets/videos/nature.mp4';

const Portfolio = () => {
  const navigate = useNavigate();
  // Profile State
  const [profile, setProfile] = useState({
    name: 'Maya Johnson',
    niche: 'Lifestyle',
    bio: 'UGC creator crafting honest, conversion-ready content for lifestyle and beauty brands.',
    portfolioLink: 'https://stakd.co/portfolio/mayajohnson',
    services: '-Product photography\n-Voiceover\n-Unboxing',
    brands: [
      'https://api.iconify.design/logos:nike.svg',
      'https://api.iconify.design/logos:adidas-icon.svg',
      'https://api.iconify.design/logos:puma.svg',
      'https://api.iconify.design/logos:starbucks.svg'
    ],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    otherLink: '',
    socials: { instagram: '@mayajohnson', tiktok: '@mayajohnson', youtube: 'youtube/mayajohnson' }
  });

  // Media State
  const [mediaItems, setMediaItems] = useState([
    { id: 1, title: 'Nike shoe Promotion', date: 'Apr 25.2026', type: 'image', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { id: 2, title: 'Summer Skincare Promo', date: 'May 06.2025', type: 'video', url: natureVideo },
    { id: 3, title: 'Brand Lifestyle Shoot', date: 'Jun 12.2025', type: 'image', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
    { id: 4, title: 'Product Unboxing', date: 'Jul 20.2025', type: 'video', url: natureVideo },
    { id: 5, title: 'Morning Routine Reel', date: 'Aug 15.2025', type: 'image', url: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?q=80&w=600&auto=format&fit=crop' },
    { id: 6, title: 'Coffee Brand Ad', date: 'Sep 02.2025', type: 'video', url: natureVideo },
  ]);

  // Modal States
  const [modals, setModals] = useState({
    editPortfolio: false,
    uploadContent: false,
    editContent: false
  });
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // Handlers
  const toggleModal = (key, val) => setModals(prev => ({ ...prev, [key]: val }));

  const handleUpdateProfile = (data) => {
    console.log('Portfolio Update Values:', data);
    setProfile(prev => ({ ...prev, ...data }));
    toggleModal('editPortfolio', false);
  };

  const handleUploadContent = (data) => {
    console.log('New Content Uploaded:', data);
    const newItem = {
      id: Date.now(),
      title: data.title,
      type: data.type || (data.file?.type?.startsWith('video') ? 'video' : 'image'),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      url: data.file ? URL.createObjectURL(data.file) : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
    };
    setMediaItems(prev => [newItem, ...prev]);
    toggleModal('uploadContent', false);
  };

  const handleUpdateContent = (data) => {
    console.log('Content Updated:', data);
    setMediaItems(prev => prev.map(m => m.id === selectedMedia.id ? { ...m, ...data } : m));
    toggleModal('editContent', false);
  };

  const handleDeleteContent = (item) => {
    setMediaItems(prev => prev.filter(m => m.id !== item.id));
  };

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-3xl font-bold text-[#1A1A1A] mb-1">Portfolio</h1>
          <p className="text-gray-400 text-sm font-medium">Your public creator profile for brands</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate('/dashboard/portfolio/preview')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#F8FAFC] text-[#1A1A1A] px-4 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-gray-100 transition-all border border-gray-100"
          >
            Preview
          </button>
          <button
            onClick={() => toggleModal('editPortfolio', true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#F8FAFC] text-[#1A1A1A] px-4 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-gray-100 transition-all border border-gray-100"
          >
            <Edit3 className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            Edit Portfolio
          </button>
          <button
            onClick={() => toggleModal('uploadContent', true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-Primary text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
          >
            <CloudUpload className="w-4 h-4 md:w-5 md:h-5" />
            Upload media
          </button>
        </div>
      </div>

      {/* Main Content Layout with Full Width Banner */}
      <div className="relative w-full">
        {/* Full Width Banner */}
        <div className="w-full h-40 md:h-64 rounded-2xl md:rounded-[32px] bg-gradient-to-r from-Primary via-Primary/80 to-Primary shadow-lg shadow-Primary/20 mb-8 md:mb-10" />

        {/* Content Container (Overlapping) */}
        <div className="flex flex-col lg:flex-row gap-8 md:gap-10 px-4 md:px-10 -mt-24 md:-mt-48 relative z-10">
          {/* Profile Card Sidebar */}
          <ProfileCard profile={profile} />

          {/* Media Grid Section */}
          <div className="flex-1 w-full pt-16 md:pt-32">
            <MediaGrid
              items={mediaItems}
              onEdit={(item) => {
                setSelectedMedia(item);
                toggleModal('editContent', true);
              }}
              onDelete={handleDeleteContent}
              onPreview={(item) => setPreviewItem(item)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditPortfolioModal
        isOpen={modals.editPortfolio}
        onClose={() => toggleModal('editPortfolio', false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />

      <UploadContentModal
        isOpen={modals.uploadContent}
        onClose={() => toggleModal('uploadContent', false)}
        onUpload={handleUploadContent}
      />

      <EditContentModal
        isOpen={modals.editContent}
        onClose={() => toggleModal('editContent', false)}
        content={selectedMedia}
        onUpdate={handleUpdateContent}
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewItem(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full"
            >
              <button onClick={() => setPreviewItem(null)} className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="rounded-2xl overflow-hidden bg-black">
                {previewItem.type === 'video' ? (
                  <video src={natureVideo} className="w-full max-h-[80vh]" controls autoPlay />
                ) : (
                  <img src={previewItem.url} alt={previewItem.title} className="w-full max-h-[80vh] object-contain" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="text-white font-bold text-sm md:text-base">{previewItem.title}</p>
                {previewItem.description && <p className="text-white/60 text-xs mt-1">{previewItem.description}</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;