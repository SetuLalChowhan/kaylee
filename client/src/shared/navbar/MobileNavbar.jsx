import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import NavLinks from './NavLinks';
import Logo from "@/assets/images/logo.png";
import CommonButton from '@/components/ui/CommonButton';
import { useNavigate } from 'react-router-dom';

const MobileNavbar = ({ isOpen, onClose, isAuthenticated = false, user = null }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-[400px] bg-white z-[999] p-6 shadow-2xl flex flex-col backdrop-blur-none"
          >
            <div className="flex items-center justify-between mb-10">
              <img src={Logo} alt="STAKD Logo" className="h-8 w-auto" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1">
              <NavLinks className="flex-col gap-6" onItemClick={onClose} />
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              {isAuthenticated ? (
                <CommonButton 
                  type="link"
                  path="/dashboard"
                  className="w-full py-4 px-6 bg-Primary text-white font-semibold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20"
                >
                  Dashboard
                </CommonButton>
              ) : (
                <>
                  <CommonButton 
                    type="link"
                    path="/login"
                    className="w-full py-4 px-6 bg-Primary text-white font-semibold rounded-xl hover:bg-Primary/90 shadow-lg shadow-Primary/20"
                  >
                    Login
                  </CommonButton>
                  <CommonButton 
                    type="link"
                    path="/signup"
                    className="w-full py-4 px-6 text-gray-700 bg-white border border-gray-100 font-semibold rounded-xl hover:bg-gray-50 shadow-sm"
                  >
                    Start Free trail
                  </CommonButton>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavbar;
