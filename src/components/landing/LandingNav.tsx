/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';

interface LandingNavProps {
  onLaunchWorkspace: (tab?: 'chat' | 'evaluation' | 'experiments') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenDocs: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  onLaunchWorkspace,
  darkMode,
  setDarkMode,
  onOpenDocs
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDropped, setIsDropped] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  // 1. Initial Dropdown Entrance on Page Load + Smart Scroll Dropdown Behavior
  useEffect(() => {
    // Smooth dropdown entrance animation on mount
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
    }, 80);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      // Always show dropped down at the top of the page
      if (currentScrollY <= 60) {
        setIsDropped(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;

      // Scroll down by > 8px -> retract navbar up
      if (delta > 8) {
        setIsDropped(false);
        setMobileMenuOpen(false);
      } 
      // Scroll up by > 8px -> drop navbar down smoothly
      else if (delta < -8) {
        setIsDropped(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(entryTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-1/2 z-50 pointer-events-auto select-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible && isDropped
          ? '-translate-x-1/2 translate-y-0'
          : '-translate-x-1/2 -translate-y-[130%]'
      }`}
    >
      {/* 
        Seamless Top-Docked Notch
        - Dropdown animation on mount & on scroll-up
        - Inverted theme: Dark notch in Light mode, Light notch in Dark mode
        - Overlapping bleed geometry eliminates any pixel lines at seams
      */}
      <div
        className={`relative flex items-center h-[52px] bg-black dark:bg-white text-white dark:text-neutral-900 px-5 sm:px-6 rounded-b-[24px] gap-5 sm:gap-7 md:gap-8 transition-shadow duration-300 ${
          scrolled
            ? 'shadow-2xl shadow-black/90 dark:shadow-2xl dark:shadow-neutral-950/25 ring-1 ring-white/10 dark:ring-black/10'
            : 'shadow-xl shadow-black/70 dark:shadow-lg dark:shadow-neutral-950/15'
        }`}
      >
        {/* Left Concave Inverted Ear (Seamless bleed into body and top) */}
        <svg
          className="absolute -top-[1px] -left-[24px] w-[25px] h-[25px] pointer-events-none fill-black dark:fill-white transition-colors duration-300"
          viewBox="0 -1 25 25"
          preserveAspectRatio="none"
        >
          <path d="M 0 -1 C 13.25 -1 24 9.75 24 24 H 25 V -1 H 0 Z" />
        </svg>

        {/* Right Concave Inverted Ear (Seamless bleed into body and top) */}
        <svg
          className="absolute -top-[1px] -right-[24px] w-[25px] h-[25px] pointer-events-none fill-black dark:fill-white transition-colors duration-300"
          viewBox="0 -1 25 25"
          preserveAspectRatio="none"
        >
          <path d="M 25 -1 C 11.75 -1 1 9.75 1 24 H 0 V -1 H 25 Z" />
        </svg>

        {/* Brand Item: Glossy Mac Aqua-Style Icon + Brand Wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
        >
          {/* Glossy blue squircle icon */}
          <div className="relative w-[30px] h-[30px] rounded-[9px] overflow-hidden bg-gradient-to-b from-[#3ba2ff] via-[#1a7aff] to-[#0057e7] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 active:scale-95 transition-transform duration-200">
            {/* Top glassy reflection */}
            <div className="absolute top-[1px] inset-x-[1.5px] h-[12px] rounded-t-[7.5px] bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none" />
            <span className="relative z-10 text-white font-bold text-xs font-mono drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              D
            </span>
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white dark:text-neutral-900 transition-colors">
            DocuQA
          </span>
        </a>

        {/* Original Website Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-[13px] font-medium text-neutral-400 dark:text-neutral-600">
          <a
            href="#simulator"
            className="hover:text-white dark:hover:text-neutral-950 transition-colors whitespace-nowrap"
          >
            Live Simulator
          </a>
          <a
            href="#capabilities"
            className="hover:text-white dark:hover:text-neutral-950 transition-colors whitespace-nowrap"
          >
            Architecture
          </a>
          <a
            href="#modules"
            className="hover:text-white dark:hover:text-neutral-950 transition-colors whitespace-nowrap"
          >
            Modules
          </a>
          <button
            onClick={onOpenDocs}
            className="hover:text-white dark:hover:text-neutral-950 transition-colors cursor-pointer whitespace-nowrap"
          >
            System Specs
          </button>
        </nav>

        {/* Right Actions: Theme Toggle & Primary Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle (Light / Dark mode) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-900 dark:hover:bg-neutral-100 transition-colors cursor-pointer active:scale-90"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => onLaunchWorkspace('chat')}
            className="h-[34px] px-3.5 sm:px-4 rounded-[12px] bg-white text-neutral-950 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 font-semibold text-[13px] tracking-tight flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-900 dark:hover:bg-neutral-100 transition-colors cursor-pointer active:scale-90"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu with Dropdown Animation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-neutral-900 shadow-2xl border border-neutral-800 dark:border-neutral-200 flex flex-col gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200">
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors"
          >
            Live Simulator
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors"
          >
            Architecture
          </a>
          <a
            href="#modules"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors"
          >
            Modules
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDocs();
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            System Specs
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLaunchWorkspace('chat');
            }}
            className="text-left px-3 py-2 rounded-lg bg-white text-neutral-950 dark:bg-neutral-900 dark:text-white font-semibold flex items-center justify-between transition-colors cursor-pointer mt-1"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
