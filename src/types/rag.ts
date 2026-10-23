/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ChunkingStrategy = 'fixed' | 'recursive' | 'semantic';

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  pageNo: number;
  chunkIndex: number;
  strategy: ChunkingStrategy;
  text: string;
  tokenCount: number;
  embedding?: number[];
  charStart?: number;
  charEnd?: number;
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  pageCount: number;
  uploadDate: string;
  rawText: string;
  chunks: DocumentChunk[];
  activeStrategy: ChunkingStrategy;
}

export interface Citation {
  sourceFile: string;
  pageNo: number;
  chunkIndex: number;
  chunkId: string;
  quote?: string;
  relevanceScore: number;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  vectorScore: number;
  rerankScore: number;
  finalScore: number;
  rank: number;
  isTopK: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  retrievedChunks?: RetrievalResult[];
  citations?: Citation[];
  latencyMs?: number;
  strategyUsed?: ChunkingStrategy;
  rerankerEnabled?: boolean;
  isStreaming?: boolean;
  reasoning?: string;
  reasoningSteps?: string[];
  thinkingDurationMs?: number;
  isGrounded?: boolean;
}

export interface EvalTestCase {
  id: string;
  question: string;
  groundTruth: string;
  sourceDoc: string;
  sourcePage: number;
  sourceChunkId: string;
  expectedKeywords: string[];
}

export interface EvalRunResult {
  strategy: ChunkingStrategy;
  rerankerEnabled: boolean;
  totalQuestions: number;
  hitCountAt1: number;
  hitCountAt3: number;
  hitCountAt5: number;
  hitRateAt3: number; // e.g. 86.2%
  precisionAt3: number;
  mrr: number; // Mean Reciprocal Rank
  faithfulnessScore: number; // % answers strictly aligned with ground truth
  avgLatencyMs: number;
  timestamp: string;
  results: {
    testId: string;
    question: string;
    groundTruth: string;
    retrievedChunkIds: string[];
    isHit: boolean;
    reciprocalRank: number;
    answerGenerated?: string;
    latencyMs: number;
  }[];
}
