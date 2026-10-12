import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, CloudUpload, X } from 'lucide-react';
import ProfileCard from './ProfileCard';
import MediaGrid from './MediaGrid';
import EditPortfolioModal from './modals/EditPortfolioModal';
import UploadContentModal from './modals/UploadContentModal';
import EditContentModal from './modals/EditContentModal';
import { useNavigate } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useUserProfile, useUpdateProfile, useDashboardStats } from '@/api/apiHooks/useUser';
import {
  usePortfolioItems,
  useCreatePortfolioItem,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
} from '@/api/apiHooks/usePortfolio';
import { getImgUrl, getBrandLogos } from '@/utils/image';
import { toast } from 'react-toastify';
import natureVideo from '@/assets/videos/nature.mp4';

const Portfolio = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector(selectCurrentUser);
  const { user: userProfile, refetch } = useUserProfile();
  const { data: dashData } = useDashboardStats();
  const updateProfileMutation = useUpdateProfile();
  const isUpdatingRatingRef = React.useRef(false);

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
    clientSatisfaction: '0',
    ratingCount: 0,
    showClientRating: true,
  });

  useEffect(() => {
    const currentUser = userProfile || reduxUser;
    if (currentUser) {
      const slug = currentUser.slug || (currentUser.displayName || '').toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
      
      const rawRating = currentUser.clientSatisfaction !== undefined && currentUser.clientSatisfaction !== null
        ? currentUser.clientSatisfaction
        : dashData?.stats?.clientSatisfaction;
      const clientSatisfaction = rawRating !== undefined && rawRating !== null ? String(rawRating) : "0";
      const ratingCount = currentUser.ratingCount ?? dashData?.stats?.ratingCount ?? 0;
      
      let parsedSocial = currentUser.socialLinks;
      if (typeof parsedSocial === 'string') {
        try { parsedSocial = JSON.parse(parsedSocial); } catch {}
      }

      const serverRatingVisible = currentUser.showClientRating !== undefined && currentUser.showClientRating !== null
        ? Boolean(currentUser.showClientRating)
        : parsedSocial?.showClientRating !== undefined
          ? Boolean(parsedSocial.showClientRating)
          : true;

      setProfile(prev => ({
        name:
          currentUser.displayName ||
          `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        slug,
        bio: currentUser.shortBio || '',
        portfolioLink: `${window.location.origin}/preview/${slug || 'user'}`,
        services: currentUser.servicesOffered || '',
        brands: getBrandLogos(currentUser),
        image: getImgUrl(currentUser.avatar) || '',
        otherLink: parsedSocial?.other || '',
        socials: {
          instagram: parsedSocial?.instagram || '',
          tiktok: parsedSocial?.website || '',
          youtube: parsedSocial?.youtube || '',
        },
        clientSatisfaction,
        ratingCount,
        // Guard against overwriting during active toggle mutation
        showClientRating: isUpdatingRatingRef.current ? prev.showClientRating : serverRatingVisible,
      }));
    }
  }, [reduxUser, userProfile, dashData]);

  const handleToggleRatingVisibility = () => {
    if (updateProfileMutation.isPending || isUpdatingRatingRef.current) return;

    const nextVal = !profile.showClientRating;
    isUpdatingRatingRef.current = true;

    // Immediate optimistic update to local state
    setProfile(prev => ({ ...prev, showClientRating: nextVal }));

    updateProfileMutation.mutate(
      { showClientRating: nextVal },
      {
        onSuccess: (res) => {
          isUpdatingRatingRef.current = false;
          const returnedUser = res?.data || res;
          const finalVal = returnedUser?.showClientRating !== undefined
            ? Boolean(returnedUser.showClientRating)
            : nextVal;

          setProfile(prev => ({ ...prev, showClientRating: finalVal }));
          toast.success(
            finalVal
              ? "Client satisfaction rating is now visible on your public portfolio!"
              : "Client satisfaction rating is now hidden from your public portfolio."
          );
        },
        onError: () => {
          isUpdatingRatingRef.current = false;
          // Revert optimistic update
          setProfile(prev => ({ ...prev, showClientRating: !nextVal }));
        },
      }
    );
  };

  const { data: items } = usePortfolioItems();
  const createMutation = useCreatePortfolioItem();
  const updateMutation = useUpdatePortfolioItem();
  const deleteMutation = useDeletePortfolioItem();

  const mediaItems = useMemo(() => {
    return Array.isArray(items)
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
  }, [items]);

  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(0);
    createMutation.mutate(
      { formData, onProgress: (percent) => setUploadProgress(percent) },
      {
        onSuccess: () => {
          setUploadProgress(0);
          toggleModal('uploadContent', false);
        },
        onError: () => setUploadProgress(0),
      }
    );
  };

  const handleUpdateContent = (data) => {
    const formData = new FormData();
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.newFile) {
      formData.append('file', data.newFile);
    }
    setUploadProgress(0);
    updateMutation.mutate(
      { id: selectedMedia.id, formData, onProgress: (percent) => setUploadProgress(percent) },
      {
        onSuccess: () => {
          setUploadProgress(0);
          toggleModal('editContent', false);
        },
        onError: () => setUploadProgress(0),
      }
    );
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
          <ProfileCard
            profile={profile}
            onToggleRatingVisibility={handleToggleRatingVisibility}
            isUpdatingRating={updateProfileMutation.isPending}
          />

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
        uploadProgress={uploadProgress}
      />

      <EditContentModal
        isOpen={modals.editContent}
        onClose={() => toggleModal('editContent', false)}
        content={selectedMedia}
        onUpdate={handleUpdateContent}
        isPending={updateMutation.isPending}
        uploadProgress={uploadProgress}
      />

      {/* Preview Modal */}
      {previewItem && (
        <div
          key="preview-modal-backdrop"
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full animate-in zoom-in-95 duration-200"
          >
            <button 
              type="button"
              onClick={() => setPreviewItem(null)} 
              className="absolute -top-10 md:-top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[200px]">
              {previewItem.type === 'video' ? (
                <video 
                  src={previewItem.url} 
                  className="w-full max-h-[80vh]" 
                  controls 
                  autoPlay 
                  controlsList="nodownload" 
                  disablePictureInPicture 
                  onContextMenu={(e) => e.preventDefault()} 
                  onDragStart={(e) => e.preventDefault()} 
                  draggable="false" 
                />
              ) : (
                <img 
                  src={previewItem.url} 
                  alt={previewItem.title || "Preview"} 
                  className="w-full max-h-[80vh] object-contain block" 
                  decoding="async"
                />
              )}
            </div>
            <div className="mt-3 text-center">
              <p className="text-white font-bold text-sm md:text-base">{previewItem.title}</p>
              {previewItem.description && <p className="text-white/60 text-xs mt-1">{previewItem.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;