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
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Moderation Flags</h1>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 rounded-lg bg-red-50">
            Error loading flags. Please try again.
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            No pending moderation flags found.
          </div>
        ) : (
          <div className="grid gap-4">
            {flags.map((flag: ModerationFlag) => (
              <div
                key={flag.id}
                className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-gray-900 dark:border-gray-800"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {flag.reason}
                    </span>
                    <span className="text-sm text-gray-500">
                      Severity: {flag.severity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(flag.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-gray-800 dark:text-gray-200 mb-2 font-medium">
                    Detected Text: <span className="text-red-500 font-mono bg-red-50 dark:bg-red-900/20 px-1 rounded">"{flag.detectedText}"</span>
                  </p>

                  <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>User: {flag.user?.fullName} ({flag.user?.email})</span>
                    <span>Content Type: {flag.contentType}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => rejectFlag(flag.id)}
                    disabled={isRejecting || isApproving}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reject Content
                  </button>
                  <button
                    onClick={() => approveFlag(flag.id)}
                    disabled={isRejecting || isApproving}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Approve Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
