import type { Metadata } from "next";
import FaqsPageClient from "./FaqsPageClient";

export const metadata: Metadata = {
  title: "FAQs Management | Tuga Trades Admin",
  description: "Configure Frequently Asked Questions displayed to clients and traders",
};

export default function FaqsPage() {
  return <FaqsPageClient />;
}
