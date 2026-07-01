import type { Metadata } from "next";
import CustomersPageClient from "./CustomersPageClient";

export const metadata: Metadata = {
  title: "Customers",
  description: "Manage registered customers on Tuga Trades Admin",
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
