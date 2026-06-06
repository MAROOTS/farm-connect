// agriconnectui/src/pages/RegisterPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GlobeAltIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import clsx from "clsx";

const roles = [
  {
    id: "FARMER",
    label: "Farmer",
    desc: "I grow crops and want to sell my produce directly to buyers.",
    icon: "🌱",
  },
  {
    id: "BUYER",
    label: "Buyer",
    desc: "I want to purchase fresh produce directly from farmers.",
    icon: "🛒",
  },
  {
    id: "SUPPLIER",
    label: "Supplier",
    desc: "I supply farming inputs, equipment, or services to farmers.",
    icon: "📦",
  },
];

const steps = [
  { number: 1, label: "Your details" },
  { number: 2, label: "Your role" },
  { number: 3, label: "Verify email" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validateStep1() {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{10,}$/.test(form.phoneNumber))
      newErrors.phoneNumber = "Enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    if (!form.role) {
      toast.error("Please select your role to continue");
      return false;
    }
    return true;
  }

  function handleStep1Next(e) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  async function handleStep2Next() {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success("Account created! Check your email for the code.");
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message ?? "Registration failed";
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
      const res = await authApi.verifyOtp(form.email, code);
      const { token, ...user } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome to AgriConnect, ${user.fullName}!`);
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
    if (value && index < 5) {
      document.getElementById(`rotp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`rotp-${index - 1}`)?.focus();
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
    const lastIndex = Math.min(pasted.length, 5);
    document.getElementById(`rotp-${lastIndex}`)?.focus();
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col">
      {/*Navbar*/}
      <header className="bg-white border-b border-[#e5e7eb]">
        <div
          className="max-w-6xl mx-auto px-6 h-14 flex items-center
                        justify-between"
        >
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 bg-forest-900 rounded-[6px] flex
                            items-center justify-center shrink-0"
            >
              <GlobeAltIcon className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-[15px] font-semibold text-forest-900
                             tracking-tight"
            >
              AgriConnect
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-forest-900 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/*Main*/}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/*Step indicator*/}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "w-7 h-7 rounded-full flex items-center justify-center",
                      "text-xs font-semibold transition-colors",
                      step > s.number
                        ? "bg-forest-900 text-white"
                        : step === s.number
                          ? "bg-forest-900 text-white"
                          : "bg-[#e5e7eb] text-gray-400",
                    )}
                  >
                    {step > s.number ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={clsx(
                      "text-xs font-medium hidden sm:block",
                      step === s.number ? "text-forest-900" : "text-gray-400",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={clsx(
                      "w-8 h-px mx-1",
                      step > s.number ? "bg-forest-900" : "bg-[#e5e7eb]",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div
              className="bg-white border border-[#e5e7eb]
                            rounded-[16px] p-8"
            >
              <div className="mb-8">
                <div
                  className="w-10 h-10 bg-forest-100 rounded-[10px]
                                flex items-center justify-center mb-4"
                >
                  <UserIcon className="w-5 h-5 text-forest-700" />
                </div>
                <h1 className="text-xl font-bold text-forest-900 mb-1">
                  Create your account
                </h1>
                <p className="text-sm text-gray-500">
                  Join thousands of farmers, buyers and suppliers on
                  AgriConnect.
                </p>
              </div>

              <form onSubmit={handleStep1Next} className="flex flex-col gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Full name
                  </label>
                  <div className="relative">
                    <UserIcon
                      className="absolute left-3 top-1/2
                                        -translate-y-1/2 w-4 h-4
                                        text-gray-400"
                    />
                    <input
                      name="fullName"
                      type="text"
                      placeholder="John Kamau"
                      value={form.fullName}
                      onChange={handleChange}
                      autoFocus
                      className={clsx(
                        "w-full pl-9 pr-3 py-2.5 text-sm rounded-[8px]",
                        "border bg-white text-gray-900",
                        "placeholder:text-gray-400 focus:outline-none",
                        "focus:ring-2 focus:ring-forest-200",
                        "focus:border-forest-400 transition-colors",
                        errors.fullName ? "border-red-400" : "border-[#e5e7eb]",
                      )}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Email address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon
                      className="absolute left-3 top-1/2
                                             -translate-y-1/2 w-4 h-4
                                             text-gray-400"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className={clsx(
                        "w-full pl-9 pr-3 py-2.5 text-sm rounded-[8px]",
                        "border bg-white text-gray-900",
                        "placeholder:text-gray-400 focus:outline-none",
                        "focus:ring-2 focus:ring-forest-200",
                        "focus:border-forest-400 transition-colors",
                        errors.email ? "border-red-400" : "border-[#e5e7eb]",
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Phone number
                  </label>
                  <div className="relative">
                    <PhoneIcon
                      className="absolute left-3 top-1/2
                                          -translate-y-1/2 w-4 h-4
                                          text-gray-400"
                    />
                    <input
                      name="phoneNumber"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className={clsx(
                        "w-full pl-9 pr-3 py-2.5 text-sm rounded-[8px]",
                        "border bg-white text-gray-900",
                        "placeholder:text-gray-400 focus:outline-none",
                        "focus:ring-2 focus:ring-forest-200",
                        "focus:border-forest-400 transition-colors",
                        errors.phoneNumber
                          ? "border-red-400"
                          : "border-[#e5e7eb]",
                      )}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center
                             gap-2 bg-forest-900 text-white text-sm
                             font-medium px-4 py-2.5 rounded-[8px]
                             hover:bg-forest-800 transition-colors mt-2"
                >
                  Continue
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                By registering you agree to our{" "}
                <a href="#" className="text-gray-500 hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-gray-500 hover:underline">
                  Privacy policy
                </a>
              </p>
            </div>
          )}

          {step === 2 && (
            <div
              className="bg-white border border-[#e5e7eb]
                            rounded-[16px] p-8"
            >
              <div className="mb-8">
                <h1 className="text-xl font-bold text-forest-900 mb-1">
                  What best describes you?
                </h1>
                <p className="text-sm text-gray-500">
                  Your role determines what features are available to you. You
                  can change this later.
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, role: role.id }))
                    }
                    className={clsx(
                      "w-full text-left px-4 py-4 rounded-[10px] border",
                      "transition-all",
                      form.role === role.id
                        ? "border-forest-600 bg-forest-50 ring-1 ring-forest-300"
                        : "border-[#e5e7eb] hover:border-forest-200 hover:bg-forest-50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl leading-none mt-0.5">
                        {role.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">
                            {role.label}
                          </p>
                          {form.role === role.id && (
                            <CheckCircleIcon className="w-4 h-4 text-forest-700 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {role.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-sm
                             text-gray-500 border border-[#e5e7eb] px-4
                             py-2.5 rounded-[8px] hover:bg-gray-50
                             transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={loading || !form.role}
                  className="flex-1 inline-flex items-center justify-center
                             gap-2 bg-forest-900 text-white text-sm
                             font-medium px-4 py-2.5 rounded-[8px]
                             hover:bg-forest-800 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/*OTP verify*/}
          {step === 3 && (
            <div
              className="bg-white border border-[#e5e7eb]
                            rounded-[16px] p-8"
            >
              <div className="mb-8">
                <div
                  className="w-10 h-10 bg-forest-100 rounded-[10px]
                                flex items-center justify-center mb-4"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-forest-700" />
                </div>
                <h1 className="text-xl font-bold text-forest-900 mb-1">
                  Verify your email
                </h1>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-gray-700">
                    {form.email}
                  </span>
                  . Enter it below to activate your account.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                {/* OTP boxes */}
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`rotp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      autoFocus={index === 0}
                      className="w-12 h-14 text-center text-xl font-semibold
                                 text-forest-900 border border-[#e5e7eb]
                                 rounded-[10px] bg-[#f8f7f4] focus:outline-none
                                 focus:ring-2 focus:ring-forest-200
                                 focus:border-forest-400 focus:bg-white
                                 transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full inline-flex items-center justify-center
                             gap-2 bg-forest-900 text-white text-sm
                             font-medium px-4 py-2.5 rounded-[8px]
                             hover:bg-forest-800 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Activating account...
                    </>
                  ) : (
                    <>
                      Activate account
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend */}
              <div
                className="mt-6 pt-6 border-t border-[#f0efec]
                              flex items-center justify-between"
              >
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs
                             text-gray-400 hover:text-gray-600
                             transition-colors"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  Go back
                </button>
                <button
                  onClick={handleStep2Next}
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

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-forest-700 font-medium hover:underline"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
