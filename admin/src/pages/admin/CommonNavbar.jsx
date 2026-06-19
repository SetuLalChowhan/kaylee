import React, { useState } from "react";
import { Search, ChevronDown, Menu, User as UserIcon, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { setUser } from "@/redux/slices/uiSlice";

const CommonNavbar = ({ setOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.ui.user);

  const displayName =
    user?.displayName ||
    `${user?.firstName || "System"} ${user?.lastName || "Admin"}`.trim();

  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(clearAuth());
    dispatch(setUser({ user: null }));
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between w-full h-20 px-4 md:px-0 font-outfit">
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-md relative">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>

        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-Primary transition-colors" />
          <input
            type="text"
            placeholder="Search campaigns, planners, users..."
            className="w-full bg-[#F8FAFC] border border-transparent focus:border-Primary/30 focus:bg-white focus:outline-none rounded-2xl py-3 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder:text-slate-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Profile Dropdown */}
        <div className="relative">
          <div
            className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
            }}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-Primary/5 flex items-center justify-center text-Primary font-extrabold text-sm border-2 border-white ring-2 ring-slate-100/50">
              {displayName[0].toUpperCase()}
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#1A1A1A]">{displayName}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
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
                  className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-Primary transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </button>
                  <div className="h-px bg-slate-50 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
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
