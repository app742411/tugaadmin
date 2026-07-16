"use client";

import React, { useState, useMemo, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/ui/pagination/Pagination";
import { useGetFaqs, useCreateFaq, useUpdateFaq, useDeleteFaq } from "@/hooks/useFaqs";

export default function FaqsPageClient() {
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<string>("CUSTOMER");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      limit,
      audience: activeAudienceFilter,
    };
  }, [currentPage, limit, activeAudienceFilter]);

  const { data: faqsList, pagination: paginationInfo, isLoading, error, refetch } = useGetFaqs(queryParams);
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const deleteMutation = useDeleteFaq();

  // Form Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [audience, setAudience] = useState<"CUSTOMER" | "TRADER" | "BOTH" | string>("CUSTOMER");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Filter & sort FAQs
  const processedFaqs = useMemo(() => {
    let list = [...faqsList];
    // Sort by sortOrder ascending, then by createdAt descending
    return list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [faqsList]);

  // Adjust pagination if page exceeds totalPages (e.g. after deletion)
  useEffect(() => {
    const totalPages = paginationInfo.totalPages;
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [paginationInfo.totalPages, currentPage]);

  // Toggle accordion expand/collapse
  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleSubmitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!question.trim()) {
      setFormError("Please enter a question.");
      return;
    }
    if (!answer.trim()) {
      setFormError("Please enter an answer.");
      return;
    }

    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        audience,
        isActive,
        sortOrder: Number(sortOrder) || 1,
      };

      if (editingFaqId) {
        await updateMutation.mutateAsync({
          id: editingFaqId,
          data: payload,
        });
        setFormSuccess("FAQ entry updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        setFormSuccess("FAQ entry added successfully!");
      }

      // Reset form
      setQuestion("");
      setAnswer("");
      setAudience("CUSTOMER");
      setSortOrder(1);
      setIsActive(true);
      setEditingFaqId(null);

      setTimeout(() => {
        setIsCreateOpen(false);
        setFormSuccess(null);
        refetch();
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || `Failed to ${editingFaqId ? "update" : "create"} FAQ entry.`);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to delete FAQ entry.");
    }
  };

  const getAudienceColor = (aud: string): "info" | "warning" | "success" | "light" => {
    switch (aud) {
      case "CUSTOMER":
        return "info";
      case "TRADER":
        return "warning";
      case "BOTH":
        return "success";
      default:
        return "light";
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle="FAQs Management" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
            Configure Frequently Asked Questions displayed to clients and traders.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setFormSuccess(null);
            setQuestion("");
            setAnswer("");
            setAudience("CUSTOMER");
            setSortOrder(1);
            setIsActive(true);
            setEditingFaqId(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add New FAQ
        </button>
      </div>

      {/* Audience Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-px max-w-3xl mx-auto">
        {[
          { value: "BOTH", label: "Both" },
          { value: "CUSTOMER", label: "Customers Only" },
          { value: "TRADER", label: "Traders Only" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveAudienceFilter(tab.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeAudienceFilter === tab.value
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQs Collapsible List Container */}
      <div className="space-y-3.5 max-w-3xl mx-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
          ))
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xs">
            <p className="text-sm font-semibold">Failed to fetch FAQs</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : processedFaqs.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xs">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">No FAQs Configured for this Audience</p>
            <p className="text-[11px] mt-1 text-gray-400">Click the Add button to create one.</p>
          </div>
        ) : (
          processedFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;

            // Left border accent color depending on audience
            let borderAccent = "border-l-transparent";
            if (faq.audience === "CUSTOMER") borderAccent = "border-l-blue-500";
            else if (faq.audience === "TRADER") borderAccent = "border-l-amber-500";
            else if (faq.audience === "BOTH") borderAccent = "border-l-emerald-500";

            return (
              <div
                key={faq.id}
                className={`bg-white dark:bg-gray-900 border ${isExpanded
                  ? "border-gray-200 dark:border-gray-700 shadow-sm"
                  : "border-gray-100 dark:border-gray-800 shadow-xs"
                  } border-l-4 ${borderAccent} rounded-xl overflow-hidden hover:border-gray-200 dark:hover:border-gray-750 transition-all duration-200`}
              >
                {/* Accordion Trigger Head */}
                <div
                  onClick={() => toggleFaq(faq.id)}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${isExpanded ? "bg-gray-50/40 dark:bg-gray-850/10" : ""
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg shrink-0">
                      #{faq.sortOrder}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white leading-snug truncate max-w-lg sm:max-w-xl md:max-w-2xl">
                      {faq.question}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge size="xs" color={getAudienceColor(faq.audience)}>
                        {faq.audience}
                      </Badge>
                      <Badge size="xs" color={faq.isActive ? "success" : "light"} variant={faq.isActive ? "solid" : "light"}>
                        {faq.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setFormError(null);
                        setFormSuccess(null);
                        setQuestion(faq.question);
                        setAnswer(faq.answer);
                        setAudience(faq.audience);
                        setSortOrder(faq.sortOrder);
                        setIsActive(faq.isActive);
                        setEditingFaqId(faq.id);
                        setIsCreateOpen(true);
                      }}
                      className="text-gray-400 hover:text-brand-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      title="Edit FAQ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      title="Delete FAQ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Collapsible Answer Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/5">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal pt-2">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination component */}
      {processedFaqs.length > 0 && (
        <div className="mt-6 max-w-3xl mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.total}
            limit={limit}
            onPageChange={(page) => setCurrentPage(page)}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setCurrentPage(1);
            }}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Creation Modal Form */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} className="max-w-lg p-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          {editingFaqId ? "Edit FAQ Entry" : "Add FAQ Entry"}
        </h3>

        {formError && (
          <div className="p-2.5 bg-rose-50 border border-rose-150 text-rose-605 rounded-xl text-xs font-semibold mb-4">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-150 text-emerald-650 rounded-xl text-xs font-semibold mb-4">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmitFaq} className="space-y-4">
          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Question</label>
            <textarea
              rows={2}
              placeholder="e.g. How do I create an account?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/25 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition resize-none"
            />
          </div>

          {/* Answer */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Answer</label>
            <textarea
              rows={4}
              placeholder="Provide the FAQ answer description..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/25 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition resize-none"
            />
          </div>

          {/* Audience, sortOrder & isActive row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/25 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="TRADER">Trader</option>
                <option value="BOTH">Both / Global</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Sort Order</label>
              <input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950/25 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>

            <div className="flex flex-col justify-end pb-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-255 text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                />
                Is Active
              </label>
            </div>
          </div>

          {/* Action footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-850/50">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 py-2.5 bg-gray-55/15 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              {editingFaqId
                ? (updateMutation.isPending ? "Saving..." : "Save Changes")
                : (createMutation.isPending ? "Adding..." : "Add Entry")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
