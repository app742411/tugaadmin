import type { Metadata } from "next";
import ReviewsPageClient from "./ReviewsPageClient";

export const metadata: Metadata = {
  title: "Pending Reviews",
  description: "Moderate and verify customer reviews on Tuga Trades Admin",
};

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}
