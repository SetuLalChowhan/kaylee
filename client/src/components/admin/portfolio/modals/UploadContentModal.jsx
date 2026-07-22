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

  // Reset form only when modal is closed (i.e. after successful upload)
  useEffect(() => {
    if (!isOpen) {
      reset();
      setPreview(null);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data) => {
    onUpload({ ...data, file: data.file[0] });
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
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-gray-100"
        >
          {/* Header */}
          <div className="p-6 md:p-8 pb-4 bg-white relative z-20">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pr-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">Upload Content</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Upload images or videos for your creator portfolio.</p>
              <div className="w-full border-b border-gray-100 mt-4" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 custom-scrollbar">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-Primary/20 rounded-2xl aspect-square md:aspect-auto md:min-h-[240px] flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group relative overflow-hidden">
                {!preview ? (
                  <>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      {...register('file', { required: true })}
                      accept="image/*,video/*"
                    />
                    <div className="p-3 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform border border-gray-100">
                      <CloudUpload className="w-7 h-7 text-Primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1A1A1A] mb-1">Drag & drop files here</p>
                      <p className="text-xs text-gray-400 mb-2 italic">or</p>
                      <span className="text-Primary text-sm font-bold underline decoration-2 underline-offset-4">Choose files</span>
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
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all z-20"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  placeholder="Give your content a title"
                  className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all text-sm text-[#1A1A1A] placeholder-gray-400 font-medium ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.title && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.title.message}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-Primary text-white px-6 py-3 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-Primary/90 shadow-lg shadow-Primary/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Uploading..." : "Upload Media"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadContentModal;
