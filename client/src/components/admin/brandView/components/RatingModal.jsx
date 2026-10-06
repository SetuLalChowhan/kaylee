import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, onSubmit, isPending, creatorName = "the creator" }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6 pt-2">
          <div className="w-14 h-14 bg-yellow-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Rate {creatorName}</h3>
          <p className="text-sm text-gray-500">
            How was your experience working with {creatorName}? Your feedback helps them improve.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
            >
              <Star
                className={`w-9 h-9 transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-100'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
            Leave a note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tell us what you loved..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-Primary focus:ring-1 focus:ring-Primary transition-colors resize-none h-24"
          />
        </div>

        <button
          onClick={() => onSubmit({ rating, ratingNote: note })}
          disabled={rating === 0 || isPending}
          className="w-full bg-Primary text-white font-bold rounded-xl py-3.5 hover:bg-Primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,132,255,0.2)]"
        >
          {isPending ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
