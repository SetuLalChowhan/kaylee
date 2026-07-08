import React from "react";
import useSEO from "@/hooks/useSEO";
import { ShieldAlert } from "lucide-react";

const AcceptableUsePolicy = () => {
  useSEO({
    title: "Acceptable Use Policy | STAKD",
    description: "Acceptable Use Policy detailing rules and responsibilities for using the STAKD creator platform.",
    keywords: "acceptable use policy, stakd policy, creator responsibilities"
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-urbanist">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-12 rounded-[24px] shadow-sm shadow-slate-100">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-Primary tracking-wider uppercase">Legal & Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Acceptable Use Policy</h1>
              <p className="text-sm text-gray-500 font-semibold mt-1">Effective Date: 7 July 2026</p>
            </div>
          </div>

          {/* Subtitle */}
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">STAKD Technologies Pty Ltd</p>
          </div>

          {/* Sections */}
          <div className="text-slate-600 leading-relaxed space-y-8 text-sm sm:text-base">
            
            {/* Section 1 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. About This Acceptable Use Policy</h2>
              <p className="mb-4">
                This Acceptable Use Policy (“Policy”) outlines the rules and responsibilities that apply when you access
                or use the STAKD platform (“Platform”).
              </p>
              <p className="mb-4">
                STAKD Technologies Pty Ltd (stakd pty ltd) provides a web-based business management platform
                designed to help creators manage their creator businesses, including portfolios, workflows, contracts,
                and income tracking.
              </p>
              <p>
                By accessing or using STAKD, you agree to comply with this Policy, our Terms of Service, and all
                applicable laws.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. Your Responsibilities</h2>
              <p className="mb-4">
                When using STAKD, you agree that you are responsible for:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Maintaining the security and confidentiality of your account information",
                  "Ensuring information provided to STAKD is accurate and up to date",
                  "Ensuring you have the necessary rights, permissions, and authority to upload content",
                  "Using the Platform only for lawful purposes",
                  "Ensuring your use of STAKD complies with applicable laws, regulations, and third-party agreements"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                You are solely responsible for your account, your uploaded content, and your activities on the Platform.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Uploaded Content</h2>
              <p className="mb-4">
                You remain responsible for all content you upload, store, or share through STAKD. This includes, but is not limited to:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Portfolio images and videos",
                  "Creator work samples",
                  "Contracts and agreements",
                  "Brand briefs",
                  "Business documents",
                  "Income or earnings records",
                  "Social media links and profile information"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-4">
                You must only upload content that you have the legal right and permission to store and use.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                You must not upload content that:
              </p>
              <ul className="list-none space-y-2.5 mb-6 pl-1">
                {[
                  "You do not own or have permission to use",
                  "Infringes another person’s intellectual property rights",
                  "Contains confidential information you are not authorised to store",
                  "Contains unlawful, harmful, abusive, or misleading material"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-3">
                STAKD does not verify, review, approve, or guarantee the accuracy, ownership, authenticity, or legality of
                user-uploaded content.
              </p>
              <p>
                STAKD does not endorse or confirm the validity of any creator portfolio, earnings information, business
                records, contracts, brand relationships, or claims made by users.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Confidential Documents and Third-Party Information</h2>
              <p className="mb-4">
                STAKD may allow users to store private business documents, including contracts, agreements, and
                brand-related materials.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                By uploading confidential or third-party information, you confirm that you:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Have permission to store the information",
                  "Are authorised to access and manage the information",
                  "Are responsible for complying with any confidentiality obligations or agreements"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-3">
                STAKD provides storage and management tools only.
              </p>
              <p className="mb-3">
                Users are solely responsible for ensuring that documents uploaded to STAKD do not breach
                confidentiality agreements, non-disclosure agreements, brand agreements, or other obligations.
              </p>
              <p>
                STAKD is not responsible for a user’s failure to obtain permission or authority to store uploaded
                documents.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. AI-Generated and AI-Modified Content</h2>
              <p className="mb-4">
                STAKD allows users to upload content created or modified using artificial intelligence tools.
                Users must ensure that AI-generated or AI-manipulated content is used responsibly and transparently.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Where applicable, users must clearly disclose when content has been substantially generated, altered,
                or manipulated using artificial intelligence, including where disclosure is required by:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Applicable laws or regulations",
                  "Brand agreements",
                  "Platform rules",
                  "Client requirements",
                  "Circumstances where failing to disclose could mislead others"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-3">
                Users are responsible for ensuring AI-generated or AI-modified content does not infringe intellectual
                property rights, misrepresent real work, or deceive brands, clients, or other users.
              </p>
              <p>
                STAKD does not verify whether uploaded content has been created, modified, or enhanced using
                artificial intelligence.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. Prohibited Activities</h2>
              <p className="mb-4 font-semibold text-gray-800">
                You must not use STAKD to:
              </p>
              <ul className="list-none space-y-2.5 pl-1">
                {[
                  "Violate any applicable laws or regulations",
                  "Upload or distribute malicious software, viruses, or harmful code",
                  "Attempt to gain unauthorised access to STAKD systems, accounts, or data",
                  "Interfere with the operation, security, or performance of the Platform",
                  "Reverse engineer, copy, modify, or attempt to replicate any part of STAKD",
                  "Scrape, collect, or extract Platform data without permission",
                  "Impersonate another person, creator, business, or organisation",
                  "Conduct fraudulent, deceptive, or misleading activities",
                  "Harass, threaten, abuse, or harm other users"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. Creator and Business Conduct</h2>
              <p className="mb-4">
                STAKD provides tools to help creators manage their businesses.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD does not guarantee:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Brand partnerships",
                  "Creator income",
                  "Business growth",
                  "Client opportunities",
                  "Campaign success",
                  "Financial outcomes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Users are responsible for their own business decisions, client relationships, agreements, negotiations,
                and professional conduct.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">8. Third-Party Services</h2>
              <p className="mb-4">
                STAKD may connect with or rely on third-party services, including payment providers, hosting providers,
                analytics providers, and other technology providers.
              </p>
              <p className="mb-4">
                Users are responsible for complying with the terms and policies of any third-party services they use.
              </p>
              <p>
                STAKD is not responsible for third-party platforms, websites, services, or content outside STAKD’s
                control.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">9. Security and Platform Protection</h2>
              <p>
                You must not attempt to compromise the security of STAKD or its users.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AcceptableUsePolicy;
