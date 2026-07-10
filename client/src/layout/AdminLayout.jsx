import CommonNavbar from "@/pages/admin/CommonNavbar";
import SideBar from "@/pages/admin/SideBar";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Outlet, ScrollRestoration, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/fetchUserProfile";

const PlatformDemoModal = lazy(() => import("@/components/admin/PlatformDemoModal"));

const AdminLayout = () => {
  const { data: user } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "user" && !user.slug) {
      navigate("/onboarding");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      const hasSeen = localStorage.getItem("hasSeenDemoTour");
      if (!hasSeen) {
        setShowTour(true);
      }
    }
  }, [user]);

  return (
    <>
      <ScrollRestoration />
      <div className="flex min-h-screen w-full bg-white font-outfit">
        {/* Sidebar */}
        <SideBar open={open} setOpen={setOpen} />

        {/* Backdrop for mobile sidebar */}
        {open && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <div className="px-6 lg:px-10">
            <CommonNavbar setOpen={setOpen} />
          </div>

          <main className="flex-1 overflow-y-auto px-4 lg:px-10 pb-10 custom-scrollbar bg-[#FAFAFA] pt-6">
            <Outlet />
          </main>
        </div>
      </div>

      {showTour && (
        <Suspense fallback={null}>
          <PlatformDemoModal 
            isOpen={showTour} 
            onClose={() => setShowTour(false)} 
            user={user} 
          />
        </Suspense>
      )}
    </>
  );
};

export default AdminLayout;
