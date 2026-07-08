import React from "react";
import useSEO from "@/hooks/useSEO";
import { Cookie } from "lucide-react";

const CookiePolicy = () => {
  useSEO({
    title: "Cookie Policy | STAKD",
    description: "Cookie Policy explaining how STAKD uses cookies and similar technologies to improve user experience.",
    keywords: "cookie policy, stakd cookies, tracking technologies"
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-urbanist">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-12 rounded-[24px] shadow-sm shadow-slate-100">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary shrink-0">
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-Primary tracking-wider uppercase">Legal & Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Cookie Policy</h1>
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. About This Cookie Policy</h2>
              <p className="mb-4">
                This Cookie Policy explains how STAKD Technologies Pty Ltd (stakd pty ltd) (“STAKD”, “we”, “us”, or “our”)
                uses cookies and similar technologies when you access or use the STAKD website and platform
                (“Platform”).
              </p>
              <p>
                This Policy should be read together with our Privacy Policy, which explains how we collect, use, store,
                and protect personal information. By using STAKD, you acknowledge that cookies and similar technologies
                may be used as described in this Policy.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files stored on your device when you visit a website or use an online platform.
                Cookies help websites and applications:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Operate correctly",
                  "Remember user preferences",
                  "Maintain account security",
                  "Understand how users interact with services",
                  "Improve performance and functionality"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Similar technologies may include pixels, tags, local storage, and other tracking technologies.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. How STAKD Uses Cookies</h2>
              <p className="mb-6">
                STAKD may use cookies and similar technologies for the following purposes:
              </p>
              
              <div className="space-y-5">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="mb-3">
                    These cookies are necessary for the Platform to function properly. They may be used for:
                  </p>
                  <ul className="list-none space-y-1.5 pl-1 mb-3 text-xs sm:text-sm">
                    {[
                      "User authentication",
                      "Keeping users securely logged into their accounts",
                      "Maintaining account security",
                      "Enabling core Platform functionality"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 font-medium">
                    Essential cookies cannot generally be disabled because they are required for the operation of STAKD.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="mb-3">
                    STAKD may use analytics cookies or similar technologies to understand how users interact with the Platform.
                    This information may help us:
                  </p>
                  <ul className="list-none space-y-1.5 pl-1 mb-3 text-xs sm:text-sm">
                    {[
                      "Improve Platform performance",
                      "Identify technical issues",
                      "Understand feature usage",
                      "Improve user experience"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 font-medium">
                    Analytics information may be collected in an aggregated or anonymised form where possible.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-gray-900 mb-2">Payment and Third-Party Service Cookies</h3>
                  <p className="mb-3">
                    STAKD may use third-party services that place cookies or similar technologies on your device.
                    These services may include:
                  </p>
                  <ul className="list-none space-y-1.5 pl-1 mb-3 text-xs sm:text-sm">
                    {[
                      "Payment processors",
                      "Hosting providers",
                      "Technology providers",
                      "Other services required to operate Platform functionality"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 font-medium">
                    Third-party providers may collect information according to their own privacy policies.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Future Marketing and Advertising Technologies</h2>
              <p className="mb-4">
                As STAKD grows, we may introduce marketing, advertising, or customer communication technologies
                that use cookies or similar technologies.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                These technologies may be used to:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Understand marketing effectiveness",
                  "Improve communications",
                  "Provide relevant information about STAKD"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Where required, STAKD may provide additional notice or request consent before using optional tracking
                technologies.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. Managing Cookies</h2>
              <p className="mb-4">
                You can control or delete cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "View stored cookies",
                  "Delete existing cookies",
                  "Block future cookies",
                  "Receive warnings before cookies are stored"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Please note that disabling certain cookies may affect the functionality or availability of parts of the
                STAKD Platform.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. Third-Party Websites and Services</h2>
              <p className="mb-3">
                STAKD may contain links to third-party websites, services, or platforms.
              </p>
              <p className="mb-3">
                STAKD is not responsible for the cookie practices, privacy practices, or security of third-party websites.
              </p>
              <p>
                Users should review the privacy and cookie policies of any third-party services they access.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. International Users</h2>
              <p className="mb-3">
                STAKD operates from Australia but may be accessed globally.
              </p>
              <p className="mb-3">
                Depending on your location, additional privacy rights or requirements may apply.
              </p>
              <p>
                STAKD aims to handle personal information and cookie usage in accordance with applicable privacy
                laws.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">8. Changes to This Cookie Policy</h2>
              <p className="mb-3">
                STAKD may update this Cookie Policy from time to time.
              </p>
              <p className="mb-3">
                Any changes will be published on this page with an updated effective date.
              </p>
              <p>
                Continued use of STAKD after changes are published means you accept the updated Cookie Policy.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Cookie Policy, please contact:
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm">
                <p className="font-bold text-gray-900">STAKD Technologies Pty Ltd</p>
                <p className="text-gray-500 text-xs mt-0.5">(stakd pty ltd)</p>
                <p className="mt-3 text-sm font-semibold text-Primary">
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

export default CookiePolicy;
