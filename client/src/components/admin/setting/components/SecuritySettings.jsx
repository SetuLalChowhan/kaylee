import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { useDeleteAccount } from '@/api/apiHooks/useUser';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

const SecuritySettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteMutation = useDeleteAccount();

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-8">
      <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-4 md:mb-6">Security Settings</h2>
      
      <div className="border-t border-dashed border-gray-100 pt-4 md:pt-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3.5 md:p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">Password</h4>
            <p className="text-xs text-gray-400 font-medium">Manage and update your account password</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-Primary text-white px-5 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-xs font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10 w-full sm:w-auto text-center"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-100 pt-4 md:pt-8 mt-4 md:mt-8">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3.5 md:p-5 bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl">
          <div>
            <h4 className="text-sm font-bold text-[#E53E3E] mb-1">Delete Account</h4>
            <p className="text-xs text-gray-500 font-medium font-semibold">Permanently delete your profile, portfolio items, and all associated data</p>
          </div>
          <button 
            onClick={() => setIsDeleteOpen(true)}
            className="bg-[#E53E3E] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-xs font-bold hover:bg-[#C53030] transition-all w-full sm:w-auto text-center"
          >
            Delete Account
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl z-[1001]"
            >
              <button 
                onClick={() => setIsDeleteOpen(false)}
                className="absolute top-6 right-6 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Delete Account?</h3>
              </div>

              <p className="text-sm text-gray-500 mb-6 leading-relaxed text-left">
                Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data will be permanently deleted. If you wish to use STAKD again, you will need to create a new account by signing up again.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecuritySettings;
