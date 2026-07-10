import React, { useState, useEffect, lazy, Suspense } from "react";
import Footer from "@/shared/footer/Footer";
import Navbar from "@/shared/navbar/Navbar";
import { Outlet, ScrollRestoration } from "react-router-dom";

const PlatformDemoModal = lazy(() => import("@/components/admin/PlatformDemoModal"));

const Layout = () => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenDemoTour");
    if (!hasSeen) {
      setShowTour(true);
    }
  }, []);

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
          />
        </Suspense>
      )}
    </>
  );
};

export default Layout;
