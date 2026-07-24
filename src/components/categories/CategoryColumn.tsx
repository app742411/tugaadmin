"use client";

import React, { useState } from "react";
import { CategoryItem } from "@/types/category.types";
import CategoryCard, { resolveImage } from "./CategoryCard";

interface CategoryColumnProps {
  categories: CategoryItem[];
  isLoading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (category: CategoryItem) => void;
  onAdd: () => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (id: string) => Promise<void>;
}

const SkeletonCard = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 animate-pulse">
    <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
    </div>
  </div>
);

const CategoryColumn: React.FC<CategoryColumnProps> = ({
  categories,
  isLoading,
  error,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Categories</h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {isLoading ? "Loading..." : `${categories.length} total`}
            </p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1a2e05] dark:bg-brand-500 hover:bg-[#243d07] dark:hover:bg-brand-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <svg className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {search ? "No results found" : "No categories yet"}
            </p>
            {!search && (
              <button
                onClick={onAdd}
                className="mt-2 text-xs font-semibold text-brand-500 hover:text-brand-700 transition-colors"
              >
                + Create first category
              </button>
            )}
          </div>
        ) : (
          filtered.map((cat) => {
            const resolvedImg = resolveImage(cat);
            const isLuIcon = resolvedImg && resolvedImg.startsWith("Lu");
            const finalImageUrl = isLuIcon ? undefined : resolvedImg || undefined;
            const finalIcon = isLuIcon ? resolvedImg : cat.icon;

            return (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                imageUrl={finalImageUrl}
                icon={finalIcon}
                isSelected={selectedId === cat.id}
                isDeleting={deletingId === cat.id}
                onClick={() => onSelect(cat)}
                onEdit={() => onEdit(cat)}
                onDelete={async () => {
                  setDeletingId(cat.id);
                  try { await onDelete(cat.id); } finally { setDeletingId(null); }
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryColumn;
