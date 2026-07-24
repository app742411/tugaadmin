"use client";
import Checkbox from "@/components/form/input/Checkbox";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Success redirect to dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-[420px] bg-white rounded-xl sm:shadow-[0_8px_40px_rgb(0,0,0,0.04)] sm:p-10 border border-gray-100/50">

        {/* Logo Section */}
        <div className="flex items-center gap-2 mb-8">
          <Image src="/images/logo/logo-icon.svg" alt="TugaTrades Logo" width={36} height={36} className="shrink-0" />
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Tuga<span className="text-[#648b26]">Trades</span></span>
        </div>

        {/* Heading Section */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900 mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Access your account and manage your jobs easily
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              placeholder="admin@example.com"
              className="w-full h-12 px-4 rounded-xl bg-[#F0F4FA] border border-[#E2E8F0] focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium text-gray-900 placeholder-gray-500 disabled:opacity-70"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full h-12 pl-4 pr-12 rounded-xl bg-[#F0F4FA] border border-[#E2E8F0] focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium text-gray-900 placeholder-gray-500 disabled:opacity-70 tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeIcon className="fill-current w-5 h-5" />
                ) : (
                  <EyeCloseIcon className="fill-current w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex justify-end mt-1">
              <Link
                href="/reset-password"
                className="text-[13px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Remember Me */}
          {/* <div className="flex items-center gap-3 pt-2">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <span className="block font-semibold text-gray-600 text-sm">
              Remember me
            </span>
          </div> */}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#243d07] hover:bg-[#1a2e05] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
