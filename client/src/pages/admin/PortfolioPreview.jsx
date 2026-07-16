import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PreviewHeader from '../../components/admin/portfolio/preview/PreviewHeader';
import PreviewInfoSection from '../../components/admin/portfolio/preview/PreviewInfoSection';
import PreviewMediaGrid from '../../components/admin/portfolio/preview/PreviewMediaGrid';
import { useUserProfile } from '@/api/apiHooks/useUser';
import { usePortfolioItems, usePublicPortfolio } from '@/api/apiHooks/usePortfolio';
import { getImgUrl } from '@/utils/image';

const PortfolioPreview = ({ isPublic = false, onClose }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [previewItem, setPreviewItem] = useState(null);

  // 1. Fetch public portfolio data if isPublic is true
  const { data: publicData, isLoading: isPublicLoading } = usePublicPortfolio(isPublic ? slug : undefined);

  // 2. Fetch logged in user's profile and items if isPublic is false
  const { user: currentUserProfile, isLoading: isProfileLoading } = useUserProfile({ enabled: !isPublic });
  const { data: portfolioItems, isLoading: isItemsLoading } = usePortfolioItems({ enabled: !isPublic });

  const isLoading = isPublic ? isPublicLoading : (isProfileLoading || isItemsLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-Primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profileData = isPublic ? publicData?.profile : currentUserProfile;
  const items = isPublic ? publicData?.portfolioItems : portfolioItems;

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Portfolio Not Found</h2>
        <p className="text-gray-500 mb-6">The requested portfolio does not exist or has not been set up yet.</p>
        <button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate(isPublic ? '/' : '/dashboard/portfolio');
            }
          }}
          className="px-6 py-3 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 transition-all shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  const profile = {
    name: profileData.displayName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
    slug: profileData.slug || '',
    niche: profileData.shortBio || '',
    bio: profileData.shortBio || '',
    portfolioLink: `${window.location.origin}/preview/${profileData.slug || ''}`.toLowerCase(),
    services: profileData.servicesOffered || '',
    brands: Array.isArray(profileData.brandLogos) ? profileData.brandLogos.map(logo => getImgUrl(logo)) : [],
    image: getImgUrl(profileData.avatar) || '',
    otherLink: profileData.socialLinks?.other || '',
    socials: {
      instagram: profileData.socialLinks?.instagram || '',
      tiktok: profileData.socialLinks?.website || '', // website field maps tiktok
      youtube: profileData.socialLinks?.youtube || '',
    },
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button / Close Modal */}
      {onClose ? (
        <button
          onClick={onClose}
          className="fixed top-6 right-6 md:top-8 md:right-8 z-[100] p-2 md:p-3 hover:bg-gray-100 rounded-full transition-all text-gray-500 border border-gray-100 bg-white shadow-lg"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      ) : (
        <button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate(isPublic ? '/' : '/dashboard/portfolio');
            }
          }}
          className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] bg-white border border-gray-100 text-[#1A1A1A] p-2 md:p-3 rounded-full hover:bg-Primary hover:text-white transition-all shadow-xl group backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      <PreviewHeader 
        profile={profile} 
        onAvatarClick={() => {
          if (profile.image) {
            setPreviewItem({
              url: profile.image,
              type: 'image',
              title: profile.name,
            });
          }
        }} 
      />
      <PreviewInfoSection profile={profile} />
      <PreviewMediaGrid items={mediaItems} onPreview={(item) => setPreviewItem(item)} />

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
              <div 
                className="rounded-2xl overflow-hidden bg-black relative"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              >
                {previewItem.type === 'video' ? (
                  <video src={previewItem.url} className="w-full max-h-[80vh]" controls autoPlay controlsList="nodownload" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} draggable="false" />
                ) : (
                  <img src={previewItem.url} alt={previewItem.title} className="w-full max-h-[80vh] object-contain" loading="lazy" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} draggable="false" />
                )}
                {/* STAKD Watermark */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden bg-black/10">
                  <span className="text-white/40 text-[100px] md:text-[140px] font-black tracking-[0.25em] uppercase transform -rotate-45 drop-shadow-2xl select-none">
                    STAKD
                  </span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-white font-bold text-sm md:text-base">{previewItem.title}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioPreview;
