"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, CheckCircleIcon } from "@/icons";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";

export default function ResetPasswordForm() {
  const router = useRouter();
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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
      setIsSuccess(true);
      setTimeout(() => {
        setResetToken(response.resetToken);
        setStep("reset");
        setIsSuccess(false);
      }, 1000);
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
    if (step === "verify" || step === "reset") {
      setIsCancelModalOpen(true);
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
                className={`h-1 rounded-full transition-all duration-300 ${isActive ? "bg-[#1a2e05] dark:bg-brand-500" : "bg-gray-200 dark:bg-gray-800"
                  }`}
              />
              <p
                className={`text-[10px] font-bold mt-1.5 transition-colors duration-300 uppercase tracking-wider ${idx === currentIndex
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
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
                    <div className="flex gap-2 justify-center sm:justify-between w-full">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="relative w-12 h-14 sm:w-14 sm:h-16">
                          <input
                            id={`otp-input-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`w-full h-full text-center text-xl font-bold rounded-xl outline-none transition-all border-2
                              ${error ? 'border-red-500 text-transparent bg-red-50 focus:border-red-600' :
                                isSuccess ? 'border-green-500 text-transparent bg-green-50' :
                                  isLoading ? 'border-brand-500/50 bg-brand-50 text-brand-700 animate-pulse' :
                                    'border-gray-200 bg-gray-50 focus:border-brand-500 focus:bg-white text-gray-900'}
                              ${isLoading || isSuccess ? 'cursor-not-allowed opacity-70' : ''}
                            `}
                            value={otp[index] || ""}
                            disabled={isLoading || isSuccess}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, ""); // Strip non-numeric
                              if (!val && e.target.value) return; // Prevent typing letters entirely
                              if (error) setError(null);

                              if (val) {
                                const newOtp = otp.substring(0, index) + val + otp.substring(index + 1);
                                setOtp(newOtp.slice(0, 6));
                                // Move to next input
                                if (index < 5) {
                                  const nextInput = document.getElementById(`otp-input-${index + 1}`);
                                  nextInput?.focus();
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace") {
                                if (!otp[index] && index > 0) {
                                  // If empty, delete previous and move back
                                  const newOtp = otp.substring(0, index - 1) + otp.substring(index);
                                  setOtp(newOtp);
                                  const prevInput = document.getElementById(`otp-input-${index - 1}`);
                                  prevInput?.focus();
                                } else {
                                  // Just delete current
                                  const newOtp = otp.substring(0, index) + otp.substring(index + 1);
                                  setOtp(newOtp);
                                  if (error) setError(null);
                                }
                              } else if (e.key === "ArrowLeft" && index > 0) {
                                document.getElementById(`otp-input-${index - 1}`)?.focus();
                              } else if (e.key === "ArrowRight" && index < 5) {
                                document.getElementById(`otp-input-${index + 1}`)?.focus();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                              if (pasted) {
                                setOtp(pasted);
                                if (error) setError(null);
                                // Focus the last filled input
                                const focusIndex = Math.min(pasted.length, 5);
                                document.getElementById(`otp-input-${focusIndex}`)?.focus();
                              }
                            }}
                          />
                          {/* Visual Icons */}
                          {error && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </div>
                          )}
                          {isSuccess && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
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
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
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

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} className="max-w-[400px]">
        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 mb-5 border border-amber-200 dark:border-amber-500/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Cancel Password Reset?
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to cancel the password reset process? You will need to request a new code if you decide to reset it later.
          </p>

          <div className="flex flex-col sm:flex-row items-center w-full gap-3">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="w-full h-12 font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200"
            >
              No, continue
            </button>
            <button
              onClick={() => router.push("/signin")}
              className="w-full h-12 font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 focus:ring-4 focus:ring-amber-500/20 transition-all duration-200 shadow-sm shadow-amber-500/20"
            >
              Yes, cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
