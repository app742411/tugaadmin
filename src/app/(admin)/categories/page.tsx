"use client";

import React, { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryColumn from "@/components/categories/CategoryColumn";
import SubCategoryColumn from "@/components/categories/SubCategoryColumn";
import SubSubCategoryColumn from "@/components/categories/SubSubCategoryColumn";
import CategoryModal from "@/components/categories/CategoryModal";
import { Modal } from "@/components/ui/modal";
import { useGetCategories, useGetSkillServices, useGetSubCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/useToast";
import { categoryService } from "@/services/categoryService";
import {
  CategoryItem,
  SkillServiceItem,
  SubCategoryItem,
  ModalConfig,
  ToastItem,
} from "@/types/category.types";

// ─── Toast Container ──────────────────────────────────────────────────────────
const toastStyles: Record<ToastItem["type"], string> = {
  success:
    "bg-white dark:bg-gray-900 border-l-4 border-green-500 text-gray-800 dark:text-white",
  error:
    "bg-white dark:bg-gray-900 border-l-4 border-red-500 text-gray-800 dark:text-white",
  info: "bg-white dark:bg-gray-900 border-l-4 border-blue-500 text-gray-800 dark:text-white",
  warning:
    "bg-white dark:bg-gray-900 border-l-4 border-yellow-500 text-gray-800 dark:text-white",
};

const toastIcons: Record<ToastItem["type"], React.JSX.Element> = {
  success: (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const queryClient = useQueryClient();

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedSkillService, setSelectedSkillService] = useState<SkillServiceItem | null>(null);

  // Modal state
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    level: "category",
    title: "Add New Category",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirm modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "category" | "skill-service" | "sub-category"; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data hooks (lazy loading enforced by the hooks themselves)
  const {
    categories,
    isLoading: catsLoading,
    error: catsError,
  } = useGetCategories();

  const {
    skillServices,
    isLoading: skillsLoading,
    error: skillsError,
  } = useGetSkillServices(selectedCategory?.id ?? null);

  const {
    subCategories,
    isLoading: subsLoading,
    error: subsError,
  } = useGetSubCategories(selectedSkillService?.id ?? null);

  // Automatically select the first category if none is selected or if the selected one is invalid
  React.useEffect(() => {
    if (categories && categories.length > 0) {
      const isSelectedValid = selectedCategory && categories.some((cat) => cat.id === selectedCategory.id);
      if (!isSelectedValid) {
        setSelectedCategory(categories[0]);
        setSelectedSkillService(null);
      }
    } else {
      setSelectedCategory(null);
      setSelectedSkillService(null);
    }
  }, [categories, selectedCategory]);

  // Automatically select the first skill service if none is selected or if the selected one is invalid
  React.useEffect(() => {
    if (skillServices && skillServices.length > 0) {
      const isSelectedValid = selectedSkillService && skillServices.some((skill) => skill.id === selectedSkillService.id);
      if (!isSelectedValid) {
        setSelectedSkillService(skillServices[0]);
      }
    } else {
      setSelectedSkillService(null);
    }
  }, [skillServices, selectedSkillService]);

  // Toast
  const { toasts, showToast, removeToast } = useToast();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectCategory = useCallback((cat: CategoryItem) => {
    setSelectedCategory(cat);
    setSelectedSkillService(null); // Reset child selection
  }, []);

  const handleSelectSkillService = useCallback((skill: SkillServiceItem) => {
    setSelectedSkillService(skill);
  }, []);

  // ── Delete (toggle) handlers ─────────────────────────────────────────────────

  const handleDeleteCategory = useCallback((id: string) => {
    const item = categories?.find((c) => c.id === id);
    const name = item ? item.name : "Category";
    setDeleteTarget({ id, type: "category", name });
    return Promise.resolve();
  }, [categories]);

  const handleDeleteSkillService = useCallback((id: string) => {
    const item = skillServices?.find((s) => s.id === id);
    const name = item ? item.name : "Skill Service";
    setDeleteTarget({ id, type: "skill-service", name });
    return Promise.resolve();
  }, [skillServices]);

  const handleDeleteSubCategory = useCallback((id: string) => {
    const item = subCategories?.find((s) => s.id === id);
    const name = item ? item.name : "Sub Category";
    setDeleteTarget({ id, type: "sub-category", name });
    return Promise.resolve();
  }, [subCategories]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "category") {
        await categoryService.toggleCategory(deleteTarget.id);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        if (selectedCategory?.id === deleteTarget.id) {
          setSelectedCategory(null);
          setSelectedSkillService(null);
        }
        showToast("success", `Category "${deleteTarget.name}" removed successfully.`);
      } else if (deleteTarget.type === "skill-service") {
        await categoryService.toggleSkillService(deleteTarget.id);
        queryClient.invalidateQueries({ queryKey: ["skillServices", selectedCategory?.id] });
        if (selectedSkillService?.id === deleteTarget.id) setSelectedSkillService(null);
        showToast("success", `Skill service "${deleteTarget.name}" removed successfully.`);
      } else if (deleteTarget.type === "sub-category") {
        await categoryService.toggleSubCategory(deleteTarget.id);
        queryClient.invalidateQueries({ queryKey: ["subCategories", selectedSkillService?.id] });
        showToast("success", `Sub category "${deleteTarget.name}" removed successfully.`);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("error", err?.message || `Failed to delete ${deleteTarget.type}.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = useCallback(
    (level: ModalConfig["level"]) => {
      const titles: Record<ModalConfig["level"], string> = {
        category: "Add New Category",
        "skill-service": "Add Skill Service",
        "sub-category": "Add Sub Category",
      };
      setModalConfig({
        isOpen: true,
        level,
        title: titles[level],
        parentCategoryId: selectedCategory?.id,
        parentSkillServiceId: selectedSkillService?.id,
      });
    },
    [selectedCategory, selectedSkillService]
  );

  // ── Edit modals ──────────────────────────────────────────────────────────────

  const openEditCategory = useCallback((item: CategoryItem) => {
    setModalConfig({
      isOpen: true,
      level: "category",
      title: "Edit Category",
      editId: item.id,
      editData: { name: item.name, imageUrl: item.image || item.imageUrl },
    });
  }, []);

  const openEditSkillService = useCallback((item: SkillServiceItem) => {
    setModalConfig({
      isOpen: true,
      level: "skill-service",
      title: "Edit Skill Service",
      editId: item.id,
      editData: { name: item.name, imageUrl: item.image || item.imageUrl },
    });
  }, []);

  const openEditSubCategory = useCallback((item: SubCategoryItem) => {
    setModalConfig({
      isOpen: true,
      level: "sub-category",
      title: "Edit Sub Category",
      editId: item.id,
      editData: { name: item.name, imageUrl: item.image || item.imageUrl },
    });
  }, []);

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  }, [isSubmitting]);

  const handleSubmit = useCallback(
    async (name: string, image: File | null, config: ModalConfig) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      try {
        // ── EDIT mode ─────────────────────────────────────────────────────────
        if (config.editId) {
          if (config.level === "category") {
            const updated = await categoryService.updateCategory(config.editId, formData);
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            if (selectedCategory?.id === config.editId) setSelectedCategory((p) => p ? { ...p, ...updated } : p);
            showToast("success", `Category "${name}" updated!`);
          } else if (config.level === "skill-service") {
            const updated = await categoryService.updateSkillService(config.editId, formData);
            queryClient.invalidateQueries({ queryKey: ["skillServices", selectedCategory?.id] });
            if (selectedSkillService?.id === config.editId) setSelectedSkillService((p) => p ? { ...p, ...updated } : p);
            showToast("success", `Skill Service "${name}" updated!`);
          } else if (config.level === "sub-category") {
            await categoryService.updateSubCategory(config.editId, formData);
            queryClient.invalidateQueries({ queryKey: ["subCategories", selectedSkillService?.id] });
            showToast("success", `Sub Category "${name}" updated!`);
          }
          closeModal();
          return;
        }

        // ── CREATE mode ───────────────────────────────────────────────────────
        if (config.level === "category") {
          await categoryService.createCategory(formData);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          showToast("success", `Category "${name}" created!`);
        } else if (config.level === "skill-service") {
          if (!config.parentCategoryId) {
            showToast("error", "No parent category selected.");
            return;
          }
          formData.append("categoryId", config.parentCategoryId);
          await categoryService.createSkillService(formData);
          queryClient.invalidateQueries({ queryKey: ["skillServices", config.parentCategoryId] });
          showToast("success", `Skill Service "${name}" created!`);
        } else if (config.level === "sub-category") {
          if (!config.parentSkillServiceId) {
            showToast("error", "No parent skill service selected.");
            return;
          }
          formData.append("skillServiceId", config.parentSkillServiceId);
          await categoryService.createSubCategory(formData);
          queryClient.invalidateQueries({ queryKey: ["subCategories", config.parentSkillServiceId] });
          showToast("success", `Sub Category "${name}" created!`);
        }

        closeModal();
      } catch (err: any) {
        showToast(
          "error",
          err?.message || "Failed to create item. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [closeModal, selectedCategory, selectedSkillService, showToast, queryClient]
  );

  // ── Breadcrumb path display ──────────────────────────────────────────────────
  const breadcrumbPath = [
    selectedCategory?.name,
    selectedSkillService?.name,
  ]
    .filter(Boolean)
    .join(" → ");

  return (
    <div className="w-full pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <PageBreadcrumb pageTitle="Category Management" />
          {breadcrumbPath && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5">
              {breadcrumbPath}
            </p>
          )}
        </div>

        {/* Level legend */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {[
            { label: "Categories", color: "bg-emerald-500" },
            { label: "Skill Services", color: "bg-blue-500" },
            { label: "Sub Categories", color: "bg-purple-500" },
          ].map((l) => (
            <span
              key={l.label}
              className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400"
            >
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* 3-Column Panel */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5"
        style={{ height: "calc(100vh - 220px)", minHeight: "520px" }}
      >
        {/* Column 1: Main Categories */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col border-t-4 border-t-emerald-500">
          <CategoryColumn
            categories={categories}
            isLoading={catsLoading}
            error={catsError}
            selectedId={selectedCategory?.id ?? null}
            onSelect={handleSelectCategory}
            onAdd={() => openModal("category")}
            onEdit={openEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>

        {/* Column 2: Skill Services */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col border-t-4 border-t-blue-500">
          <SubCategoryColumn
            selectedCategory={selectedCategory}
            skillServices={skillServices}
            isLoading={skillsLoading}
            error={skillsError}
            selectedId={selectedSkillService?.id ?? null}
            onSelect={handleSelectSkillService}
            onAdd={() => openModal("skill-service")}
            onEdit={openEditSkillService}
            onDelete={handleDeleteSkillService}
          />
        </div>

        {/* Column 3: Sub Categories */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden flex flex-col border-t-4 border-t-purple-500">
          <SubSubCategoryColumn
            selectedSkillService={selectedSkillService}
            subCategories={subCategories}
            isLoading={subsLoading}
            error={subsError}
            onAdd={() => openModal("sub-category")}
            onEdit={openEditSubCategory}
            onDelete={handleDeleteSubCategory}
          />
        </div>
      </div>

      {/* Modal */}
      <CategoryModal
        config={modalConfig}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Confirmation Modal: Delete Category/Skill/Subcategory */}
      <Modal isOpen={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)} className="max-w-md p-6" showCloseButton={false}>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          Delete {deleteTarget?.type === "category" ? "Category" : deleteTarget?.type === "skill-service" ? "Skill Service" : "Sub Category"}
        </h4>
        <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed mb-5">
          Are you sure you want to permanently delete <strong className="text-gray-855 dark:text-white">{deleteTarget?.name}</strong>? All sub-levels and associated records under this category path will be affected.
        </p>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50 dark:border-gray-850">
          <button
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-755 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting && (
              <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Confirm Delete
          </button>
        </div>
      </Modal>

      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800
              max-w-sm w-full pointer-events-auto
              ${toastStyles[toast.type]}
            `}
          >
            {toastIcons[toast.type]}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
