import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useChangePassword } from '@/api/apiHooks/useUser';
import { PASSWORD_RULES, CONFIRM_PASSWORD_RULES } from '@/utils/validation';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const changePasswordMutation = useChangePassword();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const onSubmit = (data) => {
    changePasswordMutation.mutate(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const newPassword = watch('newPassword');

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
          className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 z-10 bg-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-Primary/5 rounded-2xl flex items-center justify-center text-Primary mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Change Password</h2>
            <p className="text-sm text-gray-400 font-medium mt-2">Secure your account with a strong password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Old Password</label>
              <input
                {...register('oldPassword', { required: 'Required' })}
                type="password"
                placeholder="Enter old password"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-sm"
              />
              {errors.oldPassword && (
                <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2">{errors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">New Password</label>
              <input
                {...register('newPassword', PASSWORD_RULES)}
                type="password"
                placeholder="Enter new password"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-sm"
              />
              {errors.newPassword && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Confirm Password</label>
              <input
                {...register('confirmPassword', CONFIRM_PASSWORD_RULES(newPassword))}
                type="password"
                placeholder="Confirm new password"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-sm"
              />
              {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full bg-Primary text-white py-4 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
