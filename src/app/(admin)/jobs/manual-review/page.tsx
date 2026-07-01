import type { Metadata } from "next";
import ManualReviewJobsPageClient from "./ManualReviewJobsPageClient";

export const metadata: Metadata = {
  title: "Manual Review Jobs | Tuga Trades Admin",
  description: "Inspect and review jobs that require manual distribution review",
};

export default function ManualReviewJobsPage() {
  return <ManualReviewJobsPageClient />;
}
