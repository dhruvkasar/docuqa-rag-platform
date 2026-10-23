/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChunkingStrategy, DocumentChunk, DocumentFile } from '../types/rag';
import mammoth from 'mammoth';

/**
 * Normalizes text, cleans repetitive headers/footers and excess whitespace.
 */
export function cleanDocumentText(raw: string): string {
  if (!raw) return '';
  return raw
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove typical header/footer artifact lines (e.g., "Page 1 of 12", "CONFIDENTIAL")
    .replace(/^[ \t]*(?:Page \d+ of \d+|Confidential & Proprietary|All Rights Reserved)[ \t]*$/gim, '')
    // Filter unprintable control characters and unicode replacement glyphs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/g, ' ')
    // Normalize excessive consecutive blank lines to double newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Estimates token count for English text (approx. 4 chars per token).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // A blend of whitespace word-count and character heuristic
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.max(1, Math.round((words * 1.3 + chars / 4) / 2));
}

interface PageSpan {
  pageNo: number;
  startChar: number;
  endChar: number;
}

/**
 * Identifies page markers (e.g., "--- Page 1 ---") and indexes character offsets.
 */
function findPageSpans(text: string): PageSpan[] {
  const pageRegex = /--- Page (\d+) ---/g;
  const spans: PageSpan[] = [];
  let match: RegExpExecArray | null;

  while ((match = pageRegex.exec(text)) !== null) {
    const pageNo = parseInt(match[1], 10);
    const startChar = match.index;
    if (spans.length > 0) {
      spans[spans.length - 1].endChar = startChar;
    }
    spans.push({ pageNo, startChar, endChar: text.length });
  }

  if (spans.length === 0) {
    // If no explicit page markers, simulate 1 page per 2500 characters
    const totalPages = Math.max(1, Math.ceil(text.length / 2500));
    for (let p = 1; p <= totalPages; p++) {
      spans.push({
        pageNo: p,
        startChar: (p - 1) * 2500,
        endChar: Math.min(text.length, p * 2500)
      });
    }
  }

  return spans;
}

function getPageForOffset(spans: PageSpan[], charOffset: number): number {
  for (const span of spans) {
    if (charOffset >= span.startChar && charOffset <= span.endChar) {
      return span.pageNo;
    }
  }
  return spans[0]?.pageNo || 1;
}

/**
 * 1. Fixed-Size Chunking (512 tokens, 50 token overlap)
 * Splits text uniformly by token length with sliding window overlap.
 */
export function chunkFixedSize(
  text: string,
  docId: string,
  docName: string,
  chunkTokenSize = 512,
  overlapTokens = 50
): DocumentChunk[] {
  const clean = cleanDocumentText(text);
  const spans = findPageSpans(clean);
  const words = clean.split(/\s+/);
  const chunks: DocumentChunk[] = [];

  // Approximate words per chunk (512 tokens ≈ 384 words)
  const wordsPerChunk = Math.max(20, Math.round(chunkTokenSize * 0.75));
  const overlapWords = Math.max(5, Math.round(overlapTokens * 0.75));
  const step = Math.max(1, wordsPerChunk - overlapWords);

  let chunkIdx = 1;
  let wordIndex = 0;

  while (wordIndex < words.length) {
    const chunkWords = words.slice(wordIndex, wordIndex + wordsPerChunk);
    const chunkText = chunkWords.join(' ').trim();
    if (chunkText.length > 10) {
      // Find approximate character offset in text
      const approxChar = Math.round((wordIndex / Math.max(1, words.length)) * clean.length);
      const pageNo = getPageForOffset(spans, approxChar);

      chunks.push({
        id: `${docName}_chunk_${chunkIdx}`,
        docId,
        docName,
        pageNo,
        chunkIndex: chunkIdx,
        strategy: 'fixed',
        text: chunkText,
        tokenCount: estimateTokens(chunkText),
        charStart: approxChar,
        charEnd: approxChar + chunkText.length
      });
      chunkIdx++;
    }
    wordIndex += step;
    if (wordIndex + overlapWords >= words.length && wordIndex < words.length) {
      // Last tail
      break;
    }
  }

  return chunks;
}

/**
 * 2. Recursive Character Splitter
 * Recursively splits by hierarchy of delimiters: ["\n\n", "\n", ". ", "? ", "! ", " ", ""]
 */
export function chunkRecursive(
  text: string,
  docId: string,
  docName: string,
  targetTokenSize = 420,
  overlapTokens = 40
): DocumentChunk[] {
  const clean = cleanDocumentText(text);
  const spans = findPageSpans(clean);
  const chunks: DocumentChunk[] = [];
  const targetChars = targetTokenSize * 4;
  const overlapChars = overlapTokens * 4;

  const delimiters = ['\n\n', '\n', '. ', '? ', '! ', ' '];

  function splitRecursive(subText: string, delimIndex: number): string[] {
    if (subText.length <= targetChars || delimIndex >= delimiters.length) {
      return [subText];
    }

    const delim = delimiters[delimIndex];
    const parts = subText.split(delim);
    const result: string[] = [];
    let current = '';

    for (const part of parts) {
      const candidate = current ? current + delim + part : part;
      if (candidate.length <= targetChars) {
        current = candidate;
      } else {
        if (current) result.push(current);
        if (part.length > targetChars) {
          result.push(...splitRecursive(part, delimIndex + 1));
          current = '';
        } else {
          current = part;
        }
      }
    }

    if (current) result.push(current);
    return result;
  }

  const rawBlocks = splitRecursive(clean, 0);
  let chunkIdx = 1;
  let runningChar = 0;

  for (let i = 0; i < rawBlocks.length; i++) {
    let blockText = rawBlocks[i].trim();
    if (!blockText) continue;

    // Apply overlap with previous block if available
    if (i > 0 && overlapChars > 0) {
      const prev = rawBlocks[i - 1].trim();
      const overlapSlice = prev.slice(-overlapChars);
      const spaceIdx = overlapSlice.indexOf(' ');
      if (spaceIdx !== -1) {
        blockText = overlapSlice.slice(spaceIdx + 1) + ' ' + blockText;
      }
    }

    const pageNo = getPageForOffset(spans, runningChar);
    chunks.push({
      id: `${docName}_chunk_${chunkIdx}`,
      docId,
      docName,
      pageNo,
      chunkIndex: chunkIdx,
      strategy: 'recursive',
      text: blockText,
      tokenCount: estimateTokens(blockText),
      charStart: runningChar,
      charEnd: runningChar + blockText.length
    });

    runningChar += rawBlocks[i].length;
    chunkIdx++;
  }

  return chunks;
}

/**
 * 3. Semantic Chunking
 * Splits on thematic boundaries, section titles, headers, and cohesive topic propositions.
 * Ensures complete thoughts, tables, and financial/technical statements stay grouped.
 */
export function chunkSemantic(
  text: string,
  docId: string,
  docName: string,
  targetTokenSize = 460
): DocumentChunk[] {
  const clean = cleanDocumentText(text);
  const spans = findPageSpans(clean);
  const chunks: DocumentChunk[] = [];

  // Break by sections and paragraphs first
  const rawSections = clean.split(/(?=--- Page \d+ ---|[A-Z0-9\s-]{4,}:)/g);
  let chunkIdx = 1;
  let runningChar = 0;

  for (const section of rawSections) {
    const trimmedSection = section.trim();
    if (!trimmedSection) continue;

    // If section fits in semantic target size, keep it as a cohesive semantic unit
    if (estimateTokens(trimmedSection) <= targetTokenSize) {
      const pageNo = getPageForOffset(spans, runningChar);
      chunks.push({
        id: `${docName}_chunk_${chunkIdx}`,
        docId,
        docName,
        pageNo,
        chunkIndex: chunkIdx,
        strategy: 'semantic',
        text: trimmedSection,
        tokenCount: estimateTokens(trimmedSection),
        charStart: runningChar,
        charEnd: runningChar + trimmedSection.length
      });
      chunkIdx++;
      runningChar += section.length;
    } else {
      // Decompose larger semantic section by sentence cluster
      const sentences = trimmedSection.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [trimmedSection];
      let cluster = '';

      for (const sentence of sentences) {
        if (estimateTokens(cluster + ' ' + sentence) <= targetTokenSize) {
          cluster = cluster ? cluster + ' ' + sentence.trim() : sentence.trim();
        } else {
          if (cluster) {
            const pageNo = getPageForOffset(spans, runningChar);
            chunks.push({
              id: `${docName}_chunk_${chunkIdx}`,
              docId,
              docName,
              pageNo,
              chunkIndex: chunkIdx,
              strategy: 'semantic',
              text: cluster,
              tokenCount: estimateTokens(cluster),
              charStart: runningChar,
              charEnd: runningChar + cluster.length
            });
            chunkIdx++;
            runningChar += cluster.length;
          }
          cluster = sentence.trim();
        }
      }

      if (cluster) {
        const pageNo = getPageForOffset(spans, runningChar);
        chunks.push({
          id: `${docName}_chunk_${chunkIdx}`,
          docId,
          docName,
          pageNo,
          chunkIndex: chunkIdx,
          strategy: 'semantic',
          text: cluster,
          tokenCount: estimateTokens(cluster),
          charStart: runningChar,
          charEnd: runningChar + cluster.length
        });
        chunkIdx++;
        runningChar += cluster.length;
      }
    }
  }

  return chunks;
}

/**
 * Execute chunking for a document based on specified strategy.
 */
export function processDocumentChunks(
  text: string,
  docId: string,
  docName: string,
  strategy: ChunkingStrategy
): DocumentChunk[] {
  switch (strategy) {
    case 'fixed':
      return chunkFixedSize(text, docId, docName);
    case 'recursive':
      return chunkRecursive(text, docId, docName);
    case 'semantic':
      return chunkSemantic(text, docId, docName);
    default:
      return chunkSemantic(text, docId, docName);
  }
}

/**
 * Universal document parser and chunk processor for PDF, DOCX, TXT, and MD files.
 */
export async function parseAndProcessDocumentFile(
  file: File,
  activeStrategy: ChunkingStrategy
): Promise<DocumentFile> {
  let extractedText = '';
  let detectedPageCount = 1;
  const fileName = file.name;

  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    extractedText = await file.text();
  } else if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    extractedText = result.value;
  } else if (fileName.toLowerCase().endsWith('.pdf')) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const commaIdx = res.indexOf(',');
        resolve(commaIdx !== -1 ? res.slice(commaIdx + 1) : res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const resp = await fetch('/api/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64: base64, fileName })
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to extract text from PDF.');
    }

    const data = await resp.json();
    extractedText = data.text || '';
    detectedPageCount = data.pageCount || 1;
  } else {
    throw new Error('Please upload a PDF, DOCX, or TXT file.');
  }

  const cleaned = cleanDocumentText(extractedText);
  if (!cleaned.trim()) {
    throw new Error('No readable text found. If this is a scanned/image PDF, please use a text-based or OCR-processed PDF.');
  }

  const docId = `doc_${Date.now()}`;
  const chunks = processDocumentChunks(cleaned, docId, fileName, activeStrategy);

  return {
    id: docId,
    name: fileName,
    size: file.size,
    type: file.type || fileName.split('.').pop() || 'text/plain',
    pageCount: detectedPageCount || Math.max(1, Math.ceil(cleaned.length / 2200)),
    uploadDate: new Date().toLocaleDateString(),
    rawText: cleaned,
    chunks,
    activeStrategy
  };
}
