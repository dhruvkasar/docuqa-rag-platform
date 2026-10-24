/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LandingNav } from './LandingNav';
import { LandingHero } from './LandingHero';
import { LiveRAGSimulator } from './LiveRAGSimulator';
import { BentoGrid } from './BentoGrid';
import { ModuleDeepDive } from './ModuleDeepDive';
import { LandingFooter } from './LandingFooter';
import { BeamsBackground } from '@/components/ui/beams-background';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onLaunchWorkspace: (tab?: 'chat' | 'evaluation' | 'experiments') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenDocs: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchWorkspace,
  darkMode,
  setDarkMode,
  onOpenDocs
}) => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll reveals for major sections
    const sections = pageRef.current?.querySelectorAll('section');
    if (!sections) return;

    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0.85, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleScrollToSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors">
      <BeamsBackground intensity="medium" className="bg-transparent dark:bg-neutral-950">
        {/* Top Navbar */}
        <LandingNav
          onLaunchWorkspace={onLaunchWorkspace}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenDocs={onOpenDocs}
        />

        <main className="relative z-10 space-y-8">
          {/* Hero Section */}
          <LandingHero
            onLaunchWorkspace={onLaunchWorkspace}
            onScrollToSimulator={handleScrollToSimulator}
          />

          {/* Interactive Live RAG Simulator */}
          <LiveRAGSimulator onLaunchWorkspace={onLaunchWorkspace} />

          {/* Technical Architecture Bento-Grid */}
          <BentoGrid />

          {/* 3 Core Platform Modules Deep-Dive */}
          <ModuleDeepDive onLaunchWorkspace={onLaunchWorkspace} />
        </main>

        {/* Footer */}
        <LandingFooter
          onLaunchWorkspace={onLaunchWorkspace}
          onOpenDocs={onOpenDocs}
        />
      </BeamsBackground>
    </div>
  );
};
