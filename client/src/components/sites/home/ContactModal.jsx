import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useCreateContact } from '@/api/apiHooks/useContact';

const ContactModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createContactMutation = useCreateContact();

  const onSubmit = (data) => {
    createContactMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal content card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-6 md:p-10 z-20 flex flex-col font-urbanist"
        >
          {/* Header */}
          <div className="pr-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Contact Us</h2>
            <p className="text-gray-500 text-sm md:text-base mt-1.5 font-medium">We'd love to hear from you</p>
          </div>

          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-7 h-7 border border-gray-100 rounded-full p-1.5 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center" />
          </button>

          {/* Dashed Line */}
          <div className="w-full border-b border-dashed border-gray-200/80 my-6" />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First & Last Name row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">First Name</label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  placeholder="Enter your first name"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-Primary/20 focus:border-Primary transition-all text-[#1A1A1A] placeholder:text-gray-400/90 ${
                    errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-[#E6E6E6]'
                  }`}
                />
                {errors.firstName && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Last Name</label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  placeholder="Enter your last name"
                  className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-Primary/20 focus:border-Primary transition-all text-[#1A1A1A] placeholder:text-gray-400/90 ${
                    errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-[#E6E6E6]'
                  }`}
                />
                {errors.lastName && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-Primary/20 focus:border-Primary transition-all text-[#1A1A1A] placeholder:text-gray-400/90 ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-[#E6E6E6]'
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            {/* Message input */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Message</label>
              <textarea
                {...register('message', { required: 'Message is required' })}
                placeholder="Write your message..."
                rows={5}
                className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-Primary/20 focus:border-Primary transition-all text-[#1A1A1A] resize-none placeholder:text-gray-400/90 ${
                  errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-[#E6E6E6]'
                }`}
              />
              {errors.message && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{errors.message.message}</p>}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 bg-gray-50 text-slate-600 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createContactMutation.isPending}
                className="px-6 py-3.5 bg-Primary hover:bg-Primary/95 text-white font-bold rounded-xl shadow-lg shadow-Primary/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createContactMutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
