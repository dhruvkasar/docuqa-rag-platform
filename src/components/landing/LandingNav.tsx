/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Sun, Moon, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';

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
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-13 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-4 transition-colors select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
          <span className="text-[11px] font-bold">D</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
            DocuQA
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
            v1.0 Production
          </span>
        </div>
      </div>

      {/* Center Nav Links */}
      <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
        <a href="#simulator" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Live Simulator
        </a>
        <a href="#capabilities" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Architecture
        </a>
        <a href="#modules" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Modules
        </a>
        <a href="#benchmarks" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Benchmarks
        </a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Architecture Spec Button */}
        <button
          onClick={onOpenDocs}
          title="Architecture Documentation"
          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary CTA */}
        <Button
          onClick={() => onLaunchWorkspace('chat')}
          className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </nav>
  );
};
