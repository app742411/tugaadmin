"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function MessagesComingSoonPage() {
  return (
    <div className="w-full pb-12">
      <PageBreadcrumb pageTitle="Messages" />

      <div className="max-w-2xl mx-auto mt-10 text-center">
        {/* Glowing visual container */}
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/30">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-xl animate-pulse" />
          <svg
            className="w-14 h-14 text-blue-500 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        {/* Coming Soon Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-full dark:text-blue-400 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 mb-4 select-none">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
          Coming Soon
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Platform Messaging System
        </h1>
        
        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
          A real-time messaging monitor to inspect user conversation logs, trace quote adjustments, filter attachment uploads for security compliance, and support mediator dispute audits.
        </p>
      </div>
    </div>
  );
}
