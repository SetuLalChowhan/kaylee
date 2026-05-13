import React from 'react';
import { X, Upload, Instagram, Youtube, Link as LinkIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { FaTiktok } from 'react-icons/fa';

const EditPortfolioModal = ({ isOpen, onClose, profile, onSave }) => {
  const [previewImage, setPreviewImage] = React.useState(profile.image);
  const [uploadedBrands, setUploadedBrands] = React.useState([]); // Start empty as requested
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...profile,
      brands: [] // Reset brands to empty initially
    }
  });

  const profileInputRef = React.useRef(null);
  const brandInputRef = React.useRef(null);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setValue('profileImage', file); // For console log
    }
  };

  const handleBrandUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newBrands = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setUploadedBrands(prev => [...prev, ...newBrands]);
    }
  };

  const removeBrand = (idx) => {
    setUploadedBrands(prev => prev.filter((_, i) => i !== idx));
  };

  const onFormSubmit = (data) => {
    const finalData = {
      ...data,
      uploadedBrands: uploadedBrands.map(b => b.file.name)
    };
    console.log('Final Portfolio Data:', finalData);
    onSave(data);
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
          <div className="flex items-center justify-between p-6 md:p-10 border-b border-gray-50 sticky top-0 bg-white z-10">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Edit Portfolio</h2>
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 md:p-10 space-y-6 md:space-y-8 pb-10">
            {/* Profile Image */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-gray-50 bg-gray-50">
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* Display Name */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Display name</label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
                />
              </div>

              {/* Niche */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Niche</label>
                <input
                  {...register('niche')}
                  type="text"
                  className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Short bio</label>
              <textarea
                {...register('bio')}
                rows={2}
                className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] resize-none"
              />
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Services offered</label>
              <textarea
                {...register('services')}
                rows={2}
                placeholder="-Product photography\n-Voiceover\n-Unboxing"
                className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] resize-none"
              />
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

              {/* Uploaded Brands Preview */}
              <div className="flex flex-wrap gap-3 md:gap-4">
                {uploadedBrands.map((brand, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-100 p-2 bg-white flex items-center justify-center shadow-sm">
                      <img src={brand.url} alt="Brand" className="max-w-full h-auto" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeBrand(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 md:space-y-6">
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-4">Social Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A]" />
                  </div>
                  <input
                    {...register('socials.instagram')}
                    type="text"
                    placeholder="@username"
                    className="flex-1 bg-white border border-gray-100 rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaTiktok className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A]" />
                  </div>
                  <input
                    {...register('socials.tiktok')}
                    type="text"
                    placeholder="@username"
                    className="flex-1 bg-white border border-gray-100 rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Youtube className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A1A]" />
                </div>
                <input
                  {...register('socials.youtube')}
                  type="text"
                  placeholder="youtube/username"
                  className="flex-1 bg-white border border-gray-100 rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 focus:border-Primary focus:outline-none text-xs md:text-sm"
                />
              </div>
            </div>

            {/* Other Link */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Other Link</label>
              <input
                {...register('otherLink')}
                type="text"
                placeholder="Paste your link"
                className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
              />
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-0 left-0 right-0 pt-6 md:pt-8 bg-white border-t border-gray-50 z-20 -mx-6 md:-mx-10 px-6 md:px-10 pb-6 md:pb-10">
              <button
                type="submit"
                className="w-full bg-Primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm"
              >
                Done
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPortfolioModal;
