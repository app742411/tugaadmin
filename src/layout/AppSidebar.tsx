"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  GroupIcon,
  UserCircleIcon,
  BoxCubeIcon,
  DocsIcon,
  CalenderIcon,
  ShootingStarIcon,
  InfoIcon,
  TableIcon,
  ChatIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

const SettingsIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CategoriesIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const PayoutsIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
    <path d="M3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z"></path>
    <circle cx="17" cy="15" r="1"></circle>
  </svg>
);

type NavSubItem = {
  name: string;
  path: string;
};

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path: string;
  subItems?: NavSubItem[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Overview",
    path: "/",
  },
  {
    icon: <CategoriesIcon />,
    name: "Categories",
    path: "/categories",
  },
  {
    icon: <GroupIcon />,
    name: "Customers",
    path: "/customers",
  },
  // {
  //   icon: <UserCircleIcon />,
  //   name: "Profile",
  //   path: "/profile",
  // },
  {
    icon: <UserCircleIcon />,
    name: "Traders Manage",
    path: "/traders",
    subItems: [
      { name: "Traders", path: "/traders" },
      { name: "Categories Requests", path: "/categories-requests" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Jobs Management",
    path: "/jobs",
    subItems: [
      { name: "Jobs", path: "/jobs" },
      { name: "Manual Review", path: "/jobs/manual-review" },
    ],
  },
  {
    icon: <DocsIcon />,
    name: "Quotes",
    path: "/quotes",
  },
  {
    icon: <CalenderIcon />,
    name: "Subscriptions",
    path: "/plans",
  },

  {
    icon: <ShootingStarIcon />,
    name: "Reviews",
    path: "/reviews",
    subItems: [
      { name: "Pending Reviews", path: "/reviews" },
      { name: "All Reviews", path: "/reviews/all" },
    ],
  },
  {
    icon: <InfoIcon />,
    name: "Disputes",
    path: "/disputes",
  },
  {
    icon: <TableIcon />,
    name: "Reports",
    path: "/reports",
  },
  {
    icon: <DocsIcon />,
    name: "FAQs",
    path: "/faqs",
  },
  {
    icon: <ChatIcon />,
    name: "Messages",
    path: "/messages",
  },
  {
    icon: <PayoutsIcon />,
    name: "Payouts",
    path: "/payouts",
  },
  {
    icon: <SettingsIcon />,
    name: "Settings",
    path: "/settings",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ "Jobs Management": true });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-1.5">
      {navItems.map((nav) => {
        const hasSubItems = nav.subItems && nav.subItems.length > 0;
        const isOpen = !!openMenus[nav.name];
        const isChildActive = !!(nav.subItems && nav.subItems.some((sub) => isActive(sub.path)));

        if (hasSubItems) {
          return (
            <li key={nav.name} className="flex flex-col gap-1">
              <button
                onClick={() => toggleMenu(nav.name)}
                className={`menu-item group ${isChildActive ? "menu-item-active" : "menu-item-inactive"} cursor-pointer w-full text-left flex justify-between items-center ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-between"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {nav.icon && (
                    <span className={`${isChildActive ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                      {nav.icon}
                    </span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </div>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {isOpen && (isExpanded || isHovered || isMobileOpen) && (
                <ul className="pl-6 flex flex-col gap-1 mt-1 border-l border-gray-100 dark:border-gray-800 ml-4">
                  {nav.subItems!.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.path}
                        className={`menu-item text-xs py-2 px-3 rounded-lg ${isActive(sub.path) ? "menu-item-active" : "menu-item-inactive"
                          }`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        }

        return (
          <li key={nav.name}>
            <Link
              href={nav.path}
              className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } ${!nav.icon ? "pl-[52px]" : ""} cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              {nav.icon && (
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar grow">
        <nav className="mb-6">
          {renderMenuItems()}
        </nav>
      </div>
      {isExpanded || isHovered || isMobileOpen ? (
        <div className="mt-auto pb-6">
          <SidebarWidget />
        </div>
      ) : null}
    </aside>
  );
};

export default AppSidebar;
