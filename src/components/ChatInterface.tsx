/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FileText,
  Layers,
  ChevronDown,
  Check,
  Paperclip,
  X,
  AlertCircle,
  Loader2,
  Copy,
  CheckCheck,
  Bot,
  User,
  ArrowUp,
  HelpCircle,
  BookOpen,
  Target,
  FileCheck
} from 'lucide-react';
import { ChatMessage, ChunkingStrategy, DocumentFile } from '../types/rag';
import { parseAndProcessDocumentFile } from '../utils/chunking';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  ChatBubbleActionWrapper
} from './ui/chat-bubble';
import { ChatInput } from './ui/chat-input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Reasoning } from './ui/reasoning';
import { Shimmer, ShimmerText, ShimmerReasoning } from './ui/shimmer';
import { Sources } from './ui/sources';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onClearChat: () => void;
  onCitationClick: (chunkId: string) => void;
  onOpenSources: () => void;
  strategy: ChunkingStrategy;
  useReranker: boolean;
  documents: DocumentFile[];
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  onAddDocument: (doc: DocumentFile) => void;
  onOpenDocumentLibrary: () => void;
}

const SHADCN_STARTER_CARDS = [
  {
    icon: Target,
    title: "High-Yield Exam Questions",
    description: "Predict end-semester exam questions with key scoring points.",
    query: "Which questions are high in likelihood to come in the end sem exam from this document?"
  },
  {
    icon: FileCheck,
    title: "2, 5 & 10 Mark Frameworks",
    description: "Generate structured short and long answer model responses.",
    query: "Generate high-yield 2-mark, 5-mark, and 10-mark exam questions with key model answers."
  },
  {
    icon: Sparkles,
    title: "Core High-Yield Concepts",
    description: "Extract vital formulas, methodologies, and definitions.",
    query: "What are the most important core concepts, definitions, and technical processes to revise?"
  },
  {
    icon: BookOpen,
    title: "Executive Synthesis",
    description: "Structured summary of all modules, sections, and findings.",
    query: "Provide a structured executive summary of all core modules and topics in this document."
  }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isStreaming,
  onClearChat,
  onCitationClick,
  onOpenSources,
  strategy,
  useReranker,
  documents,
  activeDocId,
  setActiveDocId,
  onAddDocument,
  onOpenDocumentLibrary
}) => {
  const [inputText, setInputText] = useState('');
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDocDropdownOpen(false);
      }
    };
    if (docDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [docDropdownOpen]);

  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === activeDocId) || null;
  }, [documents, activeDocId]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isStreaming || isUploading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Direct file upload in composer
  const handleComposerFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const newDoc = await parseAndProcessDocumentFile(file, strategy);
      onAddDocument(newDoc);
      setActiveDocId(newDoc.id);
    } catch (err: any) {
      console.error('Composer upload error:', err);
      setUploadError(err.message || 'Failed to extract text from document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleComposerFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleComposerFileUpload(files[0]);
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  /**
   * Helper that replaces citation tags [Source: file, Page X, Chunk Y] with interactive readable badges.
   */
  const renderCitationsInText = (text: string, keyPrefix: string): React.ReactNode[] => {
    const citationRegex = /\[Source:\s*([^,]+),\s*Page\s*(\d+)(?:,\s*Chunk\s*(\d+))?\]/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = citationRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = citationRegex.lastIndex;

      if (matchStart > lastIndex) {
        parts.push(text.substring(lastIndex, matchStart));
      }

      const fileName = match[1].trim();
      const pageNo = match[2].trim();
      const chunkIdx = match[3] ? match[3].trim() : '1';
      const chunkId = `${fileName}_chunk_${chunkIdx}`;
      const shortName = fileName.replace(/\.[^/.]+$/, '').slice(0, 16);

      parts.push(
        <button
          key={`${keyPrefix}_cite_${matchStart}`}
          onClick={(e) => {
            e.stopPropagation();
            onCitationClick(chunkId);
          }}
          title={`View grounded passage in ${fileName} (Page ${pageNo})`}
          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 text-[11px] font-sans font-medium rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer align-baseline select-none"
        >
          <span>{shortName}…</span>
          <span>p.{pageNo}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </button>
      );

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  /**
   * Helper that formats LaTeX and math symbols (e.g. $V_{th}$, $R_B$, \approx, \Omega)
   */
  const renderMathExpression = (rawExpr: string, key: string): React.ReactNode => {
    let expr = rawExpr.replace(/^\${1,2}|\${1,2}$/g, '').trim();

    // Map common LaTeX operators and symbols to clean Unicode
    expr = expr
      .replace(/\\approx/g, '≈')
      .replace(/\\le|\\leq/g, '≤')
      .replace(/\\ge|\\geq/g, '≥')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±')
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\mu/g, 'µ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\pi/g, 'π')
      .replace(/\\rightarrow|\\to/g, '→')
      .replace(/\\infty/g, '∞');

    // Parse subscripts and superscripts: e.g. V_{th}, R_B, V_{CE(sat)}, I_B, x^2
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    const regex = /([A-Za-z])(?:_\{([^}]+)\}|_([A-Za-z0-9\(\)]+))?(?:\^\{([^}]+)\}|\^([A-Za-z0-9]+))?/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(expr)) !== null) {
      if (match.index > lastIdx) {
        parts.push(expr.substring(lastIdx, match.index));
      }
      const base = match[1];
      const sub = match[2] || match[3];
      const sup = match[4] || match[5];

      if (sub || sup) {
        parts.push(
          <span key={`${key}_m_${match.index}`} className="font-serif italic font-medium inline-flex items-baseline">
            <span>{base}</span>
            {sub && <sub className="text-[10px] not-italic font-sans font-semibold ml-0.5">{sub}</sub>}
            {sup && <sup className="text-[10px] not-italic font-sans font-semibold ml-0.5">{sup}</sup>}
          </span>
        );
      } else {
        parts.push(
          <span key={`${key}_m_${match.index}`} className="font-serif italic font-medium">
            {base}
          </span>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < expr.length) {
      parts.push(expr.substring(lastIdx));
    }

    return (
      <span
        key={key}
        className="inline-flex items-baseline mx-0.5 px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-serif text-[12px] select-text border border-indigo-500/20"
      >
        {parts.length > 0 ? parts : expr}
      </span>
    );
  };

  /**
   * Distinguishes true LaTeX/math equations from normal currency amounts (e.g. $11,353 million)
   */
  const isActualMathFormula = (piece: string): boolean => {
    if (piece.startsWith('$$') && piece.endsWith('$$')) return true;
    if (!piece.startsWith('$') || !piece.endsWith('$') || piece.length <= 2) return false;
    const inner = piece.slice(1, -1).trim();
    // Currency patterns: $11,353, $100, $8,411 million, $15.3 billion, $2.12
    if (/^[\d,.]+(?:\s*(?:million|billion|trillion|k|m|b))?$/i.test(inner)) return false;
    // Common financial/prose words that indicate natural language prose rather than LaTeX math:
    if (/\b(?:million|billion|revenues?|income|profit|compared|quarter|operating|share|growth|percent|increase|decrease|diluted)\b/i.test(inner)) return false;
    // Check for LaTeX / formula indicators:
    return /[\\_{}^=±×·≈≤≥]|V_[A-Za-z]|R_[A-Za-z]|I_[A-Za-z]|V_{|R_{|I_{/.test(inner);
  };

  /**
   * Inline text parser for bold, italics, code, math formulas, and citations.
   */
  const renderInlineFormatted = (rawText: string, keyPrefix: string): React.ReactNode => {
    const tokenRegex = /(\$\$[^\$]+\$\$|\$[^\$]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[Source:[^\]]+\])/g;
    const pieces = rawText.split(tokenRegex);

    return (
      <span key={keyPrefix}>
        {pieces.map((piece, i) => {
          if (!piece) return null;
          const key = `${keyPrefix}_p_${i}`;

          if (piece.startsWith('`') && piece.endsWith('`')) {
            return (
              <code key={key} className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-muted text-foreground border border-border">
                {piece.slice(1, -1)}
              </code>
            );
          }
          if (piece.startsWith('**') && piece.endsWith('**')) {
            return (
              <strong key={key} className="font-semibold text-foreground">
                {piece.slice(2, -2)}
              </strong>
            );
          }
          if (piece.startsWith('*') && piece.endsWith('*')) {
            return (
              <em key={key} className="italic text-foreground/90">
                {piece.slice(1, -1)}
              </em>
            );
          }
          if (piece.startsWith('$') && piece.endsWith('$')) {
            if (isActualMathFormula(piece)) {
              return renderMathExpression(piece, key);
            }
            return <span key={key}>{piece}</span>;
          }
          if (piece.startsWith('[Source:') && piece.endsWith(']')) {
            return renderCitationsInText(piece, key);
          }

          return renderCitationsInText(piece, key);
        })}
      </span>
    );
  };

  /**
   * Rich Markdown block parser supporting headers, lists, blockquotes, and citations.
   */
  const renderMarkdownContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    let listOrdered = false;

    const flushList = () => {
      if (inList && listItems.length > 0) {
        if (listOrdered) {
          elements.push(
            <ol key={`ol_${elements.length}`} className="my-2.5 space-y-1.5 pl-5 list-decimal text-foreground text-xs md:text-sm">
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul_${elements.length}`} className="my-2.5 space-y-1.5 pl-5 list-disc text-foreground text-xs md:text-sm">
              {listItems}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        continue;
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3_${i}`} className="mt-4 mb-2 text-sm md:text-base font-semibold text-foreground flex items-center gap-1.5">
            {renderInlineFormatted(trimmed.slice(4), `h3_${i}`)}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2_${i}`} className="mt-5 mb-2.5 text-base md:text-lg font-semibold text-foreground border-b border-border pb-1">
            {renderInlineFormatted(trimmed.slice(3), `h2_${i}`)}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1_${i}`} className="mt-6 mb-3 text-lg md:text-xl font-bold text-foreground">
            {renderInlineFormatted(trimmed.slice(2), `h1_${i}`)}
          </h1>
        );
        continue;
      }

      // Unordered list item
      if (/^[-*•]\s+/.test(trimmed)) {
        inList = true;
        listOrdered = false;
        const itemText = trimmed.replace(/^[-*•]\s+/, '');
        listItems.push(
          <li key={`li_${i}`} className="leading-relaxed">
            {renderInlineFormatted(itemText, `li_text_${i}`)}
          </li>
        );
        continue;
      }

      // Ordered list item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        inList = true;
        listOrdered = true;
        listItems.push(
          <li key={`li_num_${i}`} className="leading-relaxed">
            {renderInlineFormatted(numMatch[2], `li_num_text_${i}`)}
          </li>
        );
        continue;
      }

      // Blockquote / note
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <div key={`bq_${i}`} className="my-2.5 pl-3 border-l-2 border-indigo-500 bg-muted/40 py-1.5 text-xs text-muted-foreground italic rounded-r-md">
            {renderInlineFormatted(trimmed.slice(2), `bq_${i}`)}
          </div>
        );
        continue;
      }

      // Standard paragraph
      flushList();
      elements.push(
        <p key={`p_${i}`} className="my-2 leading-relaxed text-xs md:text-sm text-foreground">
          {renderInlineFormatted(trimmed, `p_${i}`)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-12 text-center">
            {/* shadcn Hero Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4 text-foreground shadow-xs">
              <GraduationCap className="w-6 h-6 text-indigo-500" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              DocuQA Document & Knowledge Intelligence
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
              Ask deep questions, predict semester exam topics, and verify statements with multi-stage cross-encoder re-ranking.
            </p>

            {/* shadcn Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {SHADCN_STARTER_CARDS.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <Card
                    key={idx}
                    onClick={() => onSendMessage(card.query)}
                    className="cursor-pointer hover:border-border hover:bg-accent/40 transition-all shadow-2xs group"
                  >
                    <CardHeader className="p-3.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-secondary text-foreground group-hover:text-indigo-500 transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-xs font-medium text-foreground">
                          {card.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-[11px] text-muted-foreground line-clamp-2 leading-normal">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <ChatBubble
                  key={msg.id}
                  variant={isUser ? "sent" : "received"}
                >
                  {/* Avatar */}
                  <ChatBubbleAvatar
                    className={
                      isUser
                        ? "bg-secondary text-secondary-foreground border-border"
                        : "bg-indigo-600 text-white border-indigo-500"
                    }
                    fallback={
                      isUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )
                    }
                  />

                  {/* Message Bubble Body */}
                  <div className={isUser ? "min-w-0 flex flex-col items-end" : "flex-1 min-w-0"}>
                    <ChatBubbleMessage
                      variant={isUser ? "sent" : "received"}
                      className={isUser ? "w-fit max-w-full" : undefined}
                    >
                      {isUser ? (
                        /* Direct high-contrast text rendering for user messages */
                        <p className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm text-primary-foreground font-normal select-text break-words">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {/* Chain of Thought / Live AI Reasoning Accordion */}
                          {(msg.isGrounded === true || msg.reasoning || msg.isThinking) && (msg.reasoningSteps?.length || msg.reasoning || msg.isThinking) ? (
                            <Reasoning
                              steps={msg.reasoningSteps}
                              reasoningText={msg.reasoning}
                              durationMs={msg.thinkingDurationMs}
                              isThinking={msg.isThinking ?? (msg.isStreaming && !msg.content)}
                              defaultOpen={Boolean(msg.isThinking || msg.reasoning)}
                            />
                          ) : null}

                          {/* Grounded Interactive Sources Cards (Only for document-grounded queries) */}
                          {msg.isGrounded === true && msg.retrievedChunks && msg.retrievedChunks.length > 0 && !msg.isStreaming ? (
                            <Sources
                              sources={msg.retrievedChunks}
                              onSelectSource={onCitationClick}
                              onOpenAllSources={onOpenSources}
                              maxVisible={3}
                            />
                          ) : null}

                          {/* Synthesized Answer or Shimmer Loading State */}
                          {msg.content ? (
                            <div className="pt-1">
                              {renderMarkdownContent(msg.content)}
                              {msg.isStreaming && (
                                <span className="inline-block w-1.5 h-3.5 ml-1 bg-neutral-900 dark:bg-neutral-100 animate-pulse align-middle" />
                              )}
                            </div>
                          ) : msg.isStreaming ? (
                            <div className="py-1">
                              <ShimmerText lines={msg.isThinking ? 2 : 3} />
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">No answer generated.</span>
                          )}
                        </div>
                      )}

                      {/* Assistant Actions & Source Grounding Footer */}
                      {!isUser && msg.content && !msg.isStreaming && (
                        <ChatBubbleActionWrapper>
                          {/* Grounded sources trigger */}
                          {msg.isGrounded === true && msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                            <button
                              onClick={onOpenSources}
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-colors cursor-pointer mr-2"
                              title="Inspect grounded source chunks"
                            >
                              <Layers className="w-3 h-3" />
                              <span>{msg.retrievedChunks.length} sources grounded</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          <div className="flex-1" />

                          {/* Strategy & Latency */}
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mr-2">
                            {msg.strategyUsed || strategy} · {msg.latencyMs ? `${msg.latencyMs}ms` : '380ms'}
                          </span>

                          {/* Copy button */}
                          <ChatBubbleAction
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            title="Copy message to clipboard"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <CheckCheck className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </ChatBubbleAction>
                        </ChatBubbleActionWrapper>
                      )}
                    </ChatBubbleMessage>

                    {/* Timestamp */}
                    <ChatBubbleTimestamp
                      timestamp={msg.timestamp}
                      className={isUser ? "text-right" : "text-left"}
                    />
                  </div>
                </ChatBubble>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Centered Input Bar & shadcn Composer Component */}
      <div className="p-4 md:p-5 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto">
          {/* Quick Action Prompt Badges */}
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
            {SHADCN_STARTER_CARDS.map((card, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(card.query)}
                disabled={isStreaming}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded-lg border border-border bg-card text-foreground hover:bg-accent hover:border-border transition-colors cursor-pointer shrink-0 disabled:opacity-40 shadow-2xs"
              >
                {card.title}
              </button>
            ))}
          </div>

          {/* Minimal shadcn Composer Container */}
          <form
            onSubmit={handleSubmit}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border transition-all bg-card shadow-xs flex flex-col ${
              isDragging
                ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/5'
                : 'border-input focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20'
            }`}
          >
            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
            />

            {/* Attached Document Pill (if active document selected) */}
            {activeDoc && (
              <div className="pt-2 px-3 flex items-center">
                <Badge variant="indigo" className="py-0.5 px-2 text-[11px] max-w-[280px] truncate flex items-center gap-1.5 shadow-2xs">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activeDoc.name}</span>
                  <span className="text-[10px] font-mono opacity-70 shrink-0">({activeDoc.pageCount}p)</span>
                  <button
                    type="button"
                    onClick={() => setActiveDocId(null)}
                    title="Clear filter (Search across all documents)"
                    className="ml-0.5 p-0.5 hover:bg-indigo-500/20 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}

            {/* Upload Error Banner if any */}
            {uploadError && (
              <div className="mx-3 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between text-xs text-destructive">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button type="button" onClick={() => setUploadError(null)} className="cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* shadcn ChatInput Component */}
            <div className="px-2 pt-2 pb-1 flex-1">
              <ChatInput
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeDoc
                    ? `Ask about ${activeDoc.name}... (Enter to send)`
                    : "Ask anything grounded in documents or drop a PDF here... (Enter to send)"
                }
                maxHeight={200}
              />
            </div>

            {/* Minimal Integrated Bottom Action Row */}
            <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-2 text-xs">
              {/* Left: Query Scope Dropdown & Attach Button */}
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Query Scope Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDocDropdownOpen(!docDropdownOpen)}
                    className="h-7 px-2.5 text-[11px] gap-1 font-medium max-w-[220px]"
                    title="Change search scope"
                  >
                    <Layers className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {activeDoc ? activeDoc.name : `All Docs (${documents.length})`}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0 opacity-70" />
                  </Button>

                  {/* Dropdown Menu */}
                  {docDropdownOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 text-xs">
                      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Search Scope
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDocId(null);
                          setDocDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          activeDocId === null
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>All Documents ({documents.length})</span>
                        </div>
                        {activeDocId === null && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                      </button>

                      <div className="border-t border-border my-1" />

                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setActiveDocId(doc.id);
                            setDocDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            activeDocId === doc.id
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                              : 'text-foreground hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate" title={doc.name}>{doc.name}</span>
                          </div>
                          {activeDocId === doc.id && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                        </button>
                      ))}

                      <div className="border-t border-border my-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDocDropdownOpen(false);
                            onOpenDocumentLibrary();
                          }}
                          className="w-full text-center py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                        >
                          Manage Documents Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attach PDF button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach PDF, DOCX, or TXT"
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach PDF</span>
                </Button>

                {/* Uploading Status */}
                {isUploading && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-500 animate-pulse px-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Extracting...</span>
                  </div>
                )}
              </div>

              {/* Right: Clear & Send actions */}
              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    onClick={onClearChat}
                    className="text-muted-foreground hover:text-foreground"
                    title="Clear chat history"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}

                <Button
                  type="submit"
                  size="iconSm"
                  disabled={!inputText.trim() || isStreaming || isUploading}
                  className="rounded-lg h-7 w-7"
                  title="Send message (Enter)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
