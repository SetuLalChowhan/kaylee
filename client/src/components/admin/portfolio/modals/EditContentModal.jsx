import React from 'react';
import { X, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const EditContentModal = ({ isOpen, onClose, content, onUpdate, isPending, uploadProgress }) => {
  const [previewUrl, setPreviewUrl] = React.useState(content?.url);
  const [previewType, setPreviewType] = React.useState(content?.type || 'image');
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (content) {
      reset({ title: content.title });
      setPreviewUrl(content.url);
      setPreviewType(content.type || 'image');
    }
  }, [content, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      if (type === 'image' && file.size > 50 * 1024 * 1024) {
        toast.error("Image file size exceeds the 50MB limit.");
        e.target.value = '';
        return;
      }
      if (type === 'video' && file.size > 500 * 1024 * 1024) {
        toast.error("Video file size exceeds the 500MB limit.");
        e.target.value = '';
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewType(type);
      setValue('newFile', file); // For console log
    }
  };

  const onFormSubmit = (data) => {
    console.log('Update Content Data:', { ...data, id: content.id, type: previewType });
    onUpdate({ ...data, type: previewType, url: previewUrl });
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
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Edit Content</h2>
            <button 
              onClick={onClose}
              disabled={isPending}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 disabled:opacity-50"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 md:space-y-8">
            {/* Media Preview */}
            <div className="relative rounded-2xl md:rounded-[32px] overflow-hidden group bg-gray-50 border border-gray-100 aspect-square">
              {previewType === 'video' ? (
                <video 
                  src={previewUrl} 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img src={previewUrl} 
                  alt="Content Preview" 
                  className="w-full h-full object-cover"
                loading="lazy" />
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-4 bg-white rounded-full text-[#1A1A1A] hover:bg-gray-50 transition-all shadow-2xl z-20 border border-gray-100 disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2 md:mb-3">Title</label>
              <input
                {...register('title')}
                type="text"
                className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
              />
            </div>

            {/* Progress Bar Display */}
            {isPending && (
              <div className="bg-Primary/5 border border-Primary/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                  <span className="flex items-center gap-2 text-Primary">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Updating media...
                  </span>
                  <span className="text-Primary font-black">{uploadProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-Primary via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${uploadProgress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-Primary text-white py-3 md:py-5 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Updating ({uploadProgress || 0}%)
                </>
              ) : (
                "Update"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditContentModal;
