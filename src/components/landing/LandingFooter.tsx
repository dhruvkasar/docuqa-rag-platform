/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Github } from 'lucide-react';
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
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950 px-6 md:px-12 py-16 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Bottom Conversion Banner */}
        <div className="p-8 md:p-12 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to verify your documents with zero hallucinations?
            </h3>
            <p className="text-xs md:text-sm text-neutral-400">
              Upload any PDF, financial statement, or textbook to experience multi-stage cross-encoder re-ranking.
            </p>
          </div>
          <Button
            onClick={() => onLaunchWorkspace('chat')}
            className="h-12 px-7 bg-white text-neutral-900 hover:bg-neutral-100 rounded-2xl text-xs md:text-sm font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] shrink-0"
          >
            <span>Launch DocuQA Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Quiet Bottom Meta Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3 fill-current" />
            </div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              DocuQA Document Intelligence Platform
            </span>
            <span>·</span>
            <span>Apache 2.0 Open Source</span>
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
