/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  FlaskConical, 
  BookOpen, 
  Sliders, 
  Sun, 
  Moon,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { ChunkingStrategy } from '../types/rag';

interface HeaderProps {
  activeTab: 'chat' | 'evaluation' | 'experiments';
  setActiveTab: (tab: 'chat' | 'evaluation' | 'experiments') => void;
  strategy: ChunkingStrategy;
  setStrategy: (strategy: ChunkingStrategy) => void;
  useReranker: boolean;
  setUseReranker: (val: boolean) => void;
  onOpenDocs: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onToggleSidebar: () => void;
  docCount: number;
  provider: 'auto' | 'gemini' | 'openrouter';
  setProvider: (p: 'auto' | 'gemini' | 'openrouter') => void;
  openRouterModel: string;
  setOpenRouterModel: (m: string) => void;
  hasOpenRouterKey: boolean;
  onReturnToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  strategy,
  setStrategy,
  useReranker,
  setUseReranker,
  onOpenDocs,
  darkMode,
  setDarkMode,
  onToggleSidebar,
  docCount,
  provider,
  setProvider,
  openRouterModel,
  setOpenRouterModel,
  hasOpenRouterKey,
  onReturnToLanding
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <header className="h-13 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-30 select-none">
      {/* Brand & Document Drawer Trigger */}
      <div className="flex items-center gap-2">
        {onReturnToLanding ? (
          <button
            onClick={onReturnToLanding}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Return to Landing Page"
          >
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <span className="text-[11px] font-bold">D</span>
            </div>
            <span className="font-bold text-sm tracking-tight">DocuQA</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <span className="text-[11px] font-bold">D</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">DocuQA</span>
          </div>
        )}

        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Open Document Library"
        >
          <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
            {docCount} files
          </span>
        </button>
      </div>

      {/* Center: Minimalist Mode Switcher */}
      <nav className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Grounded Document Chat"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'evaluation'
              ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Automated Evaluation & Benchmarks"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Evaluation</span>
          <span className="sm:hidden">Eval</span>
        </button>

        <button
          onClick={() => setActiveTab('experiments')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'experiments'
              ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-neutral-200/50 dark:ring-neutral-700/50'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Chunking & Re-Ranker Empirical Experiments"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Experiment Lab</span>
          <span className="sm:hidden">Lab</span>
        </button>
      </nav>

      {/* Right: Consolidated Minimal Actions */}
      <div className="flex items-center gap-2">
        {/* RAG & Pipeline Settings */}
        <div className="relative">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            title="RAG Pipeline Settings"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              settingsOpen
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Minimalist Popover Panel */}
          {settingsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setSettingsOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-72 p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-40 space-y-3 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-900 dark:text-white text-xs">
                    Pipeline Settings
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 capitalize">
                    {strategy}
                  </span>
                </div>

                {/* Chunking Strategy */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    Chunking Strategy
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as ChunkingStrategy)}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white py-1.5 px-2.5 rounded-lg text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="semantic">Semantic Proposition (Recommended)</option>
                    <option value="recursive">Recursive Character Splitter</option>
                    <option value="fixed">Fixed-Size Window (512/50)</option>
                  </select>
                </div>

                {/* Cross-Encoder Re-ranker */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                      Cross-Encoder Re-ranker
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      High-precision candidate reranking
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useReranker}
                    onChange={(e) => setUseReranker(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Collapsible Advanced Section for Developers */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-[11px] font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 py-1 cursor-pointer"
                  >
                    <span>Advanced Model Configuration</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>

                  {showAdvanced && (
                    <div className="mt-2 space-y-2.5 pt-1">
                      {/* Provider Selector */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-medium text-neutral-400">
                            LLM Provider
                          </label>
                          {hasOpenRouterKey && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                              OpenRouter Ready
                            </span>
                          )}
                        </div>
                        <select
                          value={provider}
                          onChange={(e) => setProvider(e.target.value as any)}
                          className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white py-1 px-2 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="auto">Auto (Gemini + Fallback)</option>
                          <option value="gemini">Google Gemini (Direct)</option>
                          <option value="openrouter" disabled={!hasOpenRouterKey}>
                            OpenRouter {hasOpenRouterKey ? '(Active)' : '(Requires Key)'}
                          </option>
                        </select>
                      </div>

                      {/* OpenRouter Model Picker */}
                      {(provider === 'openrouter' || hasOpenRouterKey) && (
                        <div>
                          <label className="block text-[10px] font-medium text-neutral-400 mb-1">
                            Model Identifier
                          </label>
                          <select
                            value={openRouterModel}
                            onChange={(e) => setOpenRouterModel(e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white py-1 px-2 rounded-lg text-[11px] font-mono focus:outline-none"
                          >
                            <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
                            <option value="deepseek/deepseek-chat">deepseek/deepseek-chat</option>
                            <option value="meta-llama/llama-3.3-70b-instruct">meta-llama/llama-3.3-70b-instruct</option>
                            <option value="anthropic/claude-3.5-haiku">anthropic/claude-3.5-haiku</option>
                            <option value="qwen/qwen-2.5-72b-instruct">qwen/qwen-2.5-72b-instruct</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* System Architecture */}
        <button
          onClick={onOpenDocs}
          title="Architecture & Docker Specs"
          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
