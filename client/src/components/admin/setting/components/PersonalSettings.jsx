import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useUpdateProfile } from '@/api/apiHooks/useUser';
import { getImgUrl } from '@/utils/image';

const PersonalSettings = () => {
  const user = useSelector(selectCurrentUser);
  const updateProfileMutation = useUpdateProfile();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(getImgUrl(user?.avatar) || '');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      displayName: user?.displayName || '',
      shortBio: user?.shortBio || '',
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        displayName: user?.displayName || '',
        shortBio: user?.shortBio || '',
      });
      setAvatarPreview(getImgUrl(user?.avatar) || '');
    }
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formPayload = new FormData();
    formPayload.append('firstName', data.firstName);
    formPayload.append('lastName', data.lastName);

    if (avatarFile) {
      formPayload.append('avatar', avatarFile);
    }

    updateProfileMutation.mutate(formPayload);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-8">
      <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-4 md:mb-6">Personal Information</h2>
      
      <div className="border-t border-dashed border-gray-100 pt-4 md:pt-8 mb-4 md:mb-8">
        {/* Avatar Upload */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden group cursor-pointer mb-4 md:mb-8">
          {avatarPreview ? (
            <img src={avatarPreview}
              alt="Profile"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Camera className="w-8 h-8" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white mb-1" />
            <span className="text-[10px] text-white font-bold">Update photo</span>
          </div>
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-1.5 md:mb-2">First Name</label>
              <input
                {...register('firstName')}
                type="text"
                placeholder="Enter your first name"
                className="w-full bg-white border border-gray-100 rounded-lg md:rounded-xl py-2.5 px-3.5 md:py-3.5 md:px-5 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-xs md:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Last Name</label>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Enter your last name"
                className="w-full bg-white border border-gray-100 rounded-lg md:rounded-xl py-2.5 px-3.5 md:py-3.5 md:px-5 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-xs md:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              disabled
              placeholder="Enter your email"
              className="w-full bg-gray-50 border border-gray-100 rounded-lg md:rounded-xl py-2.5 px-3.5 md:py-3.5 md:px-5 text-gray-400 text-xs md:text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Display Name</label>
            <input
              {...register('displayName')}
              type="text"
              placeholder="Your creator display name"
              className="w-full bg-white border border-gray-100 rounded-lg md:rounded-xl py-2.5 px-3.5 md:py-3.5 md:px-5 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-xs md:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Short Bio</label>
            <textarea
              {...register('shortBio')}
              rows={3}
              placeholder="Tell brands about yourself"
              className="w-full bg-white border border-gray-100 rounded-lg md:rounded-xl py-2.5 px-3.5 md:py-3.5 md:px-5 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] text-xs md:text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 md:pt-4">
            <button
              type="button"
              className="px-5 md:px-6 py-2 md:py-2.5 bg-gray-50 text-gray-500 rounded-lg md:rounded-xl font-bold hover:bg-gray-100 transition-all text-xs md:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-6 md:px-8 py-2 md:py-2.5 bg-Primary text-white rounded-lg md:rounded-xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalSettings;
