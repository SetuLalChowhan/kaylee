import React from "react";
import useSEO from "@/hooks/useSEO";
import { Lock } from "lucide-react";

const PrivacyPolicy = () => {
  useSEO({
    title: "Privacy Policy | STAKD",
    description: "Privacy Policy detailing how STAKD collects, uses, stores, and protects personal information.",
    keywords: "privacy policy, stakd privacy, data security, data protection"
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-urbanist">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-12 rounded-[24px] shadow-sm shadow-slate-100">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-Primary tracking-wider uppercase">Legal & Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Privacy Policy</h1>
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. About This Privacy Policy</h2>
              <p className="mb-4">
                This Privacy Policy explains how STAKD Technologies Pty Ltd (STAKD, we, us, or our) collects, uses,
                stores, and protects personal information when you access or use the STAKD platform.
              </p>
              <p className="mb-4">
                STAKD Technologies Pty Ltd (stakd pty ltd) is an Australian company providing a web-based business
                management platform for creators, including portfolio management, creator workflow tools, contract
                storage, and income tracking features.
              </p>
              <p>
                By using STAKD, you agree to the collection and handling of information described in this Privacy Policy.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="mb-6">
                We may collect the following information:
              </p>
              
              <div className="space-y-5">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Account Information</h3>
                  <ul className="list-none space-y-1.5 pl-1 text-xs sm:text-sm">
                    {["Name", "Email address", "Username", "Password information", "Profile image"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Creator Information</h3>
                  <ul className="list-none space-y-1.5 pl-1 text-xs sm:text-sm">
                    {[
                      "Portfolio images and videos uploaded by users",
                      "Social media links",
                      "Contracts uploaded by users",
                      "Creator business records, including invoice and earnings tracking information entered by users"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-xs sm:text-sm">
                    Subscription payments are processed through Stripe. STAKD does not store full
                    payment card details. Payment information is handled by Stripe in accordance with their own privacy
                    and security practices.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Technical Information</h3>
                  <p className="text-xs sm:text-sm">
                    We may automatically collect technical information including IP address,
                    browser type, device information, operating system information, usage information, and cookies or
                    similar technologies where applicable.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-4 font-semibold text-gray-800">
                We use personal information to:
              </p>
              <ul className="list-none space-y-2.5 mb-5 pl-1">
                {[
                  "Provide and operate the STAKD platform",
                  "Create and manage user accounts",
                  "Provide customer support",
                  "Process subscriptions and payments",
                  "Maintain platform security",
                  "Prevent misuse, fraud, or unauthorised access",
                  "Improve platform performance and functionality"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-3 font-semibold text-gray-900">
                STAKD does not sell user information.
              </p>
              <p>
                STAKD does not use uploaded creator content for advertising, artificial intelligence training, marketing
                purposes, or commercial purposes without permission.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. User Content</h2>
              <p className="mb-3">
                You retain ownership of all content you upload to STAKD, including portfolio materials and contracts.
              </p>
              <p className="mb-4">
                By uploading content, you grant STAKD permission to store and process that content only as necessary
                to provide the platform services.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD may access uploaded content only when reasonably required for:
              </p>
              <ul className="list-none space-y-2.5 mb-5 pl-1">
                {[
                  "Customer support requested by you",
                  "Security investigations",
                  "Technical troubleshooting",
                  "Preventing misuse of the platform"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                STAKD does not claim ownership of your uploaded content.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. Data Storage and Security</h2>
              <p className="mb-3">
                STAKD takes reasonable steps to protect personal information from unauthorised access, loss, misuse,
                or disclosure.
              </p>
              <p className="mb-3">
                Information may be stored using third-party service providers, including hosting providers and
                payment processors.
              </p>
              <p>
                While STAKD implements reasonable security measures, no online platform can guarantee complete
                security of information.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. Third Party Services</h2>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD may use third-party providers to operate the platform, including:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Hosting providers",
                  "Payment processors such as Stripe",
                  "Business email services",
                  "Other technology providers required to deliver platform functionality"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                These providers may process information according to their own privacy policies.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. International Users</h2>
              <p className="mb-3">
                STAKD operates from Australia but may be accessed globally.
              </p>
              <p className="mb-3">
                We aim to handle personal information in accordance with applicable privacy laws, including the
                Australian Privacy Principles under the Privacy Act 1988 (Cth).
              </p>
              <p>
                Where applicable, we may provide privacy protections consistent with internationally recognised privacy
                standards.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">8. Cookies and Analytics</h2>
              <p className="mb-3">
                STAKD may use cookies, analytics tools, or similar technologies to understand platform usage, improve
                performance, and maintain security.
              </p>
              <p>
                Users may control cookie settings through their browser settings where available.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">9. Account Deletion</h2>
              <p className="mb-4">
                Users may request deletion of their STAKD account. Upon deletion:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Active account information will be removed from STAKD systems where reasonably possible",
                  "Uploaded content will be deleted",
                  "Personal information will no longer be used for platform operation"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Some information may be temporarily retained where required for security, legal, fraud prevention, or
                technical backup purposes.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">10. Your Rights</h2>
              <p className="mb-4">
                Depending on your location and applicable laws, you may have rights to:
              </p>
              <ul className="list-none space-y-2.5 mb-5 pl-1">
                {[
                  "Request access to personal information held about you",
                  "Request correction of inaccurate information",
                  "Request deletion of personal information",
                  "Contact us regarding privacy concerns"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-4">
                Requests can be made by contacting:
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm">
                <p className="font-bold text-gray-900">STAKD Support</p>
                <p className="mt-2 text-sm font-semibold text-Primary">
                  Email: <a href="mailto:support@getstakd.co" className="hover:underline">support@getstakd.co</a>
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
