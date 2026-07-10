import React, { useState, useEffect } from "react";
import { Menu, LogOut, User as UserIcon, ChevronDown, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectIsAuthenticated, selectCurrentUser } from "@/redux/slices/authSlice";
import { useLogout } from "@/api/apiHooks/useAuth";
import { getImgUrl } from "@/utils/image";
import Logo from "@/assets/images/logo.png";
import useClient from "@/hooks/useClient";
import NavLinks from "./NavLinks";
import MobileNavbar from "./MobileNavbar";
import { motion } from "motion/react";
import CommonButton from "@/components/ui/CommonButton";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cmsData } = useClient({
    queryKey: ["publicCms"],
    url: "/cms",
    isPrivate: false,
  });

  const cms = cmsData?.data || {};
  const dynamicLogo = cms.system_logo_image ? getImgUrl(cms.system_logo_image) : Logo;
  const logoText = cms.system_logo_text || "STAKD";
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Background change on scroll
      setIsScrolled(currentScrollY > 20);

      // Hide/Show logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const avatarUrl = getImgUrl(user?.avatar) || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className=" section-padding px-4 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="cursor-pointer"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.location.href = '/';
              }
            }}
          >
            <div className="h-7 lg:h-9 flex items-center justify-center">
              <img src={dynamicLogo} alt={logoText} className="max-h-full w-auto object-contain" />
            </div>
          </motion.div>

          {/* Desktop Nav Links */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block"
          >
            <NavLinks className="gap-8 xl:gap-12" />
          </motion.div>

          {/* Desktop Buttons - Auth Aware */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex items-center gap-3"
          >
            {isAuthenticated ? (
              <div className="relative">
                <div
                  className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user?.avatar ? (
                    <img
                      src={avatarUrl}
                      alt="User Profile"
                      className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-md bg-Primary/10 flex items-center justify-center text-Primary font-extrabold text-sm ring-2 ring-white select-none">
                      {(user?.displayName || user?.firstName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:flex items-center gap-1">
                    <span className="text-sm font-bold text-[#1A1A1A] max-w-[120px] truncate">
                      {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-black text-gray-800 truncate">
                          {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-Primary transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        <span>My Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/dashboard/portfolio');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-Primary transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>My Profile</span>
                      </button>

                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logoutMutation.mutate();
                        }}
                        disabled={logoutMutation.isPending}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50/50 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>{logoutMutation.isPending ? 'Logging out...' : 'Log Out'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <CommonButton
                  type="link"
                  path="/login"
                  className="px-6 xl:px-8 py-2.5 bg-Primary text-white font-semibold rounded-xl hover:bg-Primary/90 shadow-md shadow-Primary/20 text-sm xl:text-base"
                >
                  Login
                </CommonButton>
                <CommonButton
                  type="link"
                  path="/signup"
                  className="px-6 xl:px-8 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-100 hover:bg-gray-50 shadow-sm text-sm xl:text-base"
                >
                  Start Free trail
                </CommonButton>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Navbar Component (Outside of hide/show nav) */}
      <MobileNavbar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </>
  );
};

export default Navbar;
