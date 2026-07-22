import React, { useState, useEffect } from 'react';
import { Edit3, CloudUpload, X } from 'lucide-react';
import ProfileCard from './ProfileCard';
import MediaGrid from './MediaGrid';
import EditPortfolioModal from './modals/EditPortfolioModal';
import UploadContentModal from './modals/UploadContentModal';
import EditContentModal from './modals/EditContentModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useUserProfile } from '@/api/apiHooks/useUser';
import {
  usePortfolioItems,
  useCreatePortfolioItem,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
} from '@/api/apiHooks/usePortfolio';
import { getImgUrl, getBrandLogos } from '@/utils/image';
import natureVideo from '@/assets/videos/nature.mp4';

const Portfolio = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector(selectCurrentUser);
  const { refetch } = useUserProfile();

  const [profile, setProfile] = useState({
    name: '',
    niche: '',
    bio: '',
    portfolioLink: '',
    services: '',
    brands: [],
    image: '',
    otherLink: '',
    socials: { instagram: '', tiktok: '', youtube: '' },
  });

  useEffect(() => {
    if (reduxUser) {
      const slug = reduxUser.slug || (reduxUser.displayName || '').toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
      setProfile({
        name:
          reduxUser.displayName ||
          `${reduxUser.firstName || ''} ${reduxUser.lastName || ''}`.trim(),
        slug,
        bio: reduxUser.shortBio || '',
        portfolioLink: `${window.location.origin}/preview/${slug || 'user'}`,
        services: reduxUser.servicesOffered || '',
        brands: getBrandLogos(reduxUser),
        image: getImgUrl(reduxUser.avatar) || '',
        otherLink: reduxUser.socialLinks?.other || '',
        socials: {
          instagram: reduxUser.socialLinks?.instagram || '',
          tiktok: reduxUser.socialLinks?.website || '',
          youtube: reduxUser.socialLinks?.youtube || '',
        },
      });
    }
  }, [reduxUser]);

  const { data: items } = usePortfolioItems();
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const deleteMutation = useDeletePortfolioItem();

  const mediaItems = Array.isArray(items)
    ? items.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        url: getImgUrl(item.url),
        date: new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
      }))
    : [];

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
    setProfile(prev => ({ ...prev, ...data }));
    refetch();
    toggleModal('editPortfolio', false);
  };

  const handleUploadContent = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.file) {
      formData.append('file', data.file);
    }
    createMutation.mutate(formData, {
      onSuccess: () => toggleModal('uploadContent', false),
    });
  };

  const handleUpdateContent = (data) => {
    const formData = new FormData();
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.newFile) {
      formData.append('file', data.newFile);
    }
    updateMutation.mutate({ id: selectedMedia.id, formData }, {
      onSuccess: () => toggleModal('editContent', false),
    });
  };

  const handleDeleteContent = (item) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Portfolio</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Your public creator profile for brands.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => toggleModal('editPortfolio', true)}
            className="bg-[#F8FAFC] text-[#1A1A1A] px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100 text-xs md:text-sm w-full sm:w-auto"
          >
            <Edit3 className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            Edit Portfolio
          </button>
          <button
            onClick={() => toggleModal('uploadContent', true)}
            className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full sm:w-auto"
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
        isPending={createMutation.isPending}
      />

      <EditContentModal
        isOpen={modals.editContent}
        onClose={() => toggleModal('editContent', false)}
        content={selectedMedia}
        onUpdate={handleUpdateContent}
        isPending={updateMutation.isPending}
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
                  <video src={previewItem.url} className="w-full max-h-[80vh]" controls autoPlay controlsList="nodownload" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} draggable="false" />
                ) : (
                  <img src={previewItem.url} alt={previewItem.title} className="w-full max-h-[80vh] object-contain" loading="lazy" />
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