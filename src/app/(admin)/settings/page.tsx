"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oldPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      // Show a success message
      showToast("success", "Password changed successfully! Please log back in.");
      
      // Perform clean logout to invalidate tokens in storage and redirect to /signin
      await authService.logout();
    } catch (err: any) {
      setError(err?.message || "Failed to change password. Please verify your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <PageBreadcrumb pageTitle="Settings" />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
          Configure security settings and update your dashboard access credentials.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-sm border-t-4 border-t-brand-500">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Change Password
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              For security, do not share your password with others. After a successful change, you will be prompted to sign in again.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold shadow-sm dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <Label>
                Current Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isLoading}
                error={!!error}
              />
            </div>

            {/* New Password */}
            <div>
              <Label>
                New Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Create secure new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                error={!!error}
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <Label>
                Confirm New Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Confirm secure new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                error={!!error}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1a2e05] hover:bg-[#243d07] dark:bg-brand-500 dark:hover:bg-brand-600 text-white cursor-pointer font-semibold shadow-sm flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Changing Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
