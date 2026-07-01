import React, { useState, useEffect } from 'react';
import { X, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const UploadContentModal = ({ isOpen, onClose, onUpload, isPending }) => {
  const [preview, setPreview] = useState(null);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  
  const selectedFile = watch('file');

  useEffect(() => {
    if (selectedFile && selectedFile[0]) {
      const file = selectedFile[0];
      const type = file.type.startsWith('video') ? 'video' : 'image';
      
      if (type === 'image' && file.size > 20 * 1024 * 1024) {
        toast.error("Image file size exceeds the 20MB limit.");
        reset({ file: null });
        setPreview(null);
        return;
      }
      if (type === 'video' && file.size > 100 * 1024 * 1024) {
        toast.error("Video file size exceeds the 100MB limit.");
        reset({ file: null });
        setPreview(null);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview({ url, type });
    } else {
      setPreview(null);
    }
  }, [selectedFile, reset]);

  const handleFormSubmit = (data) => {
    onUpload({ ...data, file: data.file[0] });
    reset();
    setPreview(null);
  };

  const clearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    reset({ file: null });
    setPreview(null);
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
          className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[40px] shadow-2xl p-4 md:p-10"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Upload Content</h2>
            <button 
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 md:space-y-8">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-Primary/20 rounded-2xl md:rounded-[32px] aspect-square md:aspect-auto md:min-h-[300px] flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group relative overflow-hidden">
              {!preview ? (
                <>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    {...register('file', { required: true })}
                    accept="image/*,video/*"
                  />
                  <div className="p-3 md:p-4 bg-white rounded-xl md:rounded-[24px] shadow-sm mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-6 h-6 md:w-8 md:h-8 text-Primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm md:text-base font-bold text-[#1A1A1A] mb-1">Drag & drop files here</p>
                    <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 italic">or</p>
                    <span className="text-Primary text-sm md:text-base font-bold underline decoration-2 underline-offset-4">Choose files</span>
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full">
                  {preview.type === 'video' ? (
                    <video src={preview.url} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={preview.url} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                  )}
                  <button 
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all z-20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Title</label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                placeholder="Give your content title"
                className={`w-full bg-white border rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] placeholder:text-gray-300 ${errors.title ? 'border-red-500' : 'border-gray-100'}`}
              />
              {errors.title && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.title.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-Primary text-white py-3 md:py-5 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Uploading..." : "Upload"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadContentModal;
