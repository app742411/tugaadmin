import type { Metadata } from "next";
import QuotesPageClient from "./QuotesPageClient";

export const metadata: Metadata = {
  title: "Quotes | Tuga Trades Admin",
  description: "Manage and inspect quotes on Tuga Trades",
};

export default function QuotesPage() {
  return <QuotesPageClient />;
}
