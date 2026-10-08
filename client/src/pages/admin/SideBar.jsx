import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, LogOut, BarChart2 } from 'lucide-react';
import { useLogout } from '@/api/apiHooks/useAuth';
import {
  DashboardIcon,
  CampaignIcon,
  PlannerIcon,
  InvoicesIcon,
  PortfolioIcon,
  FAQIcon,
  SettingsIcon
} from '@/components/icons/CustomIcon';
import Logo from "@/assets/images/logo.png";
import SLogo from "@/assets/images/s.png";
import useClient from "@/hooks/useClient";
import { getImgUrl } from "@/utils/image";

const SideBar = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('stakd_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('stakd_sidebar_collapsed', String(next));
      return next;
    });
  };

  const { data: cmsData } = useClient({
    queryKey: ["publicCms"],
    url: "/cms",
    isPrivate: false,
  });

  const cms = cmsData?.data || {};
  const dynamicLogo = cms.system_logo_image ? getImgUrl(cms.system_logo_image) : Logo;
  const logoText = cms.system_logo_text || "STAKD";

  const menuItems = [
    { name: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { name: 'Campaigns', icon: CampaignIcon, path: '/dashboard/campaigns' },
    { name: 'Planner', icon: PlannerIcon, path: '/dashboard/planner' },
    { name: 'Invoices', icon: InvoicesIcon, path: '/dashboard/invoices' },
    { name: 'Portfolio', icon: PortfolioIcon, path: '/dashboard/portfolio' },
    { name: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
  ];

  const bottomItems = [
    { name: 'FAQ', icon: FAQIcon, path: '/dashboard/faq' },
    { name: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
  ];

  const handleNavClick = () => {
    setOpen(false);
  };

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;
    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={handleNavClick}
        title={item.name}
        className={`flex items-center rounded-xl transition-all duration-200 group relative ${isCollapsed
          ? 'justify-center p-3 w-11 h-11 mx-auto'
          : 'gap-3 px-4 py-3'
          } ${isActive
            ? 'bg-Primary text-white shadow-lg shadow-Primary/20'
            : 'text-[#3A3A3A] hover:bg-gray-50 hover:text-Primary'
          }`}
      >
        <IconComponent
          className="w-5 h-5 shrink-0 transition-colors duration-200"
          color={isActive ? '#ffffff' : undefined}
        />
        <span
          className={`font-semibold text-sm whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'hidden' : 'inline'
            }`}
        >
          {item.name}
        </span>
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col h-screen ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-64'
        }`}
    >
      {/* Floating Collapse / Expand Button on right border */}
      <button
        type="button"
        onClick={toggleCollapse}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex absolute -right-3.5 top-7 z-50 w-7 h-7 bg-white border border-gray-200/90 rounded-full items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-Primary cursor-pointer"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-Primary stroke-[2.5]" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-Primary stroke-[2.5]" />
        )}
      </button>

      {/* Logo Section */}
      <div className={`p-5 mb-2 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <Link to="/" onClick={handleNavClick} className="flex items-center justify-center gap-2 w-full h-9">
          {isCollapsed ? (
            <img src={SLogo} alt={logoText} className="h-14 w-14 object-contain" loading="lazy" />
          ) : (
            <img src={dynamicLogo} alt={logoText} className="h-9 w-auto object-contain" loading="lazy" />
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
        {menuItems.map(renderNavItem)}

        <div className="pt-6 pb-3">
          <div className={`h-px bg-gray-100 ${isCollapsed ? 'mx-1' : 'mx-2'}`} />
        </div>

        {bottomItems.map(renderNavItem)}
      </nav>

      {/* Logout Button */}
      <div className={`p-4 mt-auto transition-all overflow-x-hidden ${isCollapsed ? 'flex justify-center p-2 pb-4' : ''}`}>
        {isCollapsed ? (
          <div className="relative">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              title="Log Out"
              className="w-11 h-11 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all cursor-pointer text-sm font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>{logoutMutation.isPending ? 'Logging out...' : 'Log Out'}</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
