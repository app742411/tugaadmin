"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function DisputesComingSoonPage() {
  return (
    <div className="w-full pb-12">
      <PageBreadcrumb pageTitle="Disputes" />

      <div className="max-w-2xl mx-auto mt-10 text-center">
        {/* Glowing visual container */}
        <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-xl animate-pulse" />
          <svg
            className="w-14 h-14 text-amber-500 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
        </div>

        {/* Coming Soon Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-amber-600 bg-amber-50 rounded-full dark:text-amber-400 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 mb-4 select-none">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          Coming Soon
        </span>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Disputes Mediation Center
        </h1>
        
        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
          A dedicated space for mediators to view contested jobs, inspect contract details, view message logs, and arbitrate resolutions between customers and traders.
        </p>
      </div>
    </div>
  );
}
