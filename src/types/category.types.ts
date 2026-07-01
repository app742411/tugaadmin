// ─── Core Data Models ──────────────────────────────────────────────────────────

export interface CategoryItem {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillServiceItem {
  id: string;
  categoryId: string;
  name: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategoryItem {
  id: string;
  skillServiceId: string;
  name: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiListResponse<T> {
  data: T[];
  message?: string;
  total?: number;
}

export interface ApiItemResponse<T> {
  data: T;
  message?: string;
}

export type CategoriesResponse = ApiListResponse<CategoryItem>;
export type SkillServicesResponse = ApiListResponse<SkillServiceItem>;
export type SubCategoriesResponse = ApiListResponse<SubCategoryItem>;

export type CreateCategoryResponse = ApiItemResponse<CategoryItem>;
export type CreateSkillServiceResponse = ApiItemResponse<SkillServiceItem>;
export type CreateSubCategoryResponse = ApiItemResponse<SubCategoryItem>;

// ─── UI State Types ────────────────────────────────────────────────────────────

export type CategoryLevel = "category" | "skill-service" | "sub-category";

export interface ModalConfig {
  isOpen: boolean;
  level: CategoryLevel;
  title: string;
  parentCategoryId?: string;
  parentSkillServiceId?: string;
  /** Set when editing an existing item */
  editId?: string;
  editData?: { name: string; imageUrl?: string };
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}
