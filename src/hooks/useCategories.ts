"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import { CategoryItem, SkillServiceItem, SubCategoryItem } from "@/types/category.types";

// ─── useGetCategories ─────────────────────────────────────────────────────────
export const useGetCategories = () => {
  const { data = [], isLoading, error, refetch } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  return {
    categories: data,
    isLoading,
    error: error ? (error as any).message || "Failed to load categories" : null,
    refetch,
  };
};

// ─── useGetSkillServices ──────────────────────────────────────────────────────
// Lazy — only fires when categoryId is provided (i.e. user selects a category)
export const useGetSkillServices = (categoryId: string | null) => {
  const { data = [], isLoading, error, refetch } = useQuery<SkillServiceItem[]>({
    queryKey: ["skillServices", categoryId],
    queryFn: () => categoryService.getSkillServices(categoryId!),
    enabled: !!categoryId,
  });

  return {
    skillServices: data,
    isLoading,
    error: error ? (error as any).message || "Failed to load skill services" : null,
    refetch,
  };
};

// ─── useGetSubCategories ──────────────────────────────────────────────────────
// Lazy — only fires when skillServiceId is provided
export const useGetSubCategories = (skillServiceId: string | null) => {
  const { data = [], isLoading, error, refetch } = useQuery<SubCategoryItem[]>({
    queryKey: ["subCategories", skillServiceId],
    queryFn: () => categoryService.getSubCategories(skillServiceId!),
    enabled: !!skillServiceId,
  });

  return {
    subCategories: data,
    isLoading,
    error: error ? (error as any).message || "Failed to load sub categories" : null,
    refetch,
  };
};
