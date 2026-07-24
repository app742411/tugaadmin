"use client";

import React from "react";

interface CategoryCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: string;
  isSelected?: boolean;
  isDeleting?: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hideThumbnail?: boolean;
}

import * as LuIcons from "react-icons/lu";

/** Resolve the best available image URL from either field name the API sends */
export const resolveImage = (item: { image?: string; imageUrl?: string }): string | null => {
  const url = item.image || item.imageUrl;
  if (!url) return null;
  if (url.startsWith("Lu")) return url;
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return url.startsWith("/")
    ? `${cleanBaseUrl}${url}`
    : `${cleanBaseUrl}/${url}`;
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  imageUrl,
  icon,
  isSelected = false,
  isDeleting = false,
  onClick,
  onEdit,
  onDelete,
  hideThumbnail = false,
}) => {
  return (
    <div className="relative group/row">
      <button
        onClick={onClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
          border transition-all duration-150 group
          ${(onDelete || onEdit) ? "pr-16" : ""}
          ${isSelected
            ? "!bg-[#1a2e05] !border-[#2d4d0a] !text-white hover:!bg-[#2d4d0a] dark:!bg-brand-500 dark:!border-brand-400 dark:hover:!bg-brand-600"
            : "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-white/[0.04]"
          }
        `}
      >
        {!hideThumbnail && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-xs font-bold
                  ${isSelected
                    ? "!bg-white/10 !text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {icon && (LuIcons as any)[icon] && (
          <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {React.createElement((LuIcons as any)[icon], { className: "w-4 h-4" })}
          </div>
        )}

        {/* Name */}
        <span
          className={`flex-1 min-w-0 text-xs font-medium truncate
            ${isSelected ? "!text-white" : "text-gray-800 dark:text-white/90"}`}
        >
          {name}
        </span>

        {/* Arrow (hidden when delete button is shown) */}
        {!onDelete && (
          <svg
            className={`flex-shrink-0 w-3.5 h-3.5 transition-colors
              ${isSelected ? "!text-white/50" : "text-gray-300 group-hover:text-brand-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Action buttons — appear on row hover */}
      {(onEdit || onDelete) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1
          opacity-0 group-hover/row:opacity-100 transition-all duration-150">

          {/* Edit button */}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              title="Edit"
              className={`
                w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                ${isSelected
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              disabled={isDeleting}
              title="Delete"
              className={`
                w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                ${isDeleting ? "opacity-60 cursor-not-allowed" : ""}
                ${isSelected
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                }
              `}
            >
              {isDeleting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;