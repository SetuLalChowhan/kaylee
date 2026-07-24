import React, { useState, useMemo } from 'react';
import { Bell, ChevronDown, Menu, User as UserIcon, Settings, LogOut, CheckCircle, Clock, MessageSquare, DollarSign, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useLogout } from '@/api/apiHooks/useAuth';
import { getImgUrl } from '@/utils/image';
import { useNotifications, useMarkAsSeen, useMarkAllAsSeen, useDeleteNotification } from '@/api/apiHooks/useNotification';
import { useDashboardStats } from '@/api/apiHooks/useUser';

const getGreeting = (name = 'Kaylee') => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning ${name}!`;
  if (hour >= 12 && hour < 17) return `Good afternoon ${name}!`;
  return `Good evening ${name}!`;
};

const CommonNavbar = ({ setOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const logoutMutation = useLogout();

  // Notifications API hooks
  const { data: notifications = [] } = useNotifications();
  const markAsSeenMutation = useMarkAsSeen();
  const markAllAsSeenMutation = useMarkAllAsSeen();
  const deleteNotifMutation = useDeleteNotification();

  const unseenCount = notifications.filter(n => !n.isSeen).length;

  const displayName =
    user?.displayName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'User';

  const avatarUrl = getImgUrl(user?.avatar) || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop';

  const handleNavigate = (path) => {
    navigate(path);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logoutMutation.mutate();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CAMPAIGN':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' };
      case 'FEEDBACK':
        return { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'PAYMENT':
        return { icon: DollarSign, color: 'text-Primary', bg: 'bg-Primary/10' };
      case 'DEADLINE':
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' };
      default:
        return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const formatTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };
  const welcomeName = user?.firstName || user?.displayName || 'Kaylee';
  const greeting = useMemo(() => getGreeting(welcomeName), [welcomeName]);
  const { data: dashboardData, isLoading: isDashLoading } = useDashboardStats();

  const weekSubtitle = useMemo(() => {
    const now = new Date();
    // Start of today (midnight local)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // End of this week Sunday midnight
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(startOfToday.getDate() + (7 - startOfToday.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // Use rawDate (ISO date string stored on server) — d.date is display string like "Mon, Jul 21"
    const weekCampaigns = (dashboardData?.deadlines || []).filter(d => {
      const raw = d.rawDate || d.date;
      if (!raw) return false;
      const dd = new Date(raw);
      if (isNaN(dd.getTime())) return false;
      return dd >= startOfToday && dd <= endOfWeek;
    }).length;

    // Tasks: rawDate is the actual date, t.date is display string
    const weekTasks = (dashboardData?.tasks || []).filter(t => {
      if (t.completed) return false;
      const raw = t.rawDate || t.date;
      if (!raw) return false;
      const td = new Date(raw);
      if (isNaN(td.getTime())) return false;
      return td >= startOfToday && td <= endOfWeek;
    }).length;

    const parts = [];
    if (weekCampaigns > 0) parts.push(`${weekCampaigns} campaign${weekCampaigns !== 1 ? 's' : ''} due`);
    if (weekTasks > 0) parts.push(`${weekTasks} task${weekTasks !== 1 ? 's' : ''} to meet`);
    if (isDashLoading) return 'Loading your week...';
    if (parts.length === 0) return 'You are up to date';
    return `You have ${parts.join(' and ')} this week`;
  }, [dashboardData, isDashLoading]);

  return (
    <header className="flex items-center justify-between w-full h-20 ">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-md relative">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden mr-4  hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between md:gap-4 gap-2.5  ">
          <div>
            <h1 className="lg:text-xl text-base font-semibold text-[#1A1A1A] mb-1.5 md:mb-2">{greeting}</h1>
            <p className="text-gray-500 text-xs md:text-sm font-medium">{weekSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-2 lg:gap-6">
        {/* Notifications Icon with Unseen Count Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 border border-gray-100 rounded-xl transition-all group shadow-sm bg-white text-gray-500 hover:bg-gray-50"
          >
            <Bell className="w-5 h-5 group-hover:text-Primary transition-colors" />
            {unseenCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {unseenCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
            }}
          >
            {user?.avatar ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-white">
                <img src={avatarUrl}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  loading="lazy" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-Primary/10 flex items-center justify-center text-Primary font-extrabold text-sm ring-2 ring-white select-none">
                {(displayName || 'U')[0].toUpperCase()}
              </div>
            )}
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

      {/* Notifications Modal overlay */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-20">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Notifications</h3>
                  {unseenCount > 0 && (
                    <p className="text-xs text-gray-400 font-medium mt-1">You have {unseenCount} unread notification{unseenCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {unseenCount > 0 && (
                    <button
                      onClick={() => markAllAsSeenMutation.mutate()}
                      className="text-xs font-bold text-Primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 bg-white"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <Bell className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm font-bold">All caught up! No notifications.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const style = getNotificationIcon(notif.type);
                    const Icon = style.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${notif.isSeen ? 'bg-white border-gray-50' : 'bg-Primary/[0.02] border-Primary/10 shadow-sm'}`}
                      >
                        <div className={`p-2.5 rounded-xl ${style.bg} ${style.color} flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-bold text-[#1A1A1A] leading-tight ${notif.isSeen ? 'font-semibold text-gray-700' : 'font-extrabold'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-bold text-gray-300 uppercase whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1 mb-2">
                            {notif.description}
                          </p>
                          <div className="flex items-center gap-3">
                            {!notif.isSeen && (
                              <button
                                onClick={() => markAsSeenMutation.mutate(notif.id)}
                                className="text-[11px] font-bold text-Primary hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotifMutation.mutate(notif.id)}
                              className="text-[11px] font-bold text-red-400 hover:text-red-500 transition-colors ml-auto flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default CommonNavbar;
