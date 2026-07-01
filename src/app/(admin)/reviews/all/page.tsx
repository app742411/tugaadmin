import type { Metadata } from "next";
import AllReviewsClient from "./AllReviewsClient";

export const metadata: Metadata = {
  title: "All Reviews | Tuga Trades Admin",
  description: "View all reviews on Tuga Trades",
};

export default function AllReviewsPage() {
  return <AllReviewsClient />;
}
