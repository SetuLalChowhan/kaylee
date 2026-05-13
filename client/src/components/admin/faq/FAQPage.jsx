import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import FAQItem from './components/FAQItem';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: "GETTING STARTED",
      items: [
        {
          question: "What is STAKD?",
          answer: "STAKD is a workspace where you manage your brand deals in one place. You can organize campaigns, upload content, share review links with brands, and track approvals without switching between tools."
        },
        {
          question: "How do I get started?",
          answer: "Sign up for an account, complete your onboarding profile, and you can start creating your first campaign immediately."
        },
        {
          question: "Do brands need an account to view my work?",
          answer: "No, brands can view your shared review links without needing to create an account, making the approval process seamless."
        }
      ]
    },
    {
      category: "CAMPAIGNS & WORKFLOW",
      items: [
        {
          question: "What is a campaign?",
          answer: "A campaign is a workspace for a single brand deal. It includes your deliverables, files, deadlines, and approvals all in one place."
        },
        {
          question: "Can I manage multiple campaigns at once?",
          answer: "Yes, STAKD is designed to handle multiple active campaigns simultaneously with a centralized dashboard."
        },
        {
          question: "Can I edit a campaign after creating it?",
          answer: "Absolutely. You can update deliverables, change dates, and add new media at any stage of the process."
        },
        {
          question: "Does STAKD create deals with brands?",
          answer: "STAKD is a management tool for your existing deals. We provide the infrastructure to professionalize your workflow once a deal is secured."
        }
      ]
    },
    {
      category: "BRAND REVIEW",
      items: [
        {
          question: "What can brands do on the review page?",
          answer: "Brands can view content, leave comments, request changes, and approve deliverables directly through the shared link."
        },
        {
          question: "Can brands download my content before approval?",
          answer: "You have control over download permissions. By default, content is view-only until you enable high-res downloads."
        },
        {
          question: "What happens after approval?",
          answer: "Once a brand approves a deliverable, it is marked as completed, and you can proceed with the final delivery or invoicing."
        }
      ]
    },
    {
      category: "BILLING & SUBSCRIPTION",
      items: [
        {
          question: "Do I need a subscription to use STAKD?",
          answer: "Yes. You can start with the free plan, which includes limited access to core features so you can try the platform."
        },
        {
          question: "What's included in the free plan?",
          answer: "The free plan typically includes management for a limited number of active campaigns and basic storage."
        },
        {
          question: "When do I need to upgrade?",
          answer: "You should upgrade when you need unlimited campaigns, more storage, or advanced features like custom branding."
        },
        {
          question: "What happens if I don't upgrade?",
          answer: "Your account will remain on the free tier, and you may hit limits on active campaigns or storage capacity."
        },
        {
          question: "Can I upgrade anytime?",
          answer: "Yes, you can upgrade or change your plan at any time through the billing settings."
        },
        {
          question: "Do I lose my data if I upgrade later?",
          answer: "No, all your data and existing campaigns are preserved when you switch between plans."
        }
      ]
    }
  ];

  return (
    <div className="py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">FAQ</h1>
          <p className="text-gray-400 text-sm font-medium">Everything you need to know about STAKD and other information.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your questions.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 focus:border-Primary focus:outline-none transition-all text-sm"
            />
          </div>
          <button className="bg-Primary text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20">
            Search
          </button>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="lg:space-y-8 space-y-4">
        {faqData.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <h2 className="text-sm font-bold text-Primary uppercase tracking-tight ml-2">
              {section.category}
            </h2>
            <div className="space-y-0">
              {section.items.map((item, itemIdx) => (
                <FAQItem
                  key={itemIdx}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;