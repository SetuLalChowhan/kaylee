import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
            ? 'bg-Primary text-white shadow-lg shadow-Primary/20'
            : 'text-[#3A3A3A] hover:bg-gray-50 hover:text-Primary'
          }`}
      >
        <IconComponent
          className="w-5 h-5 transition-colors duration-300"
          color={isActive ? '#ffffff' : undefined}
        />
        <span className="font-semibold text-sm">{item.name}</span>
      </NavLink>
    );
  };

  return (
    <aside className={`fixed lg:sticky top-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transition-transform duration-300 transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col h-screen`}>
      {/* Logo Section */}
      <Link to="/" className="p-8 mb-4" onClick={handleNavClick}>
        <img src={dynamicLogo} alt={logoText} className="h-10 w-auto object-contain" loading="lazy" />
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-4">
        {menuItems.map(renderNavItem)}

        <div className="pt-8 pb-4">
          <div className="h-px bg-gray-100 mx-4" />
        </div>

        {bottomItems.map(renderNavItem)}
      </nav>

      {/* Upgrade Card */}
      <div className="p-6 mt-auto">
        <div className="bg-[#F8FAFC] rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-[#1A1A1A] font-bold text-base mb-1">Upgrade Plan</h4>
            <p className="text-gray-500 text-xs mb-4 leading-relaxed">
              Unlock more features to grow faster
            </p>
            <button 
              onClick={handleUpgrade}
              className="w-full bg-[#1A1A1A] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              Upgrade Plan <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-Primary/5 rounded-full blur-2xl group-hover:bg-Primary/10 transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
