import React, { useState, useEffect } from "react";
import Footer from "@/shared/footer/Footer";
import Navbar from "@/shared/navbar/Navbar";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useUserProfile } from "@/hooks/fetchUserProfile";
import PlatformDemoModal from "@/components/admin/PlatformDemoModal";

const Layout = () => {
  const { data: user } = useUserProfile();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourKey = user?.id
      ? `hasSeenDemoTour_${user.id}`
      : "hasSeenDemoTour_guest";
    const hasSeen = localStorage.getItem(tourKey);
    if (!hasSeen) {
      setShowTour(true);
    }
  }, [user]);

  return (
    <>
      <ScrollRestoration />
      <Navbar />
      <Outlet />
      <Footer />
      <PlatformDemoModal 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
        user={user} 
      />
    </>
  );
};

export default Layout;
