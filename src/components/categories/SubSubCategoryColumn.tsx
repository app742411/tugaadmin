"use client";

import React, { useState } from "react";
import { SkillServiceItem, SubCategoryItem } from "@/types/category.types";
import CategoryCard, { resolveImage } from "./CategoryCard";

interface SubSubCategoryColumnProps {
  selectedSkillService: SkillServiceItem | null;
  subCategories: SubCategoryItem[];
  isLoading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (sub: SubCategoryItem) => void;
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

const SubSubCategoryColumn: React.FC<SubSubCategoryColumnProps> = ({
  selectedSkillService,
  subCategories,
  isLoading,
  error,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = subCategories.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Idle state when no skill service is selected ─────────────────────────────
  if (!selectedSkillService) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sub Categories</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Sub sub categories</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Select a Skill Service</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Sub categories will load when you pick a skill service
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sub Categories</h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              under{" "}
              <span className="text-brand-600 dark:text-brand-400 font-semibold">
                {selectedSkillService.name}
              </span>
            </p>
          </div>
          <button
            onClick={onAdd}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1a2e05] dark:bg-brand-500 hover:bg-[#243d07] dark:hover:bg-brand-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
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
            placeholder="Search sub categories..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <svg className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {search ? "No results found" : "No sub categories yet"}
            </p>
            {!search && (
              <button
                onClick={onAdd}
                className="mt-2 text-xs font-semibold text-brand-500 hover:text-brand-700 transition-colors"
              >
                + Add first sub category
              </button>
            )}
          </div>
        ) : (
          filtered.map((sub) => {
            const resolvedImg = resolveImage(sub);
            const isLuIcon = resolvedImg && resolvedImg.startsWith("Lu");
            const finalImageUrl = isLuIcon ? undefined : resolvedImg || undefined;
            const finalIcon = isLuIcon ? resolvedImg : undefined;

            return (
              <CategoryCard
                key={sub.id}
                id={sub.id}
                name={sub.name}
                imageUrl={finalImageUrl}
                icon={finalIcon}
                hideThumbnail={true}
                isSelected={selectedId === sub.id}
                isDeleting={deletingId === sub.id}
                onClick={() => setSelectedId(sub.id)}
                onEdit={() => onEdit(sub)}
                onDelete={async () => {
                  setDeletingId(sub.id);
                  try { await onDelete(sub.id); } finally { setDeletingId(null); }
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubSubCategoryColumn;
