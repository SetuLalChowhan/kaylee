import React from "react";
import useSEO from "@/hooks/useSEO";
import { Scale } from "lucide-react";

const TermsOfService = () => {
  useSEO({
    title: "Terms of Service | STAKD",
    description: "Terms of Service governing your access to and use of the STAKD platform.",
    keywords: "terms of service, stakd terms, user agreement, legal terms"
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-urbanist">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-12 rounded-[24px] shadow-sm shadow-slate-100">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-Primary tracking-wider uppercase">Legal & Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Terms of Service</h1>
              <p className="text-sm text-gray-500 font-semibold mt-1">Effective Date: 1 July 2025</p>
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. About These Terms</h2>
              <p className="mb-4">
                These Terms of Service ("Terms") govern your access to and use of the STAKD platform ("Platform"), operated by STAKD Technologies Pty Ltd ("STAKD", "we", "us", or "our").
              </p>
              <p className="mb-4">
                By creating an account, accessing, or using the Platform, you agree to be legally bound by these Terms. If you do not agree with these Terms, you must not access or use the Platform.
              </p>
              <p className="mb-4">
                These Terms apply to all users of the Platform, including creators, businesses, brands, contractors, and any other individuals or entities accessing STAKD.
              </p>
              <p>
                STAKD reserves the right to update or amend these Terms from time to time. Any updated Terms will be published through the Platform or otherwise made available to users. Continued use of the Platform after changes are published constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. About STAKD</h2>
              <p className="mb-4">
                STAKD provides software tools designed to assist creators and businesses in organising and managing aspects of their digital businesses.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                The Platform may include features such as:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Portfolio management",
                  "Campaign organisation",
                  "Content delivery tools",
                  "Contract storage and management",
                  "Business organisation tools",
                  "Payment and income tracking",
                  "Reminders, dashboards, and workflow tools"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <p className="mb-4 font-semibold text-gray-800">
                STAKD is a software platform only and does not act as:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "A talent agency",
                  "A creator management service",
                  "An employer",
                  "A brand representative",
                  "A legal adviser",
                  "An accountant",
                  "A financial adviser",
                  "A tax adviser",
                  "A business consultant"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4">
                STAKD does not guarantee that use of the Platform will result in increased income, business opportunities, brand partnerships, improved performance, or commercial success.
              </p>
              <p>
                Users remain solely responsible for their own businesses, decisions, agreements, relationships, and outcomes.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of the Platform, users may be required to create an account.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Users agree that they are responsible for:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Providing accurate and current account information",
                  "Maintaining the confidentiality and security of login credentials",
                  "Preventing unauthorised access to their account",
                  "All activity conducted through their account"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4 font-semibold text-gray-800">
                Users must not:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Create an account using false information",
                  "Impersonate another person or entity",
                  "Share account access with unauthorised individuals",
                  "Use another person's account without permission",
                  "Use the Platform for unlawful purposes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4">
                STAKD is not responsible for any loss, damage, unauthorised access, or activity resulting from a user's failure to maintain account security.
              </p>
              <p>
                Users must notify STAKD as soon as reasonably possible if they suspect unauthorised access to their account.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Beta Services and Early Access</h2>
              <p className="mb-4">
                STAKD may offer beta, preview, early access, experimental, or pre-release features ("Beta Services") from time to time.
              </p>
              <p className="mb-4">
                Beta Services are provided for testing, evaluation, improvement, and feedback purposes only.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Users acknowledge and agree that Beta Services:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "May contain bugs, errors, defects, limitations, or incomplete functionality",
                  "May not operate as expected",
                  "May experience interruptions or unexpected behaviour",
                  "May be modified, suspended, replaced, or discontinued at any time",
                  "Are provided on an \"as is\" and \"as available\" basis"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4">
                STAKD may modify, suspend, replace, or discontinue Beta Services at any time, with or without notice.
              </p>
              <p className="mb-4">
                Users acknowledge that participation in Beta Services is entirely voluntary and undertaken at the user's own risk.
              </p>
              <p className="mb-4">
                To the maximum extent permitted by law, STAKD accepts no liability for losses, damages, interruptions, errors, loss of data, or business impacts arising from the use of Beta Services.
              </p>
              <p>
                Any feedback, suggestions, ideas, comments, or improvements provided by users regarding Beta Services may be used by STAKD to develop, improve, and enhance the Platform without compensation, obligation, or restriction.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. No Professional Advice</h2>
              <p className="mb-4">
                STAKD provides software tools designed to assist creators and businesses with organisation and workflow management.
              </p>
              <p className="mb-4">
                Any information, reports, templates, reminders, calculations, dashboards, suggestions, or other features made available through the Platform are provided for general informational and organisational purposes only.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Nothing provided through STAKD constitutes:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Legal advice",
                  "Accounting advice",
                  "Tax advice",
                  "Financial advice",
                  "Business advice",
                  "Professional advice of any kind"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4">
                Users remain solely responsible for obtaining independent professional advice where appropriate.
              </p>
              <p>
                STAKD does not guarantee that any templates, resources, calculations, reminders, or information provided through the Platform are accurate, complete, suitable, or appropriate for a user's individual circumstances.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. User Responsibility and Backup of Data</h2>
              <p className="mb-4">
                Users are solely responsible for maintaining independent copies and backups of any important information uploaded, stored, or created through STAKD.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                This includes:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Contracts",
                  "Business records",
                  "Earnings information",
                  "Invoice records",
                  "Campaign materials",
                  "Portfolio content",
                  "Brand communications",
                  "Creative assets"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4">
                While STAKD takes reasonable steps to protect user information, users acknowledge that no online platform can guarantee uninterrupted availability or complete protection against data loss.
              </p>
              <p className="mb-4">
                Users should maintain their own independent backups of important information.
              </p>
              <p>
                To the maximum extent permitted by law, STAKD is not liable for any loss, corruption, deletion, unauthorised access, or inability to retrieve user data.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. Platform Availability</h2>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD aims to provide reliable access to the Platform; however, users acknowledge that STAKD does not guarantee that the Platform will always be:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Available",
                  "Uninterrupted",
                  "Error-free",
                  "Secure",
                  "Free from defects",
                  "Compatible with all devices, browsers, systems, or software environments"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4 font-semibold text-gray-800">
                The Platform may become temporarily unavailable due to:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Scheduled maintenance",
                  "Emergency maintenance",
                  "Software updates",
                  "Internet failures",
                  "Telecommunications failures",
                  "Hosting issues",
                  "Third-party service outages",
                  "Cybersecurity incidents",
                  "Technical failures",
                  "Circumstances beyond STAKD's reasonable control"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4">
                STAKD may perform maintenance, updates, modifications, or changes to the Platform at any time.
              </p>
              <p>
                To the maximum extent permitted by law, STAKD is not responsible or liable for any loss, damage, inconvenience, missed opportunities, business interruption, or costs arising from Platform unavailability.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">8. Third-Party Services</h2>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD relies on third-party providers to deliver certain Platform functionality, including:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Payment processing",
                  "Cloud hosting",
                  "Storage",
                  "Analytics",
                  "Communications",
                  "Authentication",
                  "Software integrations"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4 font-semibold text-gray-800">
                Users acknowledge that:
              </p>
              <ul className="list-none space-y-2 mb-6 pl-1">
                {[
                  "Third-party services operate independently from STAKD",
                  "Third-party services have their own terms and privacy policies",
                  "STAKD does not control third-party services",
                  "STAKD is not responsible for third-party failures, outages, security issues, or performance"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Any use of third-party services is undertaken at the user's own risk.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">9. User Content</h2>
              <p className="mb-4">
                Users retain ownership of content uploaded to STAKD.
              </p>
              <p className="mb-4">
                Users grant STAKD a limited, non-exclusive licence to host, store, process, transmit, and display User Content solely for providing and improving the Platform.
              </p>
              <p className="mb-4">
                Users are responsible for ensuring they have all required rights, licences, and permissions for uploaded content.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD is not responsible for disputes relating to:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Content ownership",
                  "Intellectual property",
                  "Contracts",
                  "Brand relationships",
                  "Permissions",
                  "User-created materials"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">10. Acceptable Use</h2>
              <p className="mb-4 font-semibold text-gray-800">
                Users must not:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Use STAKD unlawfully",
                  "Upload harmful software or malicious code",
                  "Attempt unauthorised access",
                  "Interfere with Platform security",
                  "Reverse engineer the Platform",
                  "Copy or exploit STAKD materials",
                  "Violate another person's rights",
                  "Harass or harm other users"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                STAKD may investigate suspected misuse and suspend or terminate accounts where appropriate.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">11. Intellectual Property</h2>
              <p className="mb-4">
                All STAKD software, branding, designs, systems, features, documentation, trademarks, and Platform materials remain the property of STAKD Technologies Pty Ltd or its licensors.
              </p>
              <p className="mb-4">
                Users receive a limited licence to access and use the Platform only for its intended purpose.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Users must not:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Copy",
                  "Modify",
                  "Reverse engineer",
                  "Sell",
                  "Distribute",
                  "Commercialise",
                  "Exploit"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                any part of STAKD without written permission.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">12. Subscription and Payments</h2>
              <p className="mb-4">
                Where paid subscriptions are offered, users agree to pay all applicable fees.
              </p>
              <p className="mb-4">
                Subscription fees and billing terms will be displayed through the Platform.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Unless required by Australian Consumer Law:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Payments are non-refundable",
                  "Users are responsible for cancelling before renewal",
                  "Failure to use the Platform does not entitle users to refunds"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                STAKD may update pricing or subscription features with reasonable notice.
              </p>
            </div>

            {/* Section 13 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">13. Suspension and Termination</h2>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD may suspend or terminate access if a user:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Breaches these Terms",
                  "Misuses the Platform",
                  "Engages in unlawful activity",
                  "Creates risk to STAKD or other users",
                  "Fails to pay applicable fees"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Termination does not remove obligations that arose before termination.
              </p>
            </div>

            {/* Section 14 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">14. Disclaimer of Warranties</h2>
              <p className="mb-4">
                The Platform is provided on an "as is" and "as available" basis.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD does not guarantee:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Continuous availability",
                  "Accuracy of information",
                  "Suitability for a particular purpose",
                  "Compatibility with all devices",
                  "Freedom from errors or bugs",
                  "Freedom from viruses or malicious software"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Users acknowledge that they use the Platform entirely at their own risk.
              </p>
            </div>

            {/* Section 15 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">15. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, STAKD Technologies Pty Ltd, including its directors, officers, employees, contractors, affiliates, licensors, and service providers, is not liable for any direct, indirect, incidental, consequential, special, or punitive loss arising from use of the Platform.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                This includes:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Loss of income",
                  "Loss of revenue",
                  "Loss of profits",
                  "Missed campaigns",
                  "Lost business opportunities",
                  "Loss of contracts",
                  "Reputation damage",
                  "Loss of goodwill",
                  "Data loss",
                  "Business interruption",
                  "Reliance on Platform information",
                  "User-generated content",
                  "Third-party services"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mb-4">
                Nothing in these Terms excludes rights that cannot legally be excluded under Australian Consumer Law.
              </p>
              <p>
                Where liability cannot be excluded, STAKD's liability is limited to the maximum extent permitted by law.
              </p>
            </div>

            {/* Section 16 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">16. User Indemnity</h2>
              <p className="mb-4 font-semibold text-gray-800">
                Users agree to indemnify and hold harmless STAKD Technologies Pty Ltd and its directors, employees, contractors, and affiliates from claims, losses, damages, costs, and legal expenses arising from:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Breach of these Terms",
                  "Unlawful use of the Platform",
                  "User Content",
                  "Intellectual property infringement",
                  "Breach of confidentiality",
                  "Misuse of STAKD"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 17 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">17. Force Majeure</h2>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD is not liable for delays or failures caused by events beyond reasonable control, including:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Natural disasters",
                  "Fires",
                  "Floods",
                  "Pandemics",
                  "Government actions",
                  "Internet failures",
                  "Cyberattacks",
                  "Power outages",
                  "Industrial disputes",
                  "Third-party provider failures"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 18 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">18. Privacy</h2>
              <p className="mb-4 text-gray-800 font-semibold">
                STAKD handles personal information according to its Privacy Policy. Users acknowledge information may be processed to:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Provide Platform services",
                  "Maintain accounts",
                  "Improve functionality",
                  "Communicate with users",
                  "Maintain security",
                  "Meet legal obligations"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 19 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">19. Entire Agreement</h2>
              <p>
                These Terms, together with STAKD's Privacy Policy, Acceptable Use Policy, Subscription and Billing Policy, Cookie Policy, and other published policies, form the complete agreement between STAKD and users. If any provision is found invalid or unenforceable, the remaining provisions remain effective.
              </p>
            </div>

            {/* Section 20 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">20. Governing Law</h2>
              <p>
                These Terms are governed by the laws of Victoria, Australia. Users agree to submit to the jurisdiction of the courts of Victoria, Australia.
              </p>
            </div>

            {/* Section 21 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">21. Contact</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm">
                <p className="font-bold text-gray-900">STAKD Technologies Pty Ltd</p>
                <p className="text-gray-500 text-xs mt-0.5">Contact details are available through the STAKD Platform.</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-slate-100 text-center text-xs text-gray-400 font-semibold uppercase tracking-widest">
              End of Terms of Service
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
