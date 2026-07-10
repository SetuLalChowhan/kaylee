import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useClient from '@/hooks/useClient';

// Professional humanized SVG step icons
const WelcomeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
    <circle cx="32" cy="32" r="32" fill="#EEF4FF"/>
    <path d="M20 44c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="32" cy="24" r="7" stroke="#3B82F6" strokeWidth="2.5"/>
    <path d="M40 18l3-3M43 22h3M40 30l3 3" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CampaignIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
    <circle cx="32" cy="32" r="32" fill="#ECFDF5"/>
    <rect x="16" y="18" width="32" height="28" rx="4" stroke="#10B981" strokeWidth="2.5"/>
    <path d="M22 26h20M22 32h14M22 38h10" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="44" cy="42" r="6" fill="#10B981"/>
    <path d="M41 42l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlannerIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
    <circle cx="32" cy="32" r="32" fill="#F5F3FF"/>
    <rect x="15" y="20" width="34" height="28" rx="4" stroke="#8B5CF6" strokeWidth="2.5"/>
    <path d="M15 27h34" stroke="#8B5CF6" strokeWidth="2.5"/>
    <path d="M23 16v8M41 16v8" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="21" y="32" width="6" height="6" rx="1.5" fill="#C4B5FD"/>
    <rect x="31" y="32" width="6" height="6" rx="1.5" fill="#8B5CF6"/>
    <rect x="21" y="41" width="6" height="3" rx="1.5" fill="#C4B5FD"/>
    <rect x="31" y="41" width="10" height="3" rx="1.5" fill="#C4B5FD"/>
  </svg>
);

const InvoiceIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
    <circle cx="32" cy="32" r="32" fill="#FFFBEB"/>
    <rect x="18" y="14" width="28" height="36" rx="3" stroke="#F59E0B" strokeWidth="2.5"/>
    <path d="M25 24h14M25 30h10M25 36h12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M32 38v6M29 42l3 3 3-3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PortfolioIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
    <circle cx="32" cy="32" r="32" fill="#FFF1F2"/>
    <rect x="14" y="20" width="36" height="24" rx="4" stroke="#F43F5E" strokeWidth="2.5"/>
    <circle cx="24" cy="30" r="4" stroke="#F43F5E" strokeWidth="2.5"/>
    <path d="M14 40l9-8 6 5 5-4 10 7" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 48h12M32 44v4" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const PlatformDemoModal = ({ isOpen, onClose, user }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const { data: cmsData } = useClient({
    queryKey: ["publicCms"],
    url: "/cms",
    isPrivate: false,
  });

  const logoText = cmsData?.data?.system_logo_text || "STAKD";

  if (!isOpen) return null;

  const steps = [
    {
      title: `Welcome to ${logoText}`,
      description: "The all-in-one workspace built for UGC creators. Let's take a quick tour of how to manage your entire creator business from one clean dashboard.",
      icon: <WelcomeIcon />,
      gradient: "from-[#005BD6] to-[#0047A5]",
      accentColor: "bg-[#005BD6]/10 text-[#005BD6]",
      features: [
        "Manage all your brand campaigns in one place",
        "Generate professional invoices & track earnings",
        "Build a stunning public creator portfolio page"
      ]
    },
    {
      title: "Campaign Management",
      description: "Track deliverables, share review links, and collect brand feedback all in one clean timeline. No more scattered email threads.",
      icon: <CampaignIcon />,
      gradient: "from-[#005BD6] to-[#0047A5]",
      accentColor: "bg-[#005BD6]/10 text-[#005BD6]",
      features: [
        "Create brand campaigns with deadlines and budgets",
        "Upload draft videos and documents for client review",
        "Receive inline feedback directly from brands"
      ]
    },
    {
      title: "Planner & Calendar",
      description: "Visualize your content delivery pipeline month-by-month. Stay ahead of every deadline with structured task management.",
      icon: <PlannerIcon />,
      gradient: "from-[#005BD6] to-[#0047A5]",
      accentColor: "bg-[#005BD6]/10 text-[#005BD6]",
      features: [
        "Monthly calendar view of all campaign milestones",
        "Create and assign checklist tasks per campaign",
        "Never miss a delivery date or brand deadline again"
      ]
    },
    {
      title: "Invoices & Payments",
      description: "Generate professional invoices, record what you've been paid, and download Stripe receipts in a click.",
      icon: <InvoiceIcon />,
      gradient: "from-[#005BD6] to-[#0047A5]",
      accentColor: "bg-[#005BD6]/10 text-[#005BD6]",
      features: [
        "Create and send branded invoice PDFs to clients",
        "Track completed and pending payment records",
        "Download Stripe invoice receipts instantly"
      ]
    },
    {
      title: "Creator Portfolio",
      description: "A beautiful public-facing profile page showcasing your niche, past work, and rates — built to impress brands and win new clients.",
      icon: <PortfolioIcon />,
      gradient: "from-[#005BD6] to-[#0047A5]",
      accentColor: "bg-[#005BD6]/10 text-[#005BD6]",
      features: [
        "Showcase UGC reels, photos, and brand work",
        "List services, niches, pricing, and social links",
        "Share a unique creator URL to attract brand deals"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenDemoTour", "true");
    onClose();
  };

  const activeStep = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          key={currentStep}
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100"
        >
          {/* Header gradient strip */}
          <div className={`bg-gradient-to-r ${activeStep.gradient} px-8 pt-8 pb-10`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                Platform Tour · {currentStep + 1}/{steps.length}
              </span>
              <button
                onClick={handleComplete}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-5">
              <div className="bg-white rounded-2xl p-3 shadow-lg flex-shrink-0">
                {activeStep.icon}
              </div>
              <h2 className="text-white text-xl font-bold leading-snug tracking-tight">
                {activeStep.title}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {activeStep.description}
            </p>

            <div className="space-y-3 mb-8">
              {activeStep.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${activeStep.accentColor}`}>
                    ✓
                  </span>
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between">
              {/* Dot stepper */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentStep ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComplete}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors cursor-pointer px-2 py-1"
                >
                  Skip
                </button>
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`bg-gradient-to-r ${activeStep.gradient} text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all text-sm cursor-pointer`}
                >
                  {isLast ? "Get Started" : "Next"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlatformDemoModal;
