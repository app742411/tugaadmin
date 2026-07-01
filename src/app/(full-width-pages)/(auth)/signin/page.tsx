import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page",
  description: "Tuga Trades Admin Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
