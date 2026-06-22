import CommonNavbar from "@/pages/admin/CommonNavbar";
import SideBar from "@/pages/admin/SideBar";

import React, { useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUsers, FaBullhorn, FaListCheck, FaFileInvoiceDollar, FaCreditCard } from "react-icons/fa6";
import { FaRegEdit, FaHistory, FaQuestionCircle } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { useUserProfile } from "@/hooks/fetchUserProfile";

const AdminLayout = () => {
  useUserProfile();
  const [Open, setOpen] = useState(false);

  const sideBar = [
    {
      id: 1,
      icon: <MdDashboard />,
      text: "Dashboard",
      path: "/dashboard",
      activePaths: ["/dashboard"],
      sublink: false,
    },
    {
      id: 2,
      icon: <FaUsers />,
      text: "Users",
      path: "/dashboard/users",
      activePaths: ["/dashboard/users"],
      sublink: false,
    },
    {
      id: 3,
      icon: <FaBullhorn />,
      text: "Campaigns",
      path: "/dashboard/campaigns",
      activePaths: ["/dashboard/campaigns"],
      sublink: false,
    },
    {
      id: 4,
      icon: <FaListCheck />,
      text: "Tasks",
      path: "/dashboard/tasks",
      activePaths: ["/dashboard/tasks"],
      sublink: false,
    },
    {
      id: 5,
      icon: <FaFileInvoiceDollar />,
      text: "Invoices",
      path: "/dashboard/invoices",
      activePaths: ["/dashboard/invoices"],
      sublink: false,
    },
    {
      id: 6,
      icon: <FaRegEdit />,
      text: "CMS Editor",
      path: "/dashboard/cms",
      activePaths: ["/dashboard/cms"],
      sublink: false,
    },
    {
      id: 7,
      icon: <FaQuestionCircle />,
      text: "FAQ Control",
      path: "/dashboard/faq",
      activePaths: ["/dashboard/faq"],
      sublink: false,
    },
    {
      id: 8,
      icon: <IoSettingsOutline />,
      text: "Settings",
      path: "/dashboard/settings",
      activePaths: ["/dashboard/settings"],
      sublink: false,
    },
    {
      id: 9,
      icon: <FaCreditCard />,
      text: "Plans",
      path: "/dashboard/plans",
      activePaths: ["/dashboard/plans"],
      sublink: false,
    },
    {
      id: 10,
      icon: <FaHistory />,
      text: "Payment History",
      path: "/dashboard/payments",
      activePaths: ["/dashboard/payments"],
      sublink: false,
    },
  ];
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);
  return (
    <>
      <ScrollRestoration />
      <div className="flex min-h-screen w-full bg-white font-outfit">
        {/* Sidebar */}
        <SideBar open={Open} setOpen={setOpen} sidebar={sideBar} />

        {/* Backdrop for mobile sidebar */}
        {Open && (
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
    </>
  );
};

export default AdminLayout;
