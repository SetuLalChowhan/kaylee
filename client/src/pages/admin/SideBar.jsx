import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
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
  ];

  const bottomItems = [
    { name: 'FAQ', icon: FAQIcon, path: '/dashboard/faq' },
    { name: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
  ];

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleUpgrade = () => {
    navigate('/dashboard/settings?tab=Subscription');
    setOpen(false);
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;
    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={handleNavClick}
        title={isCollapsed ? item.name : undefined}
        className={`flex items-center rounded-xl transition-all duration-200 group relative ${
          isCollapsed
            ? 'justify-center p-3 w-11 h-11 mx-auto'
            : 'gap-3 px-4 py-3'
        } ${
          isActive
            ? 'bg-Primary text-white shadow-lg shadow-Primary/20'
            : 'text-[#3A3A3A] hover:bg-gray-50 hover:text-Primary'
        }`}
      >
        <IconComponent
          className="w-5 h-5 shrink-0 transition-colors duration-200"
          color={isActive ? '#ffffff' : undefined}
        />
        <span
          className={`font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
            isCollapsed ? 'hidden' : 'inline'
          }`}
        >
          {item.name}
        </span>

        {/* Desktop Tooltip in collapsed mode */}
        {isCollapsed && (
          <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-xl items-center">
            {item.name}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col h-screen ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-64'
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
      <div className={`p-5 mb-2 flex items-center transition-all ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2">
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary font-black text-lg shadow-xs hover:bg-Primary/15 transition-colors">
              {logoText.charAt(0)}
            </div>
          ) : (
            <img src={dynamicLogo} alt={logoText} className="h-9 w-auto object-contain" loading="lazy" />
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar py-2">
        {menuItems.map(renderNavItem)}

        <div className="pt-6 pb-3">
          <div className={`h-px bg-gray-100 ${isCollapsed ? 'mx-1' : 'mx-2'}`} />
        </div>

        {bottomItems.map(renderNavItem)}
      </nav>

      {/* Upgrade Card */}
      <div className={`p-4 mt-auto transition-all ${isCollapsed ? 'flex justify-center p-2 pb-4' : ''}`}>
        {isCollapsed ? (
          <div className="relative group">
            <button
              onClick={handleUpgrade}
              title="Upgrade Plan"
              className="w-11 h-11 bg-Primary/10 hover:bg-Primary text-Primary hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-xl items-center">
              Upgrade Plan
            </div>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] rounded-2xl p-4 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-[#1A1A1A] font-bold text-sm mb-1">Upgrade Plan</h4>
              <p className="text-gray-500 text-[11px] mb-3 leading-relaxed">
                Unlock more features to grow faster
              </p>
              <button 
                onClick={handleUpgrade}
                className="w-full bg-[#1A1A1A] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
              >
                Upgrade Plan <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-Primary/5 rounded-full blur-xl group-hover:bg-Primary/10 transition-colors" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
