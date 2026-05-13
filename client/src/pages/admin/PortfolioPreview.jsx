import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PreviewHeader from '../../components/admin/portfolio/preview/PreviewHeader';
import PreviewInfoSection from '../../components/admin/portfolio/preview/PreviewInfoSection';
import PreviewMediaGrid from '../../components/admin/portfolio/preview/PreviewMediaGrid';
import natureVideo from '@/assets/videos/nature.mp4';

const PortfolioPreview = ({ onClose }) => {
  const navigate = useNavigate();
  const [previewItem, setPreviewItem] = useState(null);

  // Data (In a real app, this would come from a context or API)
  const profile = {
    name: 'Maya Johnson',
    niche: 'Lifestyle',
    bio: 'UGC creator crafting honest, conversion-ready content for lifestyle and beauty brands.',
    portfolioLink: 'https://stakd.co/portfolio/mayajohnson',
    services: '-Product photography\n-Voiceover\n-Unboxing',
    brands: [
      'https://api.iconify.design/logos:nike.svg',
      'https://api.iconify.design/logos:adidas-icon.svg',
      'https://api.iconify.design/logos:puma.svg',
      'https://api.iconify.design/logos:starbucks.svg'
    ],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
  };

  const mediaItems = [
    { id: 1, title: 'Nike shoe Promotion', date: 'Apr 25.2026', type: 'image', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { id: 2, title: 'Summer Skincare Promo', date: 'May 06.2025', type: 'video', url: natureVideo },
    { id: 3, title: 'Brand Lifestyle Shoot', date: 'Jun 12.2025', type: 'image', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
    { id: 4, title: 'Product Unboxing', date: 'Jul 20.2025', type: 'video', url: natureVideo },
    { id: 5, title: 'Morning Routine Reel', date: 'Aug 15.2025', type: 'image', url: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?q=80&w=600&auto=format&fit=crop' },
    { id: 6, title: 'Coffee Brand Ad', date: 'Sep 02.2025', type: 'video', url: natureVideo },
    { id: 7, title: 'Travel Essentials', date: 'Oct 10.2025', type: 'image', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop' },
    { id: 8, title: 'Fitness Gear Showcase', date: 'Nov 05.2025', type: 'video', url: natureVideo },
  ];

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
          onClick={() => navigate(-1)}
          className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] bg-white border border-gray-100 text-[#1A1A1A] p-2 md:p-3 rounded-full hover:bg-Primary hover:text-white transition-all shadow-xl group backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      <PreviewHeader profile={profile} />
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
              <div className="rounded-2xl overflow-hidden bg-black">
                {previewItem.type === 'video' ? (
                  <video src={natureVideo} className="w-full max-h-[80vh]" controls autoPlay />
                ) : (
                  <img src={previewItem.url} alt={previewItem.title} className="w-full max-h-[80vh] object-contain" />
                )}
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
