import type { Metadata } from "next";
import TradersPageClient from "./TradersPageClient";

export const metadata: Metadata = {
  title: "Traders",
  description: "Manage business traders and vetting status on Tuga Trades Admin",
};

export default function TradersPage() {
  return <TradersPageClient />;
}
