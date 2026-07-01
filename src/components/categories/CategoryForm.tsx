"use client";

import React, { useState, useRef } from "react";
import { CategoryLevel } from "@/types/category.types";

interface CategoryFormProps {
  level: CategoryLevel;
  isSubmitting: boolean;
  isEditMode?: boolean;
  initialName?: string;
  initialImageUrl?: string;
  onSubmit: (name: string, image: File | null) => Promise<void>;
  onCancel: () => void;
}

const levelMeta: Record<CategoryLevel, { label: string; placeholder: string }> = {
  category: { label: "Category Name", placeholder: "e.g. Home Improvement" },
  "skill-service": { label: "Skill Service Name", placeholder: "e.g. Plumbing Services" },
  "sub-category": { label: "Sub Category Name", placeholder: "e.g. Emergency Pipe Repair" },
};

const CategoryForm: React.FC<CategoryFormProps> = ({
  level,
  isSubmitting,
  isEditMode = false,
  initialName = "",
  initialImageUrl,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; image?: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const meta = levelMeta[level];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Please select a valid image (PNG, JPG, WebP)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Image must be smaller than 5 MB" }));
      return;
    }
    setImage(file);
    if (preview && !initialImageUrl) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, image: undefined }));
  };

  const validate = () => {
    const e: { name?: string; image?: string } = {};
    if (!name.trim()) e.name = "Name is required";
    // In edit mode, image is optional (keep existing if not changed)
    // if (!isEditMode && !image) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(name.trim(), image);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {meta.label} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          placeholder={meta.placeholder}
          disabled={isSubmitting}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm border transition-colors
            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-600
            focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500
            disabled:opacity-60 disabled:cursor-not-allowed
            ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-800"}
          `}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>
        )}
      </div>

      {/* Image Upload commented out per request
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Image {!isEditMode && <span className="text-red-500">*</span>}
          {isEditMode && <span className="text-gray-400 font-normal text-xs ml-1">(leave empty to keep current)</span>}
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => !isSubmitting && inputRef.current?.click()}
          className={`
            relative rounded-xl overflow-hidden cursor-pointer border-2 border-dashed
            min-h-[140px] flex flex-col items-center justify-center
            transition-all duration-200
            ${isSubmitting ? "pointer-events-none opacity-60" : ""}
            ${isDragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/15"
              : errors.image
              ? "border-red-400 bg-red-50/50 dark:bg-red-900/5"
              : "border-gray-300 dark:border-gray-700 hover:border-brand-400 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-brand-50/30 dark:hover:bg-brand-900/5"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {preview ? (
            <>
              <img src={preview} alt="preview" className="w-full h-36 object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors">
                <span className="opacity-0 hover:opacity-100 text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full transition-opacity">
                  Click to replace
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center pointer-events-none">
              <svg className="w-9 h-9 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  PNG, JPG, WebP — max 5 MB
                </p>
              </div>
            </div>
          )}
        </div>

        {errors.image && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.image}
          </p>
        )}
      </div>
      */}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a2e05] dark:bg-brand-500 hover:bg-[#243d07] dark:hover:bg-brand-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
