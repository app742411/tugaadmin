"use client";

import React from "react";
import { useModerationFlags, useApproveFlag, useRejectFlag } from "@/hooks/useModeration";
import { ModerationFlag } from "@/types/moderation.types";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function ModerationPage() {
  const { flags, isLoading, error } = useModerationFlags();
  const { mutate: approveFlag, isPending: isApproving } = useApproveFlag();
  const { mutate: rejectFlag, isPending: isRejecting } = useRejectFlag();

  return (
    <>
      <PageBreadcrumb pageTitle="Moderation" />
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moderation Queue</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage flagged content reported by the system or users.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Error loading flags. Please try again.
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center p-16 bg-white dark:bg-gray-900/40 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center text-brand-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Caught Up!</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">There are no pending moderation flags requiring your attention at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {flags.map((flag: ModerationFlag) => (
              <div
                key={flag.id}
                className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group"
              >
                {/* Subtle indicator bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 dark:bg-amber-600" />

                <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
                  <div className="space-y-3 flex-1">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {flag.reason.replace(/_/g, ' ')}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Severity: {flag.severity}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5 ml-auto lg:ml-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(flag.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Detected Content */}
                    <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1 shrink-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Detected Content
                      </h4>
                      <p className="text-gray-900 dark:text-gray-100 font-medium text-sm md:text-base font-serif italic border-l-2 border-rose-300 dark:border-rose-700 pl-3">
                        "{flag.detectedText}"
                      </p>
                    </div>

                    {/* User & Context details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm pt-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs shrink-0 border border-brand-200 dark:border-brand-800">
                          {flag.user?.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold text-xs leading-tight">{flag.user?.fullName || 'Unknown User'}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">{flag.user?.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800">
                        <div className="text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <div>
                          <p className="text-gray-400 dark:text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Content Type</p>
                          <p className="text-gray-900 dark:text-gray-200 font-semibold text-[11px] capitalize">{flag.contentType.toLowerCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col justify-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t border-gray-100 dark:border-gray-800 lg:border-t-0 lg:border-l lg:pl-5 min-w-[140px]">
                    <button
                      onClick={() => approveFlag(flag.id)}
                      disabled={isRejecting || isApproving}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/20 rounded-lg transition-all disabled:opacity-50 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Approve
                    </button>
                    <button
                      onClick={() => rejectFlag(flag.id)}
                      disabled={isRejecting || isApproving}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/20 rounded-lg transition-all disabled:opacity-50 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
