import React from "react";
import useSEO from "@/hooks/useSEO";
import { Award } from "lucide-react";

const FoundingCreatorAgreement = () => {
  useSEO({
    title: "Founding Creator Agreement | STAKD",
    description: "Agreement outlining the terms of your participation in the STAKD Founding Creator Program.",
    keywords: "founding creator, creator program, stakd beta, early access, agreement"
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-urbanist">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-12 rounded-[24px] shadow-sm shadow-slate-100">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-Primary tracking-wider uppercase">Legal & Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Founding Creator Agreement</h1>
              <p className="text-sm text-gray-500 font-semibold mt-1">Founding Creator Program</p>
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. Welcome to the STAKD Founding Creator Program</h2>
              <p className="mb-4">
                Thank you for joining the STAKD Founding Creator Program.
              </p>
              <p className="mb-4">
                This agreement outlines the terms of your participation as an early access creator testing the STAKD platform ("Platform") before its official launch.
              </p>
              <p>
                By accepting this agreement and creating an account, you agree to the terms outlined below.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. About STAKD</h2>
              <p className="mb-4">
                STAKD is a platform designed to help UGC creators manage the behind-the-scenes operations of their creator business, including campaigns, content management, contracts, payments, and workflow organisation.
              </p>
              <p>
                You have been invited to participate as a Founding Creator because your feedback and experience will help shape the development of STAKD.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Founding Creator Access</h2>
              <p className="mb-4">
                As a Founding Creator, you will receive complimentary access to STAKD during the beta period.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                Your access is provided for the purpose of:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Testing the Platform;",
                  "Exploring features and functionality;",
                  "Providing feedback;",
                  "Helping improve the creator experience before official launch."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                STAKD is currently in its MVP (Minimum Viable Product) stage. This means that while core features are available, the Platform may contain bugs, limitations, changes, or updates as development continues.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Feedback & Testing</h2>
              <p className="mb-4">
                As a Founding Creator, you agree to provide honest feedback about your experience using STAKD.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                This may include:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Reporting bugs or technical issues;",
                  "Sharing suggestions for improvements;",
                  "Providing feedback on features and usability;",
                  "Answering occasional questions about your experience."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                You acknowledge that feedback provided may be used by STAKD to improve and develop the Platform.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. Content Creation & Sharing</h2>
              <p className="mb-4">
                Creating content about STAKD is completely optional.
              </p>
              <p className="mb-4">
                There is no requirement to create, post, or promote STAKD as part of your Founding Creator access.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                If you choose to create content about STAKD:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "You agree that any content created remains yours;",
                  "You may provide STAKD permission to repost or share your content with your approval;",
                  "Any paid campaigns, usage rights, or commercial partnerships will be discussed separately."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Founding Creators who choose to create and share content may be prioritised when STAKD selects creators for future paid campaigns. However, participation does not guarantee paid work opportunities.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. Confidentiality & Early Access</h2>
              <p className="mb-4">
                As a Founding Creator, you may have access to STAKD features, information, or functionality before public launch.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                You agree not to:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Share confidential information about unreleased features;",
                  "Publish screenshots or demonstrations of unreleased functionality without approval;",
                  "Represent yourself as an employee, representative, or official spokesperson of STAKD."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                We encourage you to share your excitement about being involved, but please check with STAKD before sharing anything relating to unreleased product features.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. Platform Changes & Availability</h2>
              <p className="mb-4">
                As STAKD is under development:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Features may be added, removed, or changed;",
                  "Access may occasionally be unavailable due to updates, maintenance, or technical issues;",
                  "The Platform experience may differ from the final launched version."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                STAKD does not guarantee that all beta features will remain available after launch.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">8. Account Responsibility</h2>
              <p className="mb-4 font-semibold text-gray-800">
                You are responsible for:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Maintaining the security of your account details;",
                  "Providing accurate information when creating your account;",
                  "Keeping your login details confidential."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                You agree not to misuse the Platform or attempt to interfere with its functionality or security.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">9. No Payment Obligation</h2>
              <p className="mb-4">
                Your participation as a Founding Creator is voluntary and unpaid.
              </p>
              <p>
                You acknowledge that complimentary access to STAKD does not create an employment relationship, contractor relationship, partnership, or agency relationship between you and STAKD.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">10. Ending Participation</h2>
              <p className="mb-4">
                Either you or STAKD may choose to end your participation in the Founding Creator Program at any time.
              </p>
              <p>
                If your access is ended, you may lose access to beta features and your Founding Creator access.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">11. Acceptance</h2>
              <p className="mb-4 font-semibold text-gray-800">
                By creating an account and participating in the STAKD Founding Creator Program, you confirm that:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "You have read and understood this agreement;",
                  "You agree to participate as an early access creator;",
                  "You understand STAKD is currently in MVP development;",
                  "You agree to provide honest feedback to help improve the Platform."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Thank you for helping build STAKD from the beginning. Your feedback will help shape a better platform for creators everywhere.
              </p>
            </div>

            {/* Signature Area */}
            <div className="pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-sm">
                <p className="font-black text-gray-900 text-lg">STAKD</p>
                <div className="h-[1px] bg-slate-200 my-3 w-full" />
                <p className="text-gray-500 text-sm">
                  <span className="font-bold text-gray-700">Founder</span> | Kaylee Wallace
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default FoundingCreatorAgreement;
