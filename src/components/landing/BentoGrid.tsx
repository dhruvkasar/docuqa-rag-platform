/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Layers, 
  Sliders, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <section id="capabilities" className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
      {/* Section Header (Swiss Editorial Typography) */}
      <div className="text-center mb-12">
        <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
          01. Architectural Specifications
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Why Proposition RAG Outperforms Naive Vector Search
        </h2>
        <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Built on published academic retrieval benchmarks, cross-encoder neural re-ranking, and proposition-level token boundaries.
        </p>
      </div>

      {/* Asymmetric Bento Layout (Standardized 6px / rounded-md radiuses, 1px hairline rules) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Semantic Proposition Chunking (Span 2) */}
        <div className="md:col-span-2 p-6 md:p-8 rounded-md bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono text-neutral-900 dark:text-white">
              <Layers className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Proposition Chunking Engine</span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
              +14.8% Hit Rate Lift
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Atomic Semantic Units, Not Arbitrary Token Windows
          </h3>

          <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
            Standard RAG slices documents at fixed character intervals, cutting sentences mid-formula or splitting tables across boundaries. 
            DocuQA partitions documents into self-contained semantic propositions, ensuring every retrieved passage contains complete, indivisible factual context.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5">Fixed 512/50</span>
              <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white">71.4%</div>
              <span className="text-[10px] text-neutral-500">Naive baseline</span>
            </div>
            <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-mono text-neutral-400 block mb-0.5">Recursive</span>
              <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white">78.6%</div>
              <span className="text-[10px] text-neutral-500">Paragraph splits</span>
            </div>
            <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-neutral-900 dark:text-neutral-100 font-semibold block mb-0.5">Semantic Proposition</span>
              <div className="text-base font-bold font-mono tabular-nums text-neutral-900 dark:text-white">86.2%</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">DocuQA Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Two-Stage Re-Ranking (Span 1) */}
        <div className="p-6 md:p-8 rounded-md bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono text-neutral-900 dark:text-white">
            <Sliders className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <span>Cross-Encoder Re-Ranker</span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Overcoming Bi-Encoder Bottlenecks
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Bi-encoders generate embeddings independently, missing complex query token interactions. 
            DocuQA runs an attention-based Cross-Encoder over the candidate pool, elevating Hit Rate @3 to <strong className="text-neutral-900 dark:text-white">91.5%</strong>.
          </p>

          <div className="pt-2">
            <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-neutral-500">
                <span>Vector Only:</span>
                <span className="tabular-nums">86.2% Hit · 18ms</span>
              </div>
              <div className="flex justify-between text-neutral-900 dark:text-white font-semibold">
                <span>With Cross-Encoder:</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">91.5% Hit · 380ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: 40-Pair Automated Benchmark (Span 1) */}
        <div className="p-6 md:p-8 rounded-md bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono text-neutral-900 dark:text-white">
            <BarChart3 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <span>Evaluation Harness</span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Continuous Golden Benchmark
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            40 curated technical and financial test cases continuously measure Hit Rate @1/3/5, Mean Reciprocal Rank (MRR), and Precision. 
            Automated test harnesses run over all indexed document propositions.
          </p>

          <div className="flex items-baseline gap-2 pt-1 font-mono">
            <span className="text-2xl font-bold tabular-nums text-neutral-900 dark:text-white">0.88</span>
            <span className="text-xs text-neutral-500">MRR Ground Truth Score</span>
          </div>
        </div>

        {/* Card 4: Zero-Hallucination Citation Policy (Span 2) */}
        <div className="md:col-span-2 p-6 md:p-8 rounded-md bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-4 relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono text-neutral-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
            <span>Strict Verification Guardrail</span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Every Claim Grounded in Document Coordinates
          </h3>

          <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
            DocuQA enforces mandatory citation tags formatted as <code className="px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">[Source: document.pdf, Page X, Chunk Y]</code>. 
            If an answer is absent from context, the model triggers an explicit fallback: <em>"This information was not found in your indexed documents."</em>
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
              <span>Verifiable Page Coordinates</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
              <span>Click-to-Inspect Source Drawer</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
              <span>Full Math & Equation Rendering</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
