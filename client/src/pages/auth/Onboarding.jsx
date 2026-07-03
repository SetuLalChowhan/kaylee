import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Instagram, Youtube, Link as LinkIcon, Upload, User, Globe } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { motion } from 'motion/react';
import CommonButton from '@/components/ui/CommonButton';
import AuthInput from '@/components/ui/AuthInput';
import { toast } from 'react-toastify';
import { useCompleteOnboarding } from '@/api/apiHooks/useUser';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { getImgUrl } from '@/utils/image';
import { handleBackendErrors } from '@/utils/validation';

const Onboarding = () => {
  const navigate = useNavigate();
  const onboardingMutation = useCompleteOnboarding();
  const user = useSelector(selectCurrentUser);
  
  const { register, handleSubmit, setError, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      bio: user?.shortBio || '',
      otherLink: user?.socialLinks?.other || '',
      socials: {
        instagram: user?.socialLinks?.instagram || '',
        tiktok: user?.socialLinks?.website || '',
        youtube: user?.socialLinks?.youtube || '',
      }
    }
  });

  const [profileImage, setProfileImage] = useState(user?.avatar ? getImgUrl(user.avatar) : null);
  const [profileFile, setProfileFile] = useState(null);

  // Sync form values and avatar preview when redux user changes
  useEffect(() => {
    if (user) {
      reset({
        displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        bio: user?.shortBio || '',
        otherLink: user?.socialLinks?.other || '',
        socials: {
          instagram: user?.socialLinks?.instagram || '',
          tiktok: user?.socialLinks?.website || '',
          youtube: user?.socialLinks?.youtube || '',
        }
      });
      if (user.avatar) {
        setProfileImage(getImgUrl(user.avatar));
      }
    }
  }, [user, reset]);

  // Watch all fields for live preview
  const formData = watch();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatSocialUrl = (platform, value) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.includes('.')) {
      return `https://${trimmed}`;
    }

    const cleanValue = trimmed.replace(/^@/, '');
    if (platform === 'instagram') {
      return `https://instagram.com/${cleanValue}`;
    }
    if (platform === 'tiktok') {
      return `https://tiktok.com/@${cleanValue}`;
    }
    if (platform === 'youtube') {
      return `https://youtube.com/@${cleanValue}`;
    }

    return `https://${trimmed}`;
  };

  const onSubmit = (data) => {
    const formPayload = new FormData();
    formPayload.append('displayName', data.displayName);
    formPayload.append('shortBio', data.bio);

    const socialLinks = {};
    if (data.socials?.instagram) socialLinks.instagram = formatSocialUrl('instagram', data.socials.instagram);
    if (data.socials?.tiktok) socialLinks.website = formatSocialUrl('tiktok', data.socials.tiktok);
    if (data.socials?.youtube) socialLinks.youtube = formatSocialUrl('youtube', data.socials.youtube);
    if (data.otherLink) socialLinks.other = formatSocialUrl('other', data.otherLink);
    formPayload.append('socialLinks', JSON.stringify(socialLinks));

    if (profileFile) {
      formPayload.append('avatar', profileFile);
    }

    onboardingMutation.mutate(formPayload, {
      onSuccess: () => {
        toast.success("Profile setup complete! Welcome to your dashboard.");
        navigate('/dashboard');
      },
      onError: (error) => {
        handleBackendErrors(error, setError);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 items-start">
          
          {/* Left Side: Live Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-12">
            <h3 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-6 text-center lg:text-left">Live Preview</h3>
            
            <motion.div 
              layout
              className="bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              {/* Card Banner */}
              <div className="h-20 sm:h-28 md:h-32 bg-gradient-to-r from-Primary to-Primary/60" />
              
              <div className="px-4 sm:px-8 pb-6 sm:pb-10 -mt-10 sm:-mt-12 relative">
                {/* Profile Image Preview */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md mb-3 sm:mb-6">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-6 h-6 sm:w-10 sm:h-10" />
                    </div>
                  )}
                </div>

                <h2 className="text-lg sm:text-2xl font-bold text-[#1A1A1A] mb-1">
                  {formData.displayName || 'Display Name'}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-Primary mb-2 sm:mb-4">
                  @{((formData.displayName || '').toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "")) || 'username'}
                </p>
                <p className="text-gray-600 text-xs sm:text-base leading-relaxed mb-3 sm:mb-6">
                  {formData.bio || 'Tell brands about yourself...'}
                </p>

                {/* Social Badges Preview */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Instagram className={`w-4 h-4 md:w-5 md:h-5 ${formData.socials?.instagram ? 'text-Primary' : 'text-gray-300'}`} />
                  <Globe className={`w-4 h-4 md:w-5 md:h-5 ${formData.socials?.tiktok ? 'text-Primary' : 'text-gray-300'}`} />
                  <Youtube className={`w-4 h-4 md:w-5 md:h-5 ${formData.socials?.youtube ? 'text-Primary' : 'text-gray-300'}`} />
                  <LinkIcon className={`w-4 h-4 md:w-5 md:h-5 ${formData.otherLink ? 'text-Primary' : 'text-gray-300'}`} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-4 sm:p-8 lg:p-12 rounded-2xl md:rounded-[40px] shadow-sm border border-gray-100">
              <div className="mb-6 md:mb-10 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-[36px] font-bold text-[#1A1A1A] mb-2 leading-tight">Create your STAKD Media Card</h2>
                <p className="text-[#666] text-xs sm:text-sm lg:text-base">This is how brands discover and remember you.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Image Upload Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 md:mb-10">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-Primary/30 bg-Primary/5 flex items-center justify-center relative overflow-hidden shrink-0">
                    {profileImage ? (
                      <img src={profileImage} alt="Upload Preview" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User className="w-8 h-8 text-Primary" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-all">
                      <Upload className="w-4 h-4" />
                      Upload profile image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <AuthInput 
                  label="Display name"
                  name="displayName"
                  placeholder="Your creator name"
                  register={register}
                  error={errors.displayName}
                  required
                />
                
                <div className="mb-5">
                  <label className="block text-[#1A1A1A] text-xs sm:text-sm font-semibold mb-2">Short bio <span className="text-red-500">*</span></label>
                  <textarea 
                    {...register("bio", { required: "Short bio is required" })}
                    placeholder="Tell brands about yourself..."
                    className={`w-full px-4 py-3 bg-white border ${errors.bio ? 'border-red-500' : 'border-[#E6E6E6]'} rounded-xl text-xs sm:text-sm focus:outline-none focus:border-Primary h-24 resize-none transition-all`}
                  />
                  {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
                </div>

                {/* Social Links */}
                <div className="space-y-4 md:space-y-6 mb-6">
                  <label className="block text-[#1A1A1A] text-xs sm:text-sm font-semibold mb-2">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Instagram className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A]" />
                        </div>
                        <input
                          {...register('socials.instagram')}
                          type="text"
                          placeholder="https://instagram.com/username"
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
                          placeholder="https://tiktok.com/@username"
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
                        placeholder="https://youtube.com/@username"
                        className={`flex-1 bg-white border ${errors.socials?.youtube ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm`}
                      />
                    </div>
                    {errors.socials?.youtube && <p className="mt-1 text-xs text-red-500 ml-[52px] md:ml-[60px]">{errors.socials.youtube.message}</p>}
                  </div>
                </div>

                {/* Other Link */}
                <div className="mb-5">
                  <label className="block text-[#1A1A1A] text-xs sm:text-sm font-semibold mb-2">Other Link</label>
                  <input
                    {...register('otherLink')}
                    type="text"
                    placeholder="https://example.com"
                    className={`w-full bg-white border ${errors.otherLink ? 'border-red-500' : 'border-gray-100'} rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] mb-2`}
                  />
                  <p className="text-[10px] text-gray-400 font-semibold mb-2">
                    E.g., https://example.com or example.com (prefix is added automatically)
                  </p>
                  {errors.otherLink && <p className="mt-1 text-xs text-red-500">{errors.otherLink.message}</p>}
                </div>

                <div className="mt-8 md:mt-12">
                  <CommonButton 
                    type="submit"
                    disabled={onboardingMutation.isPending}
                    className="w-full py-3.5 md:py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {onboardingMutation.isPending ? "Creating workspace..." : "Create my Workspace"}
                  </CommonButton>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
