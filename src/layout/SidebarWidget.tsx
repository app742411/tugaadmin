import React from "react";

export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-6 w-full max-w-60 px-4 text-left">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Support
      </h3>
      <a
        href="#"
        className="flex items-center justify-center p-3 font-semibold rounded-lg bg-[#6E9625] text-gray-900 text-theme-sm hover:bg-[#5c7e1f] transition-colors"
      >
        Contact Tech
      </a>
    </div>
  );
}
