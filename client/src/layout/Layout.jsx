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
    const hasSeen = localStorage.getItem("hasSeenDemoTour");
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
