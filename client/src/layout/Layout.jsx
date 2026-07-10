import React, { useState, useEffect, lazy, Suspense } from "react";
import Footer from "@/shared/footer/Footer";
import Navbar from "@/shared/navbar/Navbar";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useUserProfile } from "@/hooks/fetchUserProfile";

const PlatformDemoModal = lazy(() => import("@/components/admin/PlatformDemoModal"));

const Layout = () => {
  const { data: user } = useUserProfile();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeen = localStorage.getItem("hasSeenDemoTour");
      if (!hasSeen) {
        setShowTour(true);
      }
    } else {
      setShowTour(false);
    }
  }, [user]);

  return (
    <>
      <ScrollRestoration />
      <Navbar />
      <Outlet />
      <Footer />
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

export default Layout;
