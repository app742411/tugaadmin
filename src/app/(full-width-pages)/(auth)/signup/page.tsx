import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page",
  description: "Tuga Trades Admin Dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
