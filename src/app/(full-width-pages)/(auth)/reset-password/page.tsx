import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Tunga Admin Dashboard",
  description: "Reset your Tunga Admin password.",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
