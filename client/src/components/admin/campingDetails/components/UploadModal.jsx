import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const UploadModal = ({ isOpen, files, onClose, onUpload }) => {
  const [captions, setCaptions] = useState({});
  const [titles, setTitles] = useState({});
  const [assetTypes, setAssetTypes] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setCaptions({});
      setTitles({});
      setErrors({});
      const initialAssetTypes = {};
      files.forEach(f => { initialAssetTypes[f.name] = ''; });
      setAssetTypes(initialAssetTypes);
    }
  }, [isOpen, files]);

  const handleUpload = () => {
    const newErrors = {};
    let hasError = false;
    files.forEach(f => {
      if (!assetTypes[f.name]) {
        newErrors[f.name] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      toast.error("Please select an asset category for all content.");
      return;
    }

    const uploadDataList = files.map(f => ({
      file: f,
      title: titles[f.name] || f.name,
      description: captions[f.name] || '',
      assetType: assetTypes[f.name]
    }));

    onUpload(uploadDataList);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="caption-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[800px] bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-100 z-10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative pr-10 mb-8 text-left border-b border-slate-100 pb-5">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">Add Content Details</h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1.5 leading-relaxed">Provide details to help the brand understand and categorize your media deliverables.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {files.map((file) => (
                <div key={file.name} className="flex flex-col sm:flex-row items-start gap-6 py-6 first:pt-0 last:pb-2">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-200 shadow-md">
                    {file.type === 'video' ? (
                      <video src={file.url} className="w-full h-full object-cover" muted preload="metadata" />
                    ) : (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                    )}
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 text-xs font-bold bg-[#0F172A]/90 backdrop-blur-sm text-white rounded-lg uppercase tracking-wider">
                      {file.type === 'video' ? 'Video' : 'Image'}
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-5 text-left">
                    <div>
                      <p className="text-base sm:text-lg font-bold text-[#0F172A] truncate w-full max-w-[360px]" title={file.name}>
                        {file.name}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        File Title <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 'PRODUCT HERO SHOT'"
                        value={titles[file.name] || ''}
                        onChange={(e) => setTitles(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        Asset Category <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={assetTypes[file.name] || ''}
                          onChange={(e) => {
                            setAssetTypes(prev => ({ ...prev, [file.name]: e.target.value }));
                            if (e.target.value) {
                              setErrors(prev => {
                                const next = { ...prev };
                                delete next[file.name];
                                return next;
                              });
                            }
                          }}
                          className={`w-full bg-slate-50/70 border rounded-xl py-2.5 pl-3.5 pr-10 text-sm cursor-pointer focus:bg-white focus:outline-none transition-all appearance-none ${errors[file.name]
                              ? 'border-red-500 bg-red-50/10 focus:border-red-500'
                              : 'border-slate-200 focus:border-Primary focus:ring-2 focus:ring-Primary/10'
                            } ${!assetTypes[file.name] ? 'text-slate-400 font-medium' : 'text-[#0F172A] font-semibold'}`}
                        >
                          <option value="" disabled className="text-slate-400 bg-white">Select Asset Category...</option>
                          <option value="Video" className="text-black bg-white">Video</option>
                          <option value="Raw Footage" className="text-black bg-white">Raw Footage</option>
                          <option value="B-Roll" className="text-black bg-white">B-Roll</option>
                          <option value="Photo" className="text-black bg-white">Photo</option>
                          <option value="Graphic" className="text-black bg-white">Graphic</option>
                          <option value="Other" className="text-black bg-white">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {errors[file.name] && (
                        <motion.p
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"
                        >
                          <span>⚠ Category selection is required</span>
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                        Description <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 'Behind the scenes shot with product', etc."
                        value={captions[file.name] || ''}
                        onChange={(e) => setCaptions(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-Primary focus:ring-2 focus:ring-Primary/10 focus:outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="bg-Primary text-white px-6 py-3 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-Primary/90 shadow-lg shadow-Primary/20 transition-all cursor-pointer"
              >
                Upload Content
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
