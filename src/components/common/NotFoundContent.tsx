"use client";

import React from "react";
import Link from "next/link";
import GridShape from "@/components/common/GridShape";

export default function NotFoundContent() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-gray-50 dark:bg-[#080d08] transition-colors duration-300">
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.15); }
        }
        @keyframes drift-slow-1 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(25px, -30px) rotate(15deg); }
        }
        @keyframes drift-slow-2 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(-30px, 20px) rotate(-15deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.15); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 4s infinite;
        }
        .animate-drift-1 {
          animation: drift-slow-1 12s ease-in-out infinite;
        }
        .animate-drift-2 {
          animation: drift-slow-2 15s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}} />

      {/* Grid Shape Background */}
      <GridShape />

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 -z-2 w-[350px] h-[350px] rounded-full bg-success-500/10 dark:bg-success-500/15 blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-2 w-[400px] h-[400px] rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: "-4s" }} />

      {/* Floating Trades Tool Outlines */}
      <div className="absolute top-12 left-12 md:top-24 md:left-24 text-success-500/20 dark:text-success-400/10 animate-drift-1 pointer-events-none">
        {/* Claw Hammer outline icon */}
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15L12 21c-.2-.2-.4-.4-.6-.6c-.2-.2-.4-.4-.6-.6c-.4-.4-.6-1-.6-1.5c0-.5.2-1.1.6-1.5L16 13" />
          <path d="M20 17l2.5-2.5" />
          <path d="M22 15L20.8 13.8c-.3-.3-.4-.6-.4-1V12.5c0-.4-.1-.7-.4-1L19.2 10.7c-.8-.8-1.8-1.2-2.9-1.2H14l.8.8c.8.8 1.2 1.8 1.2 2.9V14.2l1.3 1.3h.8c.4 0 .7.1 1 .4l1.3 1.3" />
        </svg>
      </div>

      <div className="absolute bottom-16 right-12 md:bottom-24 md:right-24 text-brand-500/25 dark:text-success-300/15 animate-drift-2 pointer-events-none" style={{ animationDelay: "-3s" }}>
        {/* Wrench outline icon */}
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a3.5 3.5 0 0 0-4.9 0 3.5 3.5 0 0 0-.7 3.8L3 16.2a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l6.1-6.1a3.5 3.5 0 0 0 3.8-.7 3.5 3.5 0 0 0 0-4.9Z" />
          <path d="M6 16l-2-2" />
        </svg>
      </div>

      {/* Main Glassmorphic Container Card */}
      <div className="relative z-10 w-full max-w-xl p-8 md:p-14 text-center rounded-3xl backdrop-blur-md bg-white/40 dark:bg-white/[0.02] border border-white/50 dark:border-white/[0.04] shadow-theme-xl dark:shadow-2xl">
        
        {/* Error Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase rounded-full bg-success-50 text-success-600 border border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
          SYSTEM ERROR
        </span>

        {/* Brand Themed animated 404 SVG Illustration */}
        <div className="relative mb-8">
          <svg className="w-full max-w-[280px] sm:max-w-[400px] h-auto mx-auto" viewBox="0 0 472 158" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brandLinearGrad" x1="0" y1="0" x2="472" y2="158" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#243A24" />
                <stop offset="50%" stopColor="#6E9625" />
                <stop offset="100%" stopColor="#243A24" />
              </linearGradient>
              <linearGradient id="brandLinearGradDark" x1="0" y1="0" x2="472" y2="158" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#89a086" />
                <stop offset="50%" stopColor="#a2c468" />
                <stop offset="100%" stopColor="#89a086" />
              </linearGradient>
            </defs>
            
            {/* Left Digit '4' */}
            <g className="fill-brand-500 dark:fill-brand-300 transition-colors duration-300">
              <rect x="0.0405273" y="0.522461" width="32.6255" height="77.5957" rx="6.26271" />
              <rect x="75.8726" y="3.16748" width="32.6255" height="154.31" rx="6.26271" />
              <rect x="16.7939" y="91.3442" width="32.6255" height="77.5957" rx="6.26271" transform="rotate(-90 16.7939 91.3442)" />
            </g>

            {/* Middle Monitor '0' (Sad Monitor Face) - animated to float */}
            <g className="animate-float" style={{ transformOrigin: '236px 79px' }}>
              {/* Monitor Screen Frame */}
              <rect x="152.769" y="15.167" width="166.462" height="130.311" rx="28" stroke="url(#brandLinearGrad)" strokeWidth="24" className="dark:stroke-[url(#brandLinearGradDark)]" />
              
              {/* Inner face components */}
              <g className="fill-brand-500 dark:fill-brand-300">
                {/* Eyes - blinking */}
                <rect x="203.103" y="41.7015" width="22.1453" height="20.7141" rx="2.63433" className="animate-blink" style={{ transformOrigin: '214px 52px' }} />
                <rect x="246.752" y="41.7015" width="22.1453" height="20.7141" rx="2.63433" className="animate-blink" style={{ transformOrigin: '257px 52px' }} />
                
                {/* Sad Mouth */}
                <rect x="191.654" y="98.2303" width="22.1453" height="20.7141" rx="2.63433" />
                <rect x="258.201" y="98.2303" width="22.1453" height="20.7141" rx="2.63433" />
                <rect x="207.396" y="82.847" width="57.5655" height="20.7141" rx="2.63433" />
              </g>
            </g>

            {/* Right Digit '4' */}
            <g className="fill-brand-500 dark:fill-brand-300 transition-colors duration-300">
              <rect x="363.502" y="0.522461" width="32.6255" height="77.5957" rx="6.26271" />
              <rect x="439.334" y="3.16748" width="32.6255" height="154.31" rx="6.26271" />
              <rect x="380.255" y="91.3442" width="32.6255" height="77.5957" rx="6.26271" transform="rotate(-90 380.255 91.3442)" />
            </g>
          </svg>
        </div>

        {/* Header Text */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/95 sm:text-2xl mb-3">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="max-w-md mx-auto mb-8 text-sm text-gray-500 dark:text-gray-400">
          We can’t seem to find the page you are looking for. It might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 dark:bg-success-500 dark:hover:bg-success-600 px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Back to Home Page
        </Link>
      </div>

      {/* Footer Branding */}
      <p className="absolute text-xs text-center text-gray-400 dark:text-gray-600 -translate-x-1/2 bottom-6 left-1/2">
        &copy; {new Date().getFullYear()} - Tuga Trades Admin
      </p>
    </div>
  );
}
