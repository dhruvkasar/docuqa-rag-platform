/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';

interface LandingFooterProps {
  onLaunchWorkspace: (tab?: 'chat' | 'evaluation' | 'experiments') => void;
  onOpenDocs: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onLaunchWorkspace,
  onOpenDocs
}) => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 px-6 md:px-12 py-16 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Bottom Conversion Banner (Standardized 6px radius, high contrast, zero bouncing) */}
        <div className="p-8 md:p-10 rounded-md bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">
              Ready to verify documents with zero hallucinations?
            </h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
              Upload any PDF, financial statement, or textbook to experience atomic semantic chunking and cross-encoder re-ranking.
            </p>
          </div>
          <Button
            onClick={() => onLaunchWorkspace('chat')}
            className="h-11 px-6 bg-white text-neutral-900 hover:bg-neutral-100 rounded-md text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors shrink-0"
          >
            <span>Launch DocuQA Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Quiet Bottom Meta Row (Exact Legal Copyright, Working Links) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 pt-4 border-t border-neutral-200 dark:border-neutral-850">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-mono font-bold text-[11px]">
              D
            </div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              DocuQA Document Intelligence Platform
            </span>
            <span>·</span>
            <span>© 2026 Apache 2.0 Open Source</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenDocs}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Architecture Specs</span>
            </button>
            <button
              onClick={() => onLaunchWorkspace('evaluation')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Evaluation Benchmark
            </button>
            <button
              onClick={() => onLaunchWorkspace('experiments')}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Experiment Lab
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
