"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  dropdownPosition?: "top" | "bottom";
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  disabled = false,
  dropdownPosition = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border bg-white text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer ${
          isOpen
            ? "border-brand-500 ring-1 ring-brand-500 dark:border-brand-500"
            : "border-gray-200 dark:border-gray-800"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-850"
            : "dark:bg-gray-900/80 dark:text-white"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 min-w-full left-0 bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-fade-in no-scrollbar ${
          dropdownPosition === "top" ? "bottom-full mb-1.5" : "mt-1.5"
        }`}>
          <div className="p-1 space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-brand-50 text-brand-600 font-bold dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-white"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
