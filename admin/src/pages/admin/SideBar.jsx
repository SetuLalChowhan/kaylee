import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { setUser } from "@/redux/slices/uiSlice";
import Logo from "@/assets/images/logo.png";

const SideBar = ({ sidebar, open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeParentIndex, setActiveParentIndex] = useState(null);

  useEffect(() => {
    sidebar.forEach((item, index) => {
      if (item.sublink) {
        const activeSub = item.sublink.find(
          (sub) => sub.path === location.pathname
        );
        if (activeSub) {
          setActiveParentIndex(index);
        }
      }
    });
  }, [location.pathname, sidebar]);

  const isActive = (paths) => {
    if (!paths) return false;
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.includes(location.pathname);
  };

  const isParentActive = (item) => {
    if (!item.sublink) return isActive(item.path);
    return item.sublink.some((sub) => isActive(sub.path));
  };

  const toggleSubmenu = (index) => {
    setActiveParentIndex((prev) => (prev === index ? null : index));
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    dispatch(setUser({ user: null }));
    navigate("/");
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col h-screen font-outfit`}
      >
        {/* Logo Section */}
        <Link to="/dashboard" className="p-8 mb-4 flex items-center gap-2" onClick={handleNavClick}>
          <img src={Logo} alt="STAKD Logo" className="h-10 w-auto" />
          <span className="text-[10px] font-extrabold uppercase bg-Primary/10 text-Primary px-2 py-0.5 rounded-md tracking-wider">
            Admin
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar py-4">
          {sidebar?.map((item, index) => {
            const parentActive = isParentActive(item);
            return !item?.sublink ? (
              <Link
                key={index}
                to={item?.path}
                onClick={() => {
                  setActiveParentIndex(null);
                  handleNavClick();
                }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive(item?.activePaths)
                    ? "bg-Primary text-white shadow-lg shadow-Primary/20"
                    : "text-[#3A3A3A] hover:bg-slate-50 hover:text-Primary"
                }`}
              >
                <span className="text-xl transition-colors duration-300">{item?.icon}</span>
                <span className="font-semibold text-sm">{item?.text}</span>
              </Link>
            ) : (
              <div className="relative" key={index}>
                {/* Parent link */}
                <div
                  className={`flex items-center justify-between px-4 py-3.5 cursor-pointer w-full rounded-xl transition-all duration-300 ${
                    parentActive
                      ? "bg-slate-100 text-Primary font-bold"
                      : "text-[#3A3A3A] hover:bg-slate-50 hover:text-Primary"
                  }`}
                  onClick={() => toggleSubmenu(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item?.icon}</span>
                    <span className="font-semibold text-sm">{item?.text}</span>
                  </div>
                  <span
                    className={`transform transition-transform duration-300 ${
                      activeParentIndex === index ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <MdKeyboardArrowDown size={20} />
                  </span>
                </div>

                {/* Sublinks dropdown */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden px-4 bg-slate-50/50 rounded-xl mt-1 ${
                    activeParentIndex === index
                      ? "max-h-[500px] py-3 opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    {item?.sublink?.map((value, subIndex) => (
                      <Link
                        key={subIndex}
                        to={value?.path}
                        className={`block px-4 py-2 rounded-lg transition-colors duration-300 text-xs font-semibold ${
                          isActive(value?.path)
                            ? "text-Primary bg-Primary/5 font-bold"
                            : "text-[#5A5C5F] hover:text-Primary"
                        }`}
                        onClick={handleNavClick}
                      >
                        {value?.text}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-white py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm"
          >
            <IoLogOutOutline className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
