import { Bricolage_Grotesque, Manrope } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import QueryProvider from '@/providers/QueryProvider';
import ReduxProvider from '@/providers/ReduxProvider';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Tuga Trades Admin",
    default: "Tuga Trades Admin",
  },
  description: "Tuga Trades Admin Dashboard",
  icons: {
    icon: "/images/logo/logo-icon.svg",
  },
};

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className={`${manrope.className} dark:bg-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ReduxProvider>
              <QueryProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </QueryProvider>
            </ReduxProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
