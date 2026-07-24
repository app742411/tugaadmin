"use client";

import React, { useEffect } from "react";
import { ModalConfig } from "@/types/category.types";
import CategoryForm from "./CategoryForm";

interface CategoryModalProps {
  config: ModalConfig;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (name: string, image: File | null, config: ModalConfig, icon?: string) => Promise<void>;
}

const levelBadgeColor: Record<string, string> = {
  category: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "skill-service": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "sub-category": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const levelBadgeLabel: Record<string, string> = {
  category: "Level 1",
  "skill-service": "Level 2",
  "sub-category": "Level 3",
};

const CategoryModal: React.FC<CategoryModalProps> = ({
  config,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const isEditMode = !!config.editId;

  // Lock page scroll while open
  useEffect(() => {
    if (config.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [config.isOpen]);

  if (!config.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${levelBadgeColor[config.level] || levelBadgeColor.category
                  }`}
              >
                {levelBadgeLabel[config.level] || "Level 1"}
              </span>
              {isEditMode && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Edit
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {config.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isEditMode
                ? "Update the details below. Leave image empty to keep current."
                : "Fill in the details below and upload an image."}
            </p>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            className="flex-shrink-0 ml-3 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <CategoryForm
            key={`${config.level}-${config.editId ?? "new"}-${config.parentCategoryId}-${config.parentSkillServiceId}`}
            level={config.level}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            initialName={config.editData?.name ?? ""}
            initialImageUrl={config.editData?.imageUrl}
            initialIcon={config.editData?.icon}
            onSubmit={(name, image, icon) => onSubmit(name, image, config, icon)}
            onCancel={() => !isSubmitting && onClose()}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
