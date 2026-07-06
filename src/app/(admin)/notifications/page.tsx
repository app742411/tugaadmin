"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useNotifications, useReadAllNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/types/notification.types";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { notifications, pagination, isLoading, error } = useNotifications(page, 20);
  const { mutate: readAll } = useReadAllNotifications();

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yr ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hr ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return Math.floor(seconds) + " sec ago";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TRADER_CATEGORY_CHANGE_REQUEST":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-500 dark:bg-blue-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
          </div>
        );
      case "JOB_MANUAL_REVIEW":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        );
      case "TRADER_PAYMENT_COMPLETED":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-500 dark:bg-green-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        );
      case "TRADER_VERIFICATION":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-500 dark:bg-purple-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
        );
    }
  };

  const getNotificationUrl = (item: NotificationItem) => {
    switch (item.type) {
      case "TRADER_CATEGORY_CHANGE_REQUEST":
        return "/categories-requests";
      case "JOB_MANUAL_REVIEW":
        return "/jobs/manual-review";
      case "TRADER_PAYMENT_COMPLETED":
      case "TRADER_VERIFICATION":
        return `/traders`;
      default:
        return "#";
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Notifications" />
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold">All Notifications</h1>
          <button 
            onClick={() => readAll()} 
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Mark All as Read
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 rounded-lg bg-red-50">
            Error loading notifications.
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            You don't have any notifications.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((item: NotificationItem) => (
                <li key={item.id}>
                  <Link href={getNotificationUrl(item)} className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors dark:hover:bg-white/5 ${!item.isRead ? 'bg-blue-50/30 dark:bg-brand-900/10' : ''}`}>
                    <div className="shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <span className="text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.body}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                          {item.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    {!item.isRead && (
                      <div className="w-2.5 h-2.5 mt-2 bg-brand-500 rounded-full shadow-sm shrink-0"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={handleNextPage}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
