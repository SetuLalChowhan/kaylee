import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyCheckout = async () => {
      if (!sessionId) {
        setStatus("error");
        setErrorMsg("No session ID found in verification URL.");
        return;
      }

      try {
        const res = await axiosSecure.post("/subscriptions/verify", { sessionId });
        if (res.data?.status === "success") {
          setStatus("success");
          // Redirect to user subscription settings tab after 3 seconds
          setTimeout(() => {
            navigate("/dashboard/settings?tab=Subscription");
          }, 3500);
        } else {
          setStatus("error");
          setErrorMsg("Could not verify your checkout session.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.response?.data?.message || "An unexpected error occurred during payment verification.");
      }
    };

    verifyCheckout();
  }, [sessionId, axiosSecure, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6 font-outfit">
      <div className="w-full max-w-md bg-white border border-slate-100 p-10 rounded-[32px] shadow-xl shadow-slate-100 flex flex-col items-center text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-Primary/5 text-Primary rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Payment</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
              We are confirming your payment details with Stripe. Please do not close or refresh this page.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Checkout Successful!</h2>
            <p className="text-sm text-green-600 font-bold mb-4 uppercase tracking-wider text-[10px]">
              Subscription Upgraded
            </p>
            <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
              Thank you for upgrading! Your workspace has been updated. Redirection to your settings...
            </p>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full animate-[progress_3.5s_ease-out_forwards]" style={{ width: "0%" }} />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-sm text-red-500 font-semibold mb-4 text-xs leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate("/dashboard/settings?tab=Subscription")}
              className="bg-Primary text-white font-bold py-3 px-8 rounded-2xl hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/10 cursor-pointer"
            >
              Back to Settings
            </button>
          </>
        )}
      </div>
      
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionSuccess;
