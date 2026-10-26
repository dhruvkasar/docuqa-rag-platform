/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Play, 
  FileText, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Button } from '../ui/button';
import { DEFAULT_DOC_ALPHABET, DEFAULT_DOC_UT1_ELECTRONICS, DEFAULT_DOC_RAG_WHITEPAPER } from '../../data/defaultDocuments';
import { processDocumentChunks, cleanDocumentText } from '../../utils/chunking';
import { retrieveAndRerank } from '../../utils/vectorEngine';

interface LiveRAGSimulatorProps {
  onLaunchWorkspace: (tab?: 'chat' | 'evaluation' | 'experiments') => void;
}

const SAMPLE_QUERIES = [
  {
    title: 'Financial Q3 Revenue',
    query: 'What were Google Cloud revenues and operating profit in Q3 2024?',
    doc: 'Alphabet_Q3_2024_Financial_Report.txt'
  },
  {
    title: 'Hardware & Circuits',
    query: 'What is the fundamental difference between BJT and FET control mechanisms?',
    doc: 'UT1_Detailed_Easy_Answers.pdf'
  },
  {
    title: 'RAG Architecture',
    query: 'What retrieval hit rate @3 did Semantic Proposition chunking achieve vs fixed-size?',
    doc: 'Frontier_AI_Safety_and_RAG_Architecture_Whitepaper.txt'
  }
];

export const LiveRAGSimulator: React.FC<LiveRAGSimulatorProps> = ({ onLaunchWorkspace }) => {
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0);
  const [customQuery, setCustomQuery] = useState(SAMPLE_QUERIES[0].query);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(3);
  const [selectedChunk, setSelectedChunk] = useState<any | null>(null);

  // Initialize corpus chunks for simulator
  const demoChunks = useMemo(() => {
    const c1 = processDocumentChunks(cleanDocumentText(DEFAULT_DOC_ALPHABET), 'doc_1', 'Alphabet_Q3_2024_Financial_Report.txt', 'semantic');
    const c2 = processDocumentChunks(cleanDocumentText(DEFAULT_DOC_UT1_ELECTRONICS), 'doc_2', 'UT1_Detailed_Easy_Answers.pdf', 'semantic');
    const c3 = processDocumentChunks(cleanDocumentText(DEFAULT_DOC_RAG_WHITEPAPER), 'doc_3', 'Frontier_AI_Safety_and_RAG_Architecture_Whitepaper.txt', 'semantic');
    return [...c1, ...c2, ...c3];
  }, []);

  // Run real retrieval
  const retrievalResult = useMemo(() => {
    if (!customQuery.trim()) return [];
    return retrieveAndRerank(customQuery, demoChunks, 12, 3, true);
  }, [customQuery, demoChunks]);

  const handleSelectSample = (idx: number) => {
    setSelectedQueryIndex(idx);
    setCustomQuery(SAMPLE_QUERIES[idx].query);
    runSimulationAnimation();
  };

  const runSimulationAnimation = () => {
    setIsSimulating(true);
    setActiveStep(1);
    setSelectedChunk(null);

    setTimeout(() => {
      setActiveStep(2);
      setTimeout(() => {
        setActiveStep(3);
        setIsSimulating(false);
      }, 300);
    }, 300);
  };

  const topChunk = retrievalResult[0]?.chunk;

  return (
    <section id="simulator" className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center mb-10">
        <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
          03. Live Evaluation Pipeline
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Experience Multi-Stage Retrieval in Real Time
        </h2>
        <p className="mt-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Test live dense vector search and cross-encoder re-ranking on indexed technical and financial documents.
        </p>
      </div>

      {/* Simulator Container (Standardized 6px / rounded-md radius, crisp hairline border) */}
      <div className="bg-white dark:bg-neutral-900/60 rounded-md border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 space-y-6">
        {/* Sample Prompt Selector Tabs */}
        <div>
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 block mb-2">
            Select verified benchmark query:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(idx)}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedQueryIndex === idx
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input & Run Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSimulationAnimation()}
            placeholder="Type any test query..."
            className="flex-1 text-xs md:text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md px-4 py-2.5 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
          />
          <Button
            onClick={runSimulationAnimation}
            disabled={isSimulating}
            className="h-10 px-5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold rounded-md flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isSimulating ? 'Scoring Propositions...' : 'Run Pipeline'}</span>
          </Button>
        </div>

        {/* Pipeline Multi-Stage Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Stage 1 */}
          <div className={`p-4 rounded-md border transition-colors ${
            activeStep >= 1
              ? 'bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700'
              : 'bg-neutral-50/40 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 opacity-50'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>Dense Bi-Encoder</span>
              </span>
              <span className="text-[10px] tabular-nums text-neutral-500">
                12 Candidates
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Query projected to dense hypersphere; scans semantic proposition pool via cosine similarity.
            </p>
          </div>

          {/* Stage 2 */}
          <div className={`p-4 rounded-md border transition-colors ${
            activeStep >= 2
              ? 'bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700'
              : 'bg-neutral-50/40 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 opacity-50'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Cross-Encoder</span>
              </span>
              <span className="text-[10px] tabular-nums text-neutral-900 dark:text-white font-bold">
                {retrievalResult[0] ? `${(retrievalResult[0].finalScore * 100).toFixed(1)}% Logit` : 'Scoring'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Pairwise token cross-attention verifies entity bindings, exact numbers, and numeric accuracy.
            </p>
          </div>

          {/* Stage 3 */}
          <div className={`p-4 rounded-md border transition-colors ${
            activeStep >= 3
              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-700'
              : 'bg-neutral-50/40 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 opacity-50'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                <span className="text-neutral-900 dark:text-white">Grounded Citations</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Pass Verified
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Synthesizes answer with verifiable document citation tags linked to exact page propositions.
            </p>
          </div>
        </div>

        {/* Live Synthesized Result Card */}
        {topChunk && (
          <div className="p-4 rounded-md bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Grounded Evidence in {topChunk.docName}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
                <span>Page {topChunk.pageNo}</span>
                <span>·</span>
                <span>Chunk #{topChunk.chunkIndex}</span>
                <span>·</span>
                <span className="text-neutral-900 dark:text-white font-bold tabular-nums">
                  Score: {retrievalResult[0]?.finalScore.toFixed(3)}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
              {topChunk.text}
            </p>

            {/* Interactive Citation Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] uppercase font-mono text-neutral-500">
                Grounded Citations:
              </span>
              {retrievalResult.map((r) => (
                <button
                  key={r.chunk.id}
                  onClick={() => setSelectedChunk(selectedChunk?.id === r.chunk.id ? null : r.chunk)}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-mono border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedChunk?.id === r.chunk.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                      : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Click to view passage excerpt"
                >
                  <span>{r.chunk.docName.slice(0, 16)}… p.{r.chunk.pageNo}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>

            {/* Expanded Chunk Details if clicked */}
            {selectedChunk && (
              <div className="p-3 bg-white dark:bg-neutral-900 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-mono space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500 font-bold">
                  <span>Passage Proposition: {selectedChunk.docName} (Page {selectedChunk.pageNo})</span>
                  <span className="tabular-nums">{selectedChunk.tokenCount} tokens</span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-sans text-xs leading-relaxed">
                  {selectedChunk.text}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
            Test with custom corporate filings or lecture PDFs in the workspace.
          </span>
          <Button
            onClick={() => onLaunchWorkspace('chat')}
            className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md text-xs font-semibold px-4 py-2 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          >
            <span>Launch Full Workspace with this Query</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
