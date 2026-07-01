"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, CheckCircleIcon } from "@/icons";
import Link from "next/link";
import { authService } from "@/services/authService";

export default function ResetPasswordForm() {
  const [step, setStep] = useState<"forgot" | "verify" | "reset" | "success">("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Countdown timer effect for Resend OTP cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // STEP 1: Request OTP / Forgot Password
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      setInfoMessage(response.message || "Verification OTP code sent! Please check your inbox.");
      setStep("verify");
      setCountdown(30); // Initialize 30-second cooldown
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const otpCode = otp.trim();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyForgotOtp(email.trim(), otpCode);
      if (!response.resetToken) {
        throw new Error("No reset token returned from server.");
      }
      setResetToken(response.resetToken);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2b: Resend OTP (with 30 seconds wait constraint)
  const handleResendOtp = async () => {
    if (countdown > 0) return; // Prevent triggers if timer is active
    
    setError(null);
    setInfoMessage(null);
    setIsResending(true);

    try {
      const response = await authService.resendForgotOtp(email.trim());
      setInfoMessage(response.message || "A new verification code has been sent.");
      setCountdown(30); // Reset timer to 30 seconds
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        resetToken,
        password,
        confirmPassword,
      });
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Back Navigation Helper
  const handleBack = () => {
    setError(null);
    setInfoMessage(null);
    if (step === "verify") {
      setStep("forgot");
      setOtp("");
    } else if (step === "reset") {
      setStep("verify");
      setPassword("");
      setConfirmPassword("");
    }
  };

  // Step Progress Bar rendering
  const renderStepIndicator = () => {
    if (step === "success") return null;
    const steps = [
      { id: "forgot", label: "Email" },
      { id: "verify", label: "Verify OTP" },
      { id: "reset", label: "New Password" },
    ];
    const currentIndex = steps.findIndex((s) => s.id === step);
    return (
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        {steps.map((s, idx) => {
          const isActive = idx <= currentIndex;
          return (
            <div key={s.id} className="flex-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  isActive ? "bg-[#1a2e05] dark:bg-brand-500" : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
              <p
                className={`text-[10px] font-bold mt-1.5 transition-colors duration-300 uppercase tracking-wider ${
                  idx === currentIndex
                    ? "text-[#1a2e05] dark:text-brand-400"
                    : idx < currentIndex
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      {/* Top Header Back Navigation */}
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        {step !== "success" && (
          step === "forgot" ? (
            <Link
              href="/signin"
              className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 gap-1"
            >
              <ChevronLeftIcon />
              Back to Sign In
            </Link>
          ) : (
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 gap-1 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeftIcon />
              Back
            </button>
          )
        )}
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="p-4 sm:p-0">
          {/* Visual Step Indicator */}
          {renderStepIndicator()}

          {/* Error Message Box */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold shadow-sm dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Success / Info Message Box */}
          {infoMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
              {infoMessage}
            </div>
          )}

          {/* STEP 1: Forgot Password Form */}
          {step === "forgot" && (
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-extrabold text-gray-900 text-title-sm dark:text-white sm:text-title-md tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your registered email address below, and we'll send you a 6-digit OTP code to verify your identity.
                </p>
              </div>

              <form onSubmit={handleRequestOtp}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email Address <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      error={!!error}
                    />
                  </div>
                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600"
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Verify OTP Form */}
          {step === "verify" && (
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-extrabold text-gray-900 text-title-sm dark:text-white sm:text-title-md tracking-tight">
                  Verify OTP Code
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please enter the 6-digit verification code we just sent to{" "}
                  <strong className="text-gray-800 dark:text-white">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      OTP Code <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="123456"
                      type="text"
                      className="tracking-[0.75em] font-mono text-center text-lg font-bold"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isLoading}
                      error={!!error}
                    />
                  </div>
                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600"
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Resend Link Section with 30s Countdown Cooldown */}
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Didn't receive the OTP? </span>
                {countdown > 0 ? (
                  <span className="font-bold text-gray-400 dark:text-gray-600 select-none inline-flex items-center gap-1">
                    Resend OTP ({countdown}s)
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading || isResending}
                    className="font-bold text-[#1a2e05] hover:text-[#243d07] dark:text-brand-400 dark:hover:text-brand-300 transition-colors disabled:opacity-55 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isResending ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Resending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Change Password Form */}
          {step === "reset" && (
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-extrabold text-gray-900 text-title-sm dark:text-white sm:text-title-md tracking-tight">
                  Choose New Password
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set a secure, strong password to verify and log back into your admin dashboard.
                </p>
              </div>

              <form onSubmit={handleResetPassword}>
                <div className="space-y-5">
                  <div>
                    <Label>
                      New Password <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      error={!!error}
                    />
                  </div>

                  <div>
                    <Label>
                      Confirm New Password <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      error={!!error}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600"
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Success Message Screen */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 mb-6 shadow-inner animate-bounce">
                <CheckCircleIcon className="w-12 h-12" />
              </div>
              <h1 className="mb-3 font-extrabold text-gray-900 text-title-sm dark:text-white sm:text-title-md tracking-tight">
                Password Reset Successfully!
              </h1>
              <p className="mb-8 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Your credentials have been securely updated. You can now use your new password to sign into your dashboard.
              </p>
              <Link href="/signin" className="w-full">
                <Button className="w-full bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
