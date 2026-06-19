import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Instagram, Youtube, Link as LinkIcon, Upload, User, Globe } from 'lucide-react';
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
      instagram: user?.socialLinks?.instagram || '',
      tiktok: user?.socialLinks?.website || '',
      youtube: user?.socialLinks?.youtube || '',
      otherLink: user?.socialLinks?.other || ''
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
        instagram: user?.socialLinks?.instagram || '',
        tiktok: user?.socialLinks?.website || '',
        youtube: user?.socialLinks?.youtube || '',
        otherLink: user?.socialLinks?.other || ''
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

  const onSubmit = (data) => {
    // Build FormData for file upload
    const formPayload = new FormData();
    formPayload.append('displayName', data.displayName);
    formPayload.append('shortBio', data.bio);

    // Build socialLinks object (backend schema: { instagram, website, youtube, other })
    const socialLinks = {};
    if (data.instagram) socialLinks.instagram = data.instagram;
    if (data.tiktok) socialLinks.website = data.tiktok; // map tiktok to website field
    if (data.youtube) socialLinks.youtube = data.youtube;
    if (data.otherLink) socialLinks.other = data.otherLink;
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
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Live Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-12">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">Live Preview</h3>
            
            <motion.div 
              layout
              className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              {/* Card Banner */}
              <div className="h-32 bg-gradient-to-r from-Primary to-Primary/60" />
              
              <div className="px-8 pb-10 -mt-12 relative">
                {/* Profile Image Preview */}
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md mb-6">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>

                 <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">
                  {formData.displayName || 'Display Name'}
                </h2>
                <p className="text-sm font-bold text-Primary mb-4">
                  @{((formData.displayName || '').toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "")) || 'username'}
                </p>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  {formData.bio || 'Tell brands about yourself...'}
                </p>

                {/* Social Badges Preview */}
                <div className="flex flex-wrap gap-4">
                  <Instagram className={`w-5 h-5 ${formData.instagram ? 'text-Primary' : 'text-gray-300'}`} />
                  <Globe className={`w-5 h-5 ${formData.otherLink ? 'text-Primary' : 'text-gray-300'}`} />
                  <Youtube className={`w-5 h-5 ${formData.youtube ? 'text-Primary' : 'text-gray-300'}`} />
                  <LinkIcon className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 lg:p-12 rounded-[40px] shadow-sm border border-gray-100">
              <div className="mb-10">
                <h2 className="text-[28px] lg:text-[36px] font-bold text-[#1A1A1A] mb-2">Create your STAKD Media Card</h2>
                <p className="text-[#666] text-sm lg:text-base">This is how brands discover and remember you.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Image Upload Section */}
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-Primary/30 bg-Primary/5 flex items-center justify-center relative overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Upload Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-Primary" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-all">
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
                  <label className="block text-[#1A1A1A] text-sm font-semibold mb-2">Short bio <span className="text-red-500">*</span></label>
                  <textarea 
                    {...register("bio", { required: "Short bio is required" })}
                    placeholder="Tell brands about yourself..."
                    className={`w-full px-4 py-3.5 bg-white border ${errors.bio ? 'border-red-500' : 'border-[#E6E6E6]'} rounded-xl text-sm focus:outline-none focus:border-Primary h-24 resize-none transition-all`}
                  />
                  {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
                </div>

                {/* Social Links */}
                <div className="mb-8">
                  <label className="block text-[#1A1A1A] text-sm font-semibold mb-4">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="mb-1">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Instagram className="w-5 h-5" />
                        </div>
                        <input 
                          {...register("instagram")}
                          placeholder="@username"
                          className={`w-full pl-12 pr-4 py-3.5 bg-white border ${errors.instagram ? 'border-red-500' : 'border-[#E6E6E6]'} rounded-xl text-sm focus:outline-none focus:border-Primary transition-all`}
                        />
                      </div>
                      {errors.instagram && <p className="mt-1 text-xs text-red-500">{errors.instagram.message}</p>}
                    </div>
                    <div className="mb-1">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Globe className="w-5 h-5" />
                        </div>
                        <input 
                          {...register("tiktok")}
                          placeholder="@username"
                          className={`w-full pl-12 pr-4 py-3.5 bg-white border ${errors.tiktok ? 'border-red-500' : 'border-[#E6E6E6]'} rounded-xl text-sm focus:outline-none focus:border-Primary transition-all`}
                        />
                      </div>
                      {errors.tiktok && <p className="mt-1 text-xs text-red-500">{errors.tiktok.message}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <input 
                        {...register("youtube")}
                        placeholder="URL link here"
                        className={`w-full pl-12 pr-4 py-3.5 bg-white border ${errors.youtube ? 'border-red-500' : 'border-[#E6E6E6]'} rounded-xl text-sm focus:outline-none focus:border-Primary transition-all`}
                      />
                    </div>
                    {errors.youtube && <p className="mt-1 text-xs text-red-500">{errors.youtube.message}</p>}
                  </div>
                </div>

                <AuthInput 
                  label="Other Link"
                  name="otherLink"
                  placeholder="URL link here"
                  register={register}
                  error={errors.otherLink}
                />

                <div className="mt-12">
                  <CommonButton 
                    type="submit"
                    disabled={onboardingMutation.isPending}
                    className="w-full py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
