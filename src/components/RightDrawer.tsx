/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { RetrievalResult } from '../types/rag';

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  retrievedChunks: RetrievalResult[];
  highlightedChunkId: string | null;
  onClearHighlight: () => void;
  rerankerEnabled: boolean;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  retrievedChunks,
  highlightedChunkId,
  rerankerEnabled
}) => {
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightedChunkId && cardRefs.current[highlightedChunkId]) {
      cardRefs.current[highlightedChunkId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedChunkId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile-only dim backdrop (no blur on desktop) */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Docked Drawer on desktop, slide-over on mobile */}
      <aside className="fixed inset-y-0 right-0 z-50 md:static md:z-20 w-full max-w-sm md:w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl md:shadow-none shrink-0 h-full">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Retrieved Sources ({retrievedChunks.length})
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
              {rerankerEnabled ? 'Re-ranked & Grounded Candidates' : 'Bi-Encoder Vector Matches'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md"
            title="Close Sources Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-neutral-900">
          {retrievedChunks.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 dark:text-neutral-500 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No source passages retrieved yet.</p>
            </div>
          ) : (
            retrievedChunks.map((res) => {
              const isHighlighted = highlightedChunkId === res.chunk.id;
              return (
                <div
                  key={res.chunk.id}
                  ref={(el) => { cardRefs.current[res.chunk.id] = el; }}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    isHighlighted
                      ? 'ring-2 ring-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                      : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] mb-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Rank #{res.rank} · Page {res.chunk.pageNo}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                      {Math.round(res.finalScore * 100)}% match
                    </span>
                  </div>

                  <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans text-xs whitespace-pre-wrap font-normal">
                    {res.chunk.text}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                    <span className="truncate max-w-[200px]" title={res.chunk.docName}>
                      {res.chunk.docName}
                    </span>
                    <span>{res.chunk.tokenCount} tokens</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
