import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const randomImage = Math.random() < 0.5 ? "/images/grid-image/login1.png" : "/images/grid-image/login2.png";

  return (
    <div className="relative p-6 bg-[#F8F9FA] z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative h-full w-full flex items-center justify-center z-1 overflow-hidden">
              <Image
                fill
                priority
                src={randomImage}
                alt="Auth Background"
                className="object-cover z-10"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
              
              {/* Text Content */}
              <div className="absolute bottom-0 left-0 z-30 w-full p-12 md:p-16 text-white">
                <div className="w-12 h-1 bg-green-500 rounded mb-8"></div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.15] text-white">
                  Find trusted <br/> professionals <br/> for every job
                </h1>
                <p className="text-gray-300 text-lg mb-10 max-w-md">
                  Compare quotes, hire with confidence, and get your home projects done right.
                </p>
                <div className="flex items-center gap-4 pt-8 border-t border-white/20">
                  <div className="flex -space-x-3">
                     <div className="relative w-10 h-10 rounded-full border-2 border-brand-950 overflow-hidden">
                       <Image fill src="/images/user/user-01.jpg" alt="User" className="object-cover" />
                     </div>
                     <div className="relative w-10 h-10 rounded-full border-2 border-brand-950 overflow-hidden">
                       <Image fill src="/images/user/user-02.jpg" alt="User" className="object-cover" />
                     </div>
                     <div className="relative w-10 h-10 rounded-full border-2 border-brand-950 overflow-hidden">
                       <Image fill src="/images/user/user-03.jpg" alt="User" className="object-cover" />
                     </div>
                  </div>
                  <div>
                    <div className="flex gap-1 text-green-500 text-sm mb-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                    <p className="text-xs text-gray-300">10k+ verified pros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed top-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
