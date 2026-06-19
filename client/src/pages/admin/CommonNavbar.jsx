import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, User as UserIcon, Settings, LogOut, CheckCircle, Clock, MessageSquare, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useLogout } from '@/api/apiHooks/useAuth';
import { getImgUrl } from '@/utils/image';

const CommonNavbar = ({ setOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const logoutMutation = useLogout();

  const displayName =
    user?.displayName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'User';

  const avatarUrl = getImgUrl(user?.avatar) || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop';

  const dummyNotifications = [
    {
      id: 1,
      title: 'Campaign Approved',
      description: 'Your Nike UGC Shoot campaign has been approved.',
      time: '2 mins ago',
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      id: 2,
      title: 'New Feedback',
      description: 'Brand left a comment on your skincare video.',
      time: '1 hour ago',
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      id: 3,
      title: 'Payment Received',
      description: 'Invoice #INV-001 has been paid.',
      time: '3 hours ago',
      icon: DollarSign,
      color: 'text-Primary',
      bg: 'bg-Primary/10'
    },
    {
      id: 4,
      title: 'Deadline Approaching',
      description: 'Coffee Brand Reel is due in 24 hours.',
      time: '5 hours ago',
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logoutMutation.mutate();
  };

  return (
    <header className="flex items-center justify-between w-full h-20 px-4 md:px-0">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-md relative">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-Primary transition-colors" />
          <input
            type="text"
            placeholder="Search your campaigns, planners etc..."
            className="w-full bg-[#F8FAFC] border border-transparent focus:border-Primary/30 focus:bg-white focus:outline-none rounded-2xl py-3 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder:text-gray-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className={`relative p-2.5 border rounded-xl transition-all group shadow-sm ${isNotificationsOpen ? 'bg-Primary border-Primary text-white' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
          >
            <Bell className={`w-5 h-5 ${isNotificationsOpen ? 'text-white' : 'group-hover:text-Primary transition-colors'}`} />
            {!isNotificationsOpen && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-gray-100 rounded-[32px] shadow-2xl z-20 py-6 overflow-hidden"
                >
                  <div className="px-6 pb-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#1A1A1A]">Notifications</h3>
                    <span className="text-[10px] font-bold text-Primary bg-Primary/10 px-2 py-1 rounded-full uppercase tracking-wider">4 New</span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {dummyNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 group"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-[#1A1A1A] mb-0.5">{notif.title}</h4>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-1">{notif.description}</p>
                          <span className="text-[10px] font-bold text-gray-300 uppercase">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 pt-4 text-center">
                    <button className="text-xs font-bold text-Primary hover:underline underline-offset-4">View All Notifications</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-white">
              <img
                src={avatarUrl}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#1A1A1A]">{displayName}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                >
                  <button
                    onClick={() => handleNavigate('/dashboard/portfolio')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-Primary transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('/dashboard/settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-Primary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                  <div className="h-px bg-gray-50 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50/50 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{logoutMutation.isPending ? 'Logging out...' : 'Log Out'}</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default CommonNavbar;
