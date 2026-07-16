"use client";
import React, { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { useToast } from "@/hooks/useToast";

export default function ChangePasswordCard() {
  const { toasts, showToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showToast("warning", "Please fill in all fields.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("error", "New password and confirmation do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      showToast("success", "Password changed successfully! (Simulated)");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5 lg:mb-6">
        Change Password
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              name="newPassword"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>

      {/* Floating Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3.5 px-4.5 py-3 rounded-2xl shadow-xl border border-gray-250/90 dark:border-gray-805/90 max-w-sm w-full pointer-events-auto transition-all duration-300 bg-white dark:bg-gray-900/95 text-gray-800 dark:text-white"
          >
            <span className="text-xs font-bold flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
