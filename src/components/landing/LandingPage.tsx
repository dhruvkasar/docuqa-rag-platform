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
import Scanner from '../ui/Scanner';

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
    // Subtle, clean scroll fade for sections without layout wobble
    const sections = pageRef.current?.querySelectorAll('section');
    if (!sections) return;

    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0.9, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 88%',
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
    <div
      ref={pageRef}
      className="relative min-h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 transition-colors overflow-x-hidden"
    >
      {/* Top Navbar */}
      <LandingNav
        onLaunchWorkspace={onLaunchWorkspace}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenDocs={onOpenDocs}
      />

      {/* Interactive Scanner Background (React Bits) */}
      <div className="absolute top-0 left-0 right-0 h-[780px] md:h-[880px] overflow-hidden pointer-events-auto z-0 opacity-45 dark:opacity-60 transition-opacity">
        <Scanner
          color1={darkMode ? '#3f3f46' : '#d4d4d8'}
          color2={darkMode ? '#d4d4d8' : '#71717a'}
          color3={darkMode ? '#ffffff' : '#18181b'}
          speed={0.45}
          sweepSpeed={0.22}
          sweepWidth={1.6}
          trail={0.5}
          ripple={0.22}
          bandDensity={11}
          glow={darkMode ? 0.6 : 0.25}
          scanDirection="vertical"
          colorSpread={0}
          scanline
          scanlineIntensity={darkMode ? 0.45 : 0.2}
          mouseInteraction
          mouseRadius={0.5}
          mouseStrength={0.7}
          clickEffect="ping"
          lightMode={!darkMode}
          vignette={0.35}
          className="w-full h-full"
        />
        {/* Seamless bottom fade mask into content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-neutral-950 pointer-events-none" />
      </div>

      <main className="relative z-10 space-y-12">
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
    </div>
  );
};
