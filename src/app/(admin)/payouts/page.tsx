"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function PayoutsComingSoonPage() {
  return (
    <div className="w-full pb-12">
      <PageBreadcrumb pageTitle="Payouts" />

      <div className="max-w-2xl mx-auto mt-10 text-center">
        {/* Glowing visual container */}
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/15 border border-green-100 dark:border-green-900/30">
          <div className="absolute inset-0 rounded-xl bg-green-500/10 blur-xl animate-pulse" />
          <svg
            className="w-14 h-14 text-green-500 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        {/* Coming Soon Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-green-600 bg-green-50 rounded-full dark:text-green-400 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 mb-4 select-none">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
          Coming Soon
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Payouts Control Center
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
          A financial command dashboard to manage payment distributions, verify Stripe Connect accounts, check automated billing triggers, and review merchant transaction history.
        </p>
      </div>
    </div>
  );
}
