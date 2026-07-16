import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  pageTitle: string;
  customPath?: { label: string; href?: string }[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, customPath }) => {
  return (
    <div className="flex flex-col gap-1 mb-2">
      {/* Minimal breadcrumb trail */}
      <nav className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
        <Link
          href="/"
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-gray-300 dark:text-gray-800">/</span>
        {customPath ? (
          customPath.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-gray-750 dark:hover:text-gray-200 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 font-bold">
                  {item.label}
                </span>
              )}
              {idx < customPath.length - 1 && (
                <span className="text-gray-300 dark:text-gray-800">/</span>
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="text-gray-500 dark:text-gray-400 font-bold">
            {pageTitle}
          </span>
        )}
      </nav>
      {/* Page Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
        {pageTitle}
      </h2>
    </div>
  );
};

export default PageBreadcrumb;
