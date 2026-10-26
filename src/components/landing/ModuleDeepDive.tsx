/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  FlaskConical, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';

interface ModuleDeepDiveProps {
  onLaunchWorkspace: (tab: 'chat' | 'evaluation' | 'experiments') => void;
}

export const ModuleDeepDive: React.FC<ModuleDeepDiveProps> = ({ onLaunchWorkspace }) => {
  const [activeModule, setActiveModule] = useState<'chat' | 'evaluation' | 'experiments'>('chat');

  return (
    <section id="modules" className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center mb-10">
        <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
          02. Core System Architecture
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Three Dedicated Modules in One Cohesive Platform
        </h2>
        <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          From conversational querying to empirical chunking research and automated precision benchmarks.
        </p>
      </div>

      {/* Module Selector Segmented Tabs (Standardized 6px radius, neutral backgrounds) */}
      <div className="flex justify-center mb-8">
        <div className="bg-neutral-100 dark:bg-neutral-900 p-1 rounded-md flex items-center gap-1 border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveModule('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              activeModule === 'chat'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>01. Grounded Chat</span>
          </button>

          <button
            onClick={() => setActiveModule('evaluation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              activeModule === 'evaluation'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>02. Evaluation Harness</span>
          </button>

          <button
            onClick={() => setActiveModule('experiments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              activeModule === 'experiments'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>03. Experiment Lab</span>
          </button>
        </div>
      </div>

      {/* Tab Panels (Standardized 6px radius, hairline borders, no purple accents) */}
      <div className="bg-white dark:bg-neutral-900/60 rounded-md border border-neutral-200 dark:border-neutral-800 p-6 md:p-10 transition-colors">
        {activeModule === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Module 01: Conversational Intelligence
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Verifiable Grounded Chat with SSE Streaming
              </h3>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Ask deep technical questions or predict exam topics. Every generated answer includes clickable citation coordinates linking directly to page numbers and chunk propositions in the slide-over source inspector.
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Real-time SSE token streaming via Google Gemini 2.5 Flash</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Expandable reasoning traces with transparent retrieval math</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Interactive source coordinates with click-to-highlight</span>
                </li>
              </ul>
              <div className="pt-2">
                <Button
                  onClick={() => onLaunchWorkspace('chat')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md text-xs font-semibold px-5 py-2.5 shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Launch Chat Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[11px]">
                <span>Preview: Chat Bubble & Citation</span>
                <span className="tabular-nums">380ms Latency</span>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-2">
                <p className="text-neutral-800 dark:text-neutral-200 font-sans text-xs leading-relaxed">
                  In Q3 2024, Google Cloud revenues reached $11,353 million, up 35% year-over-year. Operating income was $1,947 million, reflecting enterprise AI infrastructure adoption.
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                  <span>[Source: Alphabet_Q3_2024.txt, Page 3, Chunk 4]</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'evaluation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Module 02: Quantitative QA Benchmarks
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Continuous Accuracy & Faithfulness Testing
              </h3>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Run automated benchmarks across 40 curated technical and financial Q/A pairs. Automatically synthesizes test suites for uploaded PDFs to compute Hit Rate @1/3/5, MRR, and latency.
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Hit Rate @1, @3, and @5 passage presence metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Mean Reciprocal Rank (MRR) rank-order scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Ad-hoc query inspector with live bi-encoder vs. cross-encoder scoring</span>
                </li>
              </ul>
              <div className="pt-2">
                <Button
                  onClick={() => onLaunchWorkspace('evaluation')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md text-xs font-semibold px-5 py-2.5 shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Launch Evaluation Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[11px]">
                <span>Preview: 40-Pair Benchmark KPIs</span>
                <span className="text-neutral-900 dark:text-white font-bold">Passed</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">Hit Rate @3</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">91.5%</div>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">MRR Position</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">0.88</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule === 'experiments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Module 03: Empirical Research & Tuning
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Empirical Chunking & Re-Ranker Tradeoff Lab
              </h3>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Compare Fixed-Size Window, Recursive Character Splitter, and Semantic Proposition chunking side-by-side directly on document text. Tune re-ranker candidate pools to observe real-time latency tradeoffs.
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Side-by-side comparative inspection of chunk boundaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Adjustable Top-K pool slider (5, 10, 15, 20, 25 candidates)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />
                  <span>Direct document dropdown binding to custom uploaded files</span>
                </li>
              </ul>
              <div className="pt-2">
                <Button
                  onClick={() => onLaunchWorkspace('experiments')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md text-xs font-semibold px-5 py-2.5 shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Launch Experiment Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[11px]">
                <span>Preview: Empirical Strategy Comparison</span>
                <span className="text-neutral-900 dark:text-white font-semibold">Active</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                  <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200">Fixed-Size Window</span>
                  <span className="text-neutral-400 font-mono tabular-nums">71.4% Hit</span>
                </div>
                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-300 dark:border-neutral-700 flex justify-between items-center font-bold text-neutral-900 dark:text-white">
                  <span className="font-sans">Semantic Proposition</span>
                  <span className="font-mono tabular-nums">86.2% Hit (+14.8%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
