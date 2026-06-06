import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GlobeAltIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  // step: "email" | "otp"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await authApi.requestOtp(email.trim().toLowerCase());
      toast.success("Code sent — check your email");
      setStep("otp");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;

    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, code);
      const { token, ...user } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate("/app/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Invalid or expired code";
      toast.error(msg);
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return; 
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);

    // Auto-advance to next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    // Backspace — go back to previous box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const updated = [...otp];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtp(updated);
    // Focus last filled box
    const lastIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col">
      {/*Navbar */}
      <header className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 bg-forest-900 rounded-[6px] flex items-center
                            justify-center shrink-0"
            >
              <GlobeAltIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-forest-900 tracking-tight">
              AgriConnect
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            No account?{" "}
            <Link
              to="/register"
              className="text-forest-900 font-medium hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </header>

      {/*Main*/}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/*Step 1: Email*/}
          {step === "email" && (
            <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-8">
              {/* Header */}
              <div className="mb-8">
                <div
                  className="w-10 h-10 bg-forest-100 rounded-[10px]
                                flex items-center justify-center mb-4"
                >
                  <EnvelopeIcon className="w-5 h-5 text-forest-700" />
                </div>
                <h1 className="text-xl font-bold text-forest-900 mb-1">
                  Sign in to AgriConnect
                </h1>
                <p className="text-sm text-gray-500">
                  Enter your email and we'll send you a login code. No password
                  needed.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm rounded-[8px]
                               border border-[#e5e7eb] bg-white text-gray-900
                               placeholder:text-gray-400 focus:outline-none
                               focus:ring-2 focus:ring-forest-200
                               focus:border-forest-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2
                             bg-forest-900 text-white text-sm font-medium
                             px-4 py-2.5 rounded-[8px] hover:bg-forest-800
                             transition-colors disabled:opacity-50
                             disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send login code
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust note */}
              <div className="mt-6 pt-6 border-t border-[#f0efec] flex items-start gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-forest-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  We send a 6-digit code to your email. It expires in 5 minutes
                  and can only be used once.
                </p>
              </div>
            </div>
          )}

          {/*Step 2: OTP verify */}
          {step === "otp" && (
            <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-8">
              {/* Header */}
              <div className="mb-8">
                <div
                  className="w-10 h-10 bg-forest-100 rounded-[10px]
                                flex items-center justify-center mb-4"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-forest-700" />
                </div>
                <h1 className="text-xl font-bold text-forest-900 mb-1">
                  Enter your login code
                </h1>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-gray-700">{email}</span>.
                  Check your inbox.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                {/* OTP boxes */}
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-xl font-semibold
                                 text-forest-900 border border-[#e5e7eb]
                                 rounded-[10px] bg-[#f8f7f4]
                                 focus:outline-none focus:ring-2
                                 focus:ring-forest-200 focus:border-forest-400
                                 focus:bg-white transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full inline-flex items-center justify-center gap-2
                             bg-forest-900 text-white text-sm font-medium
                             px-4 py-2.5 rounded-[8px] hover:bg-forest-800
                             transition-colors disabled:opacity-50
                             disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify and sign in
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend + back */}
              <div
                className="mt-6 pt-6 border-t border-[#f0efec]
                              flex items-center justify-between"
              >
                <button
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400
                             hover:text-gray-600 transition-colors"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  Change email
                </button>

                <button
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-xs text-forest-700 font-medium
                             hover:text-forest-900 transition-colors
                             disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {/* Bottom note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in you agree to our{" "}
            <a href="#" className="text-gray-500 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-gray-500 hover:underline">
              Privacy policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
