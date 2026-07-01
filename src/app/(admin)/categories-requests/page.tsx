import type { Metadata } from "next";
import CategoriesRequestsPageClient from "./CategoriesRequestsPageClient";

export const metadata: Metadata = {
  title: "Categories Requests | Tuga Trades Admin",
  description: "Review and approve/reject trader request to add or modify trade categories",
};

export default function CategoriesRequestsPage() {
  return <CategoriesRequestsPageClient />;
}
