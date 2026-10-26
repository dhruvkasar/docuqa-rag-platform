/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '../ui/button';

interface LandingHeroProps {
  onLaunchWorkspace: (tab?: 'chat' | 'evaluation' | 'experiments') => void;
  onScrollToSimulator: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchWorkspace,
  onScrollToSimulator
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.1
      })
      .from(subtitleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6
      }, '-=0.4')
      .from(ctaRef.current, {
        y: 15,
        opacity: 0,
        duration: 0.5
      }, '-=0.3')
      .from(statsRef.current?.children ? Array.from(statsRef.current.children) : [], {
        y: 10,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4
      }, '-=0.2');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="pt-28 pb-16 md:pt-36 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
      {/* Editorial Unboxed Kicker (No Pill Enclosure, No Decorative Pulsing Dot) */}
      <div className="flex items-center justify-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-6 tracking-wide">
        <span>Proposition Chunking</span>
        <span aria-hidden="true">·</span>
        <span>Cross-Encoder Re-Ranking</span>
        <span aria-hidden="true">·</span>
        <span>40-Pair Golden Benchmark</span>
      </div>

      {/* High-Contrast Swiss Headline (No Purple Gradients, No Text Clips) */}
      <h1
        ref={titleRef}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white max-w-4xl mx-auto leading-[1.12]"
        style={{ textWrap: 'balance' }}
      >
        Ground Truth Document Intelligence, Verifiable at Every Token.
      </h1>

      {/* Subtitle with Measured Proportions */}
      <p
        ref={subtitleRef}
        className="mt-6 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
      >
        A production retrieval engine designed for research papers, financial statements, and engineering textbooks. 
        Eliminating hallucinations through atomic proposition boundaries and neural cross-attention.
      </p>

      {/* Action Row (Standardized 6px Radius, Smooth Hover Transitions without Bouncing) */}
      <div
        ref={ctaRef}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <Button
          onClick={() => onLaunchWorkspace('chat')}
          className="w-full sm:w-auto h-11 px-6 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button
          onClick={onScrollToSimulator}
          variant="outline"
          className="w-full sm:w-auto h-11 px-5 border-neutral-300 dark:border-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-850 cursor-pointer flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Interactive Live Simulator</span>
        </Button>
      </div>

      {/* Measured Metric Grid (Hairline Dividers, Standardized 6px Radius, Tabular Numerals) */}
      <div
        ref={statsRef}
        className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left"
      >
        <div className="p-4 rounded-md bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Hit Rate @3
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            91.5%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            +14.8% vs. Fixed Chunking
          </span>
        </div>

        <div className="p-4 rounded-md bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            MRR Position
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            0.88
          </div>
          <span className="text-[11px] text-neutral-500">
            Top-1 Ground Truth Rank
          </span>
        </div>

        <div className="p-4 rounded-md bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Faithfulness Score
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            96.2%
          </div>
          <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
            Zero-Hallucination Threshold
          </span>
        </div>

        <div className="p-4 rounded-md bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Cross-Encoder Speed
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
            ~380ms
          </div>
          <span className="text-[11px] text-neutral-500">
            Real-time SSE Streaming
          </span>
        </div>
      </div>
    </section>
  );
};
