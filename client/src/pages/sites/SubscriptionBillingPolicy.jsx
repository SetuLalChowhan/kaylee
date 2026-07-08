import React from "react";
import useSEO from "@/hooks/useSEO";
import { CreditCard } from "lucide-react";

const SubscriptionBillingPolicy = () => {
  useSEO({
    title: "Subscription & Billing Policy | STAKD",
    description: "Subscription & Billing Policy explaining pricing plans, payment processing, cancellation, and refund rules.",
    keywords: "subscription policy, billing policy, stakd prices, founding member"
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-urbanist">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-12 rounded-[24px] shadow-sm shadow-slate-100">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-Primary/10 flex items-center justify-center text-Primary shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-Primary tracking-wider uppercase">Legal & Compliance</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Subscription & Billing Policy</h1>
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. About This Subscription & Billing Policy</h2>
              <p className="mb-4">
                This Subscription & Billing Policy (“Policy”) explains the subscription plans, payment terms,
                cancellations, and billing practices that apply when you subscribe to STAKD.
              </p>
              <p className="mb-4">
                STAKD Technologies Pty Ltd (stakd pty ltd) provides a web-based creator business management
                platform designed to help creators manage workflows, portfolios, campaigns, contracts, and business
                records.
              </p>
              <p>
                By subscribing to STAKD, you agree to the terms outlined in this Policy, our Terms of Service, Privacy
                Policy, and any other applicable STAKD policies.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. Subscription Plans</h2>
              <p className="mb-3">
                STAKD may offer both free and paid subscription plans.
              </p>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-gray-900 mb-2">Free Plan</h3>
                <p className="mb-3">
                  STAKD may offer users access to a free version of the Platform with limited functionality.
                  The free plan currently includes access to limited platform features, including the ability to create and
                  manage one active campaign at a time.
                </p>
                <p className="mb-3">
                  STAKD reserves the right to modify, add, remove, restrict, or change the features included in free plans
                  at any time.
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Users acknowledge that free plans may have limitations compared to paid subscriptions.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Paid Subscription Plans</h2>
              <p className="mb-4">
                STAKD currently offers paid subscription plans. Pricing may include:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Founding Member Subscription</h3>
                    <p className="text-xs text-gray-500 mb-3">Available to the first 200 eligible users</p>
                  </div>
                  <p className="text-2xl font-black text-Primary">$19.99 AUD <span className="text-xs text-gray-500 font-bold">/ month</span></p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Standard Subscription</h3>
                    <p className="text-xs text-gray-500 mb-3">Regular plan for general creators</p>
                  </div>
                  <p className="text-2xl font-black text-gray-900">$29.99 AUD <span className="text-xs text-gray-500 font-bold">/ month</span></p>
                </div>
              </div>

              <p className="mt-4">
                STAKD reserves the right to introduce additional subscription plans, change pricing, or modify
                subscription offerings in the future.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Founding Member Pricing</h2>
              <p className="mb-3">
                Founding Member pricing is a special introductory subscription rate offered to eligible users.
              </p>
              <p className="mb-3">
                Founding Member pricing applies only while the user maintains an active paid subscription.
              </p>
              <p className="mb-3">
                If a user cancels their subscription, allows their subscription to lapse, or otherwise stops maintaining an
                active paid subscription, they may lose access to Founding Member pricing.
              </p>
              <p>
                Rejoining STAKD after cancellation may require subscribing at the current available subscription price.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. Payment Processing</h2>
              <p className="mb-3">
                Subscription payments are processed through third-party payment providers, including Stripe.
              </p>
              <p className="mb-3">
                By subscribing to STAKD, you authorise STAKD and its payment providers to charge your selected
                payment method for applicable subscription fees.
              </p>
              <p className="mb-3">
                STAKD does not store full payment card details.
              </p>
              <p>
                Payment information is handled according to the relevant payment provider’s privacy and security
                practices.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">6. Recurring Payments</h2>
              <p className="mb-3">
                Paid subscriptions automatically renew at the end of each billing period unless cancelled before the
                next billing date.
              </p>
              <p>
                You are responsible for ensuring your payment details remain accurate and up to date.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">7. Cancellation</h2>
              <p className="mb-4">
                You may cancel your subscription at any time. When you cancel:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Your subscription will not renew at the end of your current billing period",
                  "You will continue to have access to paid features until the end of the period you have already paid for",
                  "You will not receive a refund for any unused portion of your subscription period, except where required by applicable law"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm font-medium text-gray-500">
                For example, if you cancel on 1 September but your billing period ends on 12 September, you will retain
                access until 12 September.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">8. Refund Policy</h2>
              <p className="mb-4">
                Subscription payments are non-refundable except where required under applicable law, including
                mandatory consumer rights under Australian Consumer Law.
              </p>
              <p className="mb-3 font-semibold text-gray-850">
                You will not receive refunds for:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Unused subscription periods",
                  "Forgetting to cancel before renewal",
                  "Lack of use of the Platform",
                  "Dissatisfaction with the Platform",
                  "Choosing not to use available features"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Cancellation prevents future charges but does not create entitlement to refunds for payments already
                processed.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">9. Failed Payments</h2>
              <p className="mb-3">
                If a subscription payment fails, STAKD may attempt to process the payment again through the payment
                provider.
              </p>
              <p className="mb-4">
                Users will have a five (5) day grace period to resolve payment issues.
              </p>
              <p className="mb-3 font-semibold text-gray-800">
                If payment remains unsuccessful after this period, STAKD may:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Restrict access to paid features",
                  "Suspend the account",
                  "Cancel the subscription",
                  "Take other reasonable steps to recover unpaid amounts"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-550 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">10. Changes to Subscription Pricing</h2>
              <p className="mb-3">
                STAKD may change subscription prices, plans, or included features from time to time.
              </p>
              <p className="mb-3">
                Where required, STAKD will provide reasonable notice before pricing changes take effect.
              </p>
              <p>
                Continued use of the Platform after a pricing change becomes effective means you accept the updated
                pricing.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">11. Changes to Features and Services</h2>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD is continually developing and improving the Platform. STAKD reserves the right to:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Add new features",
                  "Modify existing features",
                  "Remove features",
                  "Change how features operate",
                  "Discontinue certain services"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                STAKD does not guarantee that any specific feature will remain available indefinitely.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">12. Account Closure After Subscription Ends</h2>
              <p className="mb-3">
                If you cancel your subscription, you may continue accessing your account until the end of your paid
                billing period.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                After your subscription period expires:
              </p>
              <ul className="list-none space-y-2.5 mb-4 pl-1">
                {[
                  "Your access to paid Platform features may be removed",
                  "Your account may be deleted",
                  "Your uploaded content may be removed"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Some information may be temporarily retained where required for security, legal obligations, fraud
                prevention, backups, or technical purposes. Data handling is subject to the STAKD Privacy Policy.
              </p>
            </div>

            {/* Section 13 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">13. No Guarantee of Business Results</h2>
              <p className="mb-4">
                STAKD provides tools to help creators manage their businesses.
              </p>
              <p className="mb-4 font-semibold text-gray-800">
                STAKD does not guarantee:
              </p>
              <ul className="list-none space-y-2 mb-4 pl-1">
                {[
                  "Increased income",
                  "Brand partnerships",
                  "Creator success",
                  "Business growth",
                  "Client opportunities",
                  "Financial outcomes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-Primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Users remain responsible for their own business activities, decisions, and results.
              </p>
            </div>

            {/* Section 14 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">14. Changes to This Policy</h2>
              <p className="mb-3">
                STAKD may update this Subscription & Billing Policy from time to time.
              </p>
              <p className="mb-3">
                Changes will be published with an updated effective date.
              </p>
              <p>
                Continued use of STAKD after changes are published means you accept the updated Policy.
              </p>
            </div>

            {/* Section 15 */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">15. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Subscription & Billing Policy, please contact:
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

export default SubscriptionBillingPolicy;
