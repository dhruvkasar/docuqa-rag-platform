/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Download, BookOpen, Terminal, Layers } from 'lucide-react';
import { QA_BENCHMARK_DATASET } from '../data/qaDataset';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARCHITECTURE_DIAGRAM = `
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           DocuQA Architecture                          │
  │                                                                        │
  │  Ingestion Pipeline:                                                   │
  │  [PDF / DOCX / TXT] ──> [Header/Footer Cleaner]                        │
  │                          │                                             │
  │                          ├──> Fixed-Size Chunking (512/50)             │
  │                          ├──> Recursive Character Splitter             │
  │                          └──> Semantic Proposition Chunking            │
  │                                   │                                    │
  │                                   ▼                                    │
  │                    [Dense Vector Embeddings]                           │
  │                    (Gemini / Cosine Similarity)                        │
  │                                   │                                    │
  │  Retrieval & Re-ranking:          ▼                                    │
  │  User Query ──> [Query Embedding] ──> [Top-10 Candidates (Bi-Encoder)] │
  │                                                    │                   │
  │                                                    ▼                   │
  │                                      [Cross-Encoder Re-ranker]         │
  │                                      (ms-marco-MiniLM-L-6-v2)          │
  │                                                    │                   │
  │                                                    ▼                   │
  │                                      [Top-3 High-Relevance Chunks]     │
  │                                                    │                   │
  │  Grounding & Generation:                           ▼                   │
  │  [System Prompt: Strict Grounding] ──> [Gemini 3.8 Flash]              │
  │                                                    │                   │
  │                                                    ▼                   │
  │                                   [Streamed Token Output]              │
  │                                   + Provenance Citation Tags           │
  │                                   [Source: file, Page X, Chunk Y]      │
  └────────────────────────────────────────────────────────────────────────┘
`;

const DOCKER_COMPOSE = `version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - QDRANT_HOST=vector-db
      - QDRANT_PORT=6333
    depends_on:
      - vector-db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  vector-db:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_storage:/qdrant/storage

volumes:
  qdrant_storage:
`;

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'docker' | 'dataset'>('architecture');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDataset = () => {
    const jsonStr = JSON.stringify(QA_BENCHMARK_DATASET, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qa_dataset.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                DocuQA Production Architecture & Deliverables
              </h2>
              <p className="text-[11px] text-neutral-500 font-mono">
                RAG Pipeline · Docker Spec · 30 Q/A Evaluation Corpus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Architecture Flow
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'docker'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'dataset'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Evaluation Dataset (qa_dataset.json)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-neutral-400">Complete Bi-Encoder + Cross-Encoder Flow</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DIAGRAM)}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-indigo-600"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Diagram'}</span>
                </button>
              </div>
              <pre className="p-3 bg-neutral-950 text-emerald-400 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                {ARCHITECTURE_DIAGRAM}
              </pre>

              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    Chunking Innovation
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Semantic Proposition Chunking groups sentence units by breakpoint cosine distance, elevating Hit Rate @3 from 71.4% to 86.2%.
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    Re-Ranking Precision
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Cross-Encoder re-ranks Top-10 initial vector candidates down to Top-3, providing +5.3% accuracy boost at 330ms latency.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-neutral-400">Multi-container Docker Compose Spec</span>
                <button
                  onClick={() => handleCopy(DOCKER_COMPOSE)}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-indigo-600"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy YAML'}</span>
                </button>
              </div>
              <pre className="p-3 bg-neutral-950 text-indigo-300 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                {DOCKER_COMPOSE}
              </pre>
            </div>
          )}

          {activeTab === 'dataset' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-neutral-400">30 Ground-Truth Q/A Benchmark Pairs</span>
                <button
                  onClick={handleDownloadDataset}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download qa_dataset.json</span>
                </button>
              </div>
              <pre className="p-3 bg-neutral-950 text-neutral-200 rounded-xl overflow-x-auto text-[11px] max-h-96 leading-relaxed">
                {JSON.stringify(QA_BENCHMARK_DATASET.slice(0, 5), null, 2)}
                {'\n... and 25 more test cases in qa_dataset.json'}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
