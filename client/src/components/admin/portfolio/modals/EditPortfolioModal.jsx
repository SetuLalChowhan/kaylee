import React from 'react';
import { X, Upload, Instagram, Youtube, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { FaTiktok } from 'react-icons/fa';
import { useUpdateProfile, useDeleteBrandLogo } from '@/api/apiHooks/useUser';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { getImgUrl, getBrandLogos } from '@/utils/image';
import { handleBackendErrors } from '@/utils/validation';

const EditPortfolioModal = ({ isOpen, onClose, profile, onSave }) => {
  const user = useSelector(selectCurrentUser);
  const updateProfileMutation = useUpdateProfile();
  const deleteBrandLogoMutation = useDeleteBrandLogo();

  const [previewImage, setPreviewImage] = React.useState(
    getImgUrl(profile?.image || profile?.avatar || user?.avatar) || ''
  );
  const [profileFile, setProfileFile] = React.useState(null);
  // existingBrandLogos = logos already on the server (with full URLs)
  const [existingBrandLogos, setExistingBrandLogos] = React.useState([]);
  // newBrandUploads = newly selected local files (blob URLs)
  const [newBrandUploads, setNewBrandUploads] = React.useState([]);
  const [loadingDelete, setLoadingDelete] = React.useState(null);

  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: profile?.name || user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      bio: profile?.bio || user?.shortBio || '',
      services: profile?.services || user?.servicesOffered || '',
      otherLink: profile?.otherLink || '',
      socials: {
        instagram: profile?.socials?.instagram || user?.socialLinks?.instagram || '',
        tiktok: profile?.socials?.tiktok || '',
        youtube: profile?.socials?.youtube || user?.socialLinks?.youtube || '',
      },
    },
  });

  const profileInputRef = React.useRef(null);
  const brandInputRef = React.useRef(null);

  // Reset form when profile or user changes
  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile?.name || user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        bio: profile?.bio || user?.shortBio || '',
        services: profile?.services || user?.servicesOffered || '',
        otherLink: profile?.otherLink || '',
        socials: {
          instagram: profile?.socials?.instagram || user?.socialLinks?.instagram || '',
          tiktok: profile?.socials?.tiktok || '',
          youtube: profile?.socials?.youtube || user?.socialLinks?.youtube || '',
        },
      });
      setPreviewImage(getImgUrl(profile?.image || profile?.avatar || user?.avatar) || '');
      // Load existing brand logos from user data
      setExistingBrandLogos(getBrandLogos(user));
      setNewBrandUploads([]);
    }
  }, [profile, user, reset]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleBrandUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newBrands = files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));
      setNewBrandUploads((prev) => [...prev, ...newBrands]);
    }
  };

  // Remove a NEWLY uploaded brand (local only)
  const removeNewBrand = (idx) => {
    setNewBrandUploads((prev) => prev.filter((_, i) => i !== idx));
  };

  // Delete an EXISTING brand logo from the server using its full URL
  const deleteExistingBrand = (fullUrl) => {
    // Find the matching relative path in the original user.brandLogos
    const brandLogos = user?.brandLogos || [];
    const idx = brandLogos.findIndex((logo) => getImgUrl(logo) === fullUrl);
    if (idx === -1 || !brandLogos[idx]) return;
    setLoadingDelete(idx);
    deleteBrandLogoMutation.mutate(brandLogos[idx], {
      onSuccess: (res) => {
        const updatedLogos = res?.data?.data?.brandLogos || [];
        setExistingBrandLogos(getBrandLogos({ brandLogos: updatedLogos }));
        setLoadingDelete(null);
      },
      onError: () => setLoadingDelete(null),
    });
  };

  const onFormSubmit = (data) => {
    const formPayload = new FormData();

    // Append text fields
    if (data.name) {
      const nameParts = data.name.trim().split(' ');
      formPayload.append('firstName', nameParts[0] || '');
      formPayload.append('lastName', nameParts.slice(1).join(' ') || '');
      // When display name changes, backend automatically updates slug, which will be returned in the response
      formPayload.append('displayName', data.name.trim());
    }
    if (data.services) {
      formPayload.append('servicesOffered', data.services);
    }
    if (data.bio !== undefined) {
      formPayload.append('shortBio', data.bio);
    }

    // Append avatar file
    if (profileFile) {
      formPayload.append('avatar', profileFile);
    }

    // Send the remaining existing brand logo paths (after deletions) as JSON
    const remainingLogos = user?.brandLogos?.filter((_, i) => {
      // Only include logos that haven't been deleted
      return existingBrandLogos.includes(getImgUrl(user.brandLogos[i]));
    }) || [];
    if (remainingLogos.length > 0 || existingBrandLogos.length > 0) {
      formPayload.append('brandLogos', JSON.stringify(remainingLogos));
    }

    // Append new files
    if (newBrandUploads.length > 0) {
      newBrandUploads.forEach(({ file }) => {
        if (file) formPayload.append('brandLogos', file);
      });
    }

    // Build and append socialLinks as JSON
    const socialLinks = {};
    if (data.socials?.instagram) socialLinks.instagram = data.socials.instagram;
    if (data.socials?.tiktok) socialLinks.website = data.socials.tiktok; // map tiktok to website
    if (data.socials?.youtube) socialLinks.youtube = data.socials.youtube;
    if (data.otherLink) socialLinks.other = data.otherLink;
    if (Object.keys(socialLinks).length > 0) {
      formPayload.append('socialLinks', JSON.stringify(socialLinks));
    }

    const customMap = {
      displayName: 'name',
      shortBio: 'bio',
      servicesOffered: 'services',
      'socialLinks.instagram': 'socials.instagram',
      'socialLinks.website': 'socials.tiktok',
      'socialLinks.youtube': 'socials.youtube',
      'socialLinks.other': 'otherLink',
    };

    updateProfileMutation.mutate(formPayload, {
      onSuccess: (res) => {
        const updatedData = res?.data?.data || res?.data;
        if (onSave) {
          onSave({
            ...data,
            slug: updatedData?.slug,
            avatar: updatedData?.avatar,
            servicesOffered: updatedData?.servicesOffered,
            brandLogos: updatedData?.brandLogos,
          });
        }
        onClose();
      },
      onError: (error) => {
        handleBackendErrors(error, setError, customMap);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl md:rounded-[40px] shadow-2xl overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-10 border-b border-gray-50 sticky top-0 bg-white z-10">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Edit Portfolio</h2>
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 md:p-10 space-y-6 md:space-y-8 pb-10">
            {/* Profile Image */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-gray-50 bg-gray-50">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={profileInputRef} 
                className="hidden" 
                onChange={handleProfileImageChange}
                accept="image/*"
              />
              <button 
                type="button" 
                onClick={() => profileInputRef.current?.click()}
                className="flex items-center gap-2 border border-gray-100 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Change profile image
              </button>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Display name</label>
              <input
                {...register('name')}
                type="text"
                className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Short bio</label>
              <textarea
                {...register('bio')}
                rows={2}
                className={`w-full bg-white border ${errors.bio ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] resize-none`}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Services offered</label>
              <textarea
                {...register('services')}
                rows={2}
                placeholder="-Product photography\n-Voiceover\n-Unboxing"
                className={`w-full bg-white border ${errors.services ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] resize-none`}
              />
              {errors.services && <p className="mt-1 text-xs text-red-500">{errors.services.message}</p>}
            </div>

            {/* Brands Upload */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Add brands logo you've worked with</label>
              <input 
                type="file" 
                ref={brandInputRef} 
                className="hidden" 
                onChange={handleBrandUpload}
                accept="image/*"
                multiple
              />
              <div 
                onClick={() => brandInputRef.current?.click()}
                className="border-2 border-dashed border-Primary/20 rounded-2xl md:rounded-[32px] p-6 md:p-10 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-4 md:mb-6"
              >
                <div className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm mb-3 md:mb-4">
                  <Upload className="w-5 h-5 md:w-6 md:h-6 text-Primary" />
                </div>
                <p className="text-xs md:text-sm font-bold text-[#1A1A1A]">Upload media here</p>
              </div>

              {/* Brand Logos Preview — Existing + New */}
              <div className="flex flex-wrap gap-3 md:gap-4">
                {/* Existing brand logos (from server) */}
                {existingBrandLogos.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-100 p-2 bg-white flex items-center justify-center shadow-sm">
                      <img src={url} alt="Brand" className="max-w-full h-auto max-h-full object-contain" loading="lazy" />
                    </div>
                    <button
                      type="button"
                      disabled={loadingDelete === idx}
                      onClick={() => deleteExistingBrand(url)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {loadingDelete === idx ? (
                        <span className="w-3 h-3 block">...</span>
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
                {/* Newly uploaded brands (local) */}
                {newBrandUploads.map((brand, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-100 p-2 bg-white flex items-center justify-center shadow-sm">
                      <img src={brand.url} alt="Brand" className="max-w-full h-auto max-h-full object-contain" loading="lazy" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewBrand(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {/* Empty state */}
              {existingBrandLogos.length === 0 && newBrandUploads.length === 0 && (
                <p className="text-xs text-gray-400 font-medium text-center mt-2">
                  No brand logos yet. Upload your first one above.
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-4 md:space-y-6">
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-4">Social Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A]" />
                    </div>
                    <input
                      {...register('socials.instagram')}
                      type="text"
                      placeholder="@username"
                      className={`flex-1 bg-white border ${errors.socials?.instagram ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm`}
                    />
                  </div>
                  {errors.socials?.instagram && <p className="mt-1 text-xs text-red-500 ml-[52px] md:ml-[60px]">{errors.socials.instagram.message}</p>}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaTiktok className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A]" />
                    </div>
                    <input
                      {...register('socials.tiktok')}
                      type="text"
                      placeholder="@username"
                      className={`flex-1 bg-white border ${errors.socials?.tiktok ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm`}
                    />
                  </div>
                  {errors.socials?.tiktok && <p className="mt-1 text-xs text-red-500 ml-[52px] md:ml-[60px]">{errors.socials.tiktok.message}</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Youtube className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A]" />
                  </div>
                  <input
                    {...register('socials.youtube')}
                    type="text"
                    placeholder="youtube/username"
                    className={`flex-1 bg-white border ${errors.socials?.youtube ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm`}
                  />
                </div>
                {errors.socials?.youtube && <p className="mt-1 text-xs text-red-500 ml-[52px] md:ml-[60px]">{errors.socials.youtube.message}</p>}
              </div>
            </div>

            {/* Other Link */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Other Link</label>
              <input
                {...register('otherLink')}
                type="text"
                placeholder="Paste your link"
                className={`w-full bg-white border ${errors.otherLink ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]`}
              />
              {errors.otherLink && <p className="mt-1 text-xs text-red-500">{errors.otherLink.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 left-0 right-0 pt-6 md:pt-8 bg-white border-t border-gray-50 z-20 -mx-6 md:-mx-10 px-6 md:px-10 pb-6 md:pb-10">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Done"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPortfolioModal;
