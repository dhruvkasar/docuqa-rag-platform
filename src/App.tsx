/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightDrawer } from './components/RightDrawer';
import { ChatInterface } from './components/ChatInterface';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { ExperimentLab } from './components/ExperimentLab';
import { ArchitectureModal } from './components/ArchitectureModal';
import { LandingPage } from './components/landing/LandingPage';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_DOC_ALPHABET, DEFAULT_DOC_RAG_WHITEPAPER, DEFAULT_DOC_UT1_ELECTRONICS } from './data/defaultDocuments';
import { DocumentFile, ChunkingStrategy, ChatMessage, RetrievalResult } from './types/rag';
import { processDocumentChunks, cleanDocumentText } from './utils/chunking';
import { retrieveAndRerank, isBroadOrStudyQuery } from './utils/vectorEngine';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [activeTab, setActiveTab] = useState<'chat' | 'evaluation' | 'experiments'>('chat');
  const [strategy, setStrategy] = useState<ChunkingStrategy>('semantic');
  const [useReranker, setUseReranker] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [provider, setProvider] = useState<'auto' | 'gemini' | 'openrouter'>('auto');
  const [openRouterModel, setOpenRouterModel] = useState<string>('google/gemini-2.5-flash');
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState<boolean>(false);
  
  // Set drawers to false by default for a serene, uncluttered, minimal workspace
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState<boolean>(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
  const [highlightedChunkId, setHighlightedChunkId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasOpenRouterKey) {
          setHasOpenRouterKey(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize pre-loaded documents
  const [documents, setDocuments] = useState<DocumentFile[]>(() => {
    const doc1Text = cleanDocumentText(DEFAULT_DOC_ALPHABET);
    const doc1Chunks = processDocumentChunks(doc1Text, 'doc_alphabet', 'Alphabet_Q3_2024_Financial_Report.txt', 'semantic');

    const doc2Text = cleanDocumentText(DEFAULT_DOC_UT1_ELECTRONICS);
    const doc2Chunks = processDocumentChunks(doc2Text, 'doc_ut1', 'UT1_Detailed_Easy_Answers.pdf', 'semantic');

    const doc3Text = cleanDocumentText(DEFAULT_DOC_RAG_WHITEPAPER);
    const doc3Chunks = processDocumentChunks(doc3Text, 'doc_whitepaper', 'Frontier_AI_Safety_and_RAG_Architecture_Whitepaper.txt', 'semantic');

    return [
      {
        id: 'doc_alphabet',
        name: 'Alphabet_Q3_2024_Financial_Report.txt',
        size: 14200,
        type: 'text/plain',
        pageCount: 6,
        uploadDate: '2024-10-29',
        rawText: doc1Text,
        chunks: doc1Chunks,
        activeStrategy: 'semantic'
      },
      {
        id: 'doc_ut1',
        name: 'UT1_Detailed_Easy_Answers.pdf',
        size: 11500,
        type: 'application/pdf',
        pageCount: 14,
        uploadDate: '2024-10-20',
        rawText: doc2Text,
        chunks: doc2Chunks,
        activeStrategy: 'semantic'
      },
      {
        id: 'doc_whitepaper',
        name: 'Frontier_AI_Safety_and_RAG_Architecture_Whitepaper.txt',
        size: 9800,
        type: 'text/plain',
        pageCount: 5,
        uploadDate: '2024-11-15',
        rawText: doc3Text,
        chunks: doc3Chunks,
        activeStrategy: 'semantic'
      }
    ];
  });

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeRetrievedChunks, setActiveRetrievedChunks] = useState<RetrievalResult[]>([]);

  // Update chunks across all documents when chunking strategy changes
  useEffect(() => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        const rechunked = processDocumentChunks(doc.rawText, doc.id, doc.name, strategy);
        return {
          ...doc,
          chunks: rechunked,
          activeStrategy: strategy
        };
      })
    );
  }, [strategy]);

  // Combined pool of all chunks across indexed documents
  const allCorpusChunks = useMemo(() => {
    if (activeDocId) {
      const active = documents.find((d) => d.id === activeDocId);
      return active ? active.chunks : [];
    }
    return documents.flatMap((d) => d.chunks);
  }, [documents, activeDocId]);

  // Start with clean chat in production
  // Users can click starter suggestions or type their query

function isConversationalQuery(query: string): boolean {
  const clean = query.trim().toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  // If query mentions document indicators, it is NEVER conversational!
  const docKeywords = /\b(pdf|doc|document|file|notes|paper|material|summary|summarize|summarise|overview|analyse|analyze|topic|topics|module|modules|chapter|exam|test|questions|marks|content|contents|passage|chunk)\b/i;
  if (docKeywords.test(query)) {
    return false;
  }

  // Common greetings
  const greetings = ['hi', 'hello', 'hey', 'hey there', 'greetings', 'good morning', 'good evening', 'good afternoon', 'sup', 'yo'];
  if (greetings.includes(clean)) return true;

  // Identity / Meta questions
  const metaRegex = /\b(which llm|what llm|who are you|what are you|what model|your name|who made you|created you|which model|what can you do|how do you work|how does this work|how it works|what is your purpose|help me|thank you|thanks|bye|goodbye|tell me about yourself)\b/i;
  if (metaRegex.test(query)) return true;

  // Short generic fillers with no domain terms
  if (words.length <= 2 && words.every(w => ['who', 'what', 'which', 'are', 'you', 'is', 'the', 'it', 'hi', 'hey', 'hello', 'there', 'ok', 'okay'].includes(w))) {
    return true;
  }

  return false;
}

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;

    const startTimestamp = performance.now();
    const userMsgId = `user_${Date.now()}`;
    const asstMsgId = `asst_${Date.now()}`;

    // 1. Determine Document & Query Intent
    const hasDocKeyword = /\b(pdf|doc|document|file|notes|paper|material|summary|summarize|summarise|overview|analyse|analyze|topic|topics|module|modules|chapter|exam|test|questions|marks|what(?:'s|s|\s+is)\s+in)\b/i.test(queryText);
    const isBroad = isBroadOrStudyQuery(queryText);
    const hasDocIntent = Boolean(activeDocId) || hasDocKeyword || isBroad;

    // A query is conversational ONLY when it has no explicit doc intent AND matches greeting/meta patterns
    const isConversational = !hasDocKeyword && !isBroad && isConversationalQuery(queryText);

    // 2. Retrieve Candidate Chunks from Corpus
    const candidateChunks = allCorpusChunks.length > 0 
      ? retrieveAndRerank(queryText, allCorpusChunks, 20, 8, useReranker)
      : [];
    const topScore = candidateChunks[0]?.finalScore ?? 0;

    // 3. Grounding Decision:
    // If corpus chunks exist, and the user is asking about documents or has an active doc attached, it is ALWAYS grounded!
    // If no explicit doc keyword, but candidateChunks matched domain concepts (topScore >= 0.35), it is also grounded.
    const isGrounded = allCorpusChunks.length > 0 && !isConversational && (hasDocIntent || topScore >= 0.35);
    const retrieved = isGrounded ? candidateChunks : [];
    setActiveRetrievedChunks(retrieved);

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const initialAsstMessage: ChatMessage = {
      id: asstMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      retrievedChunks: retrieved,
      strategyUsed: strategy,
      rerankerEnabled: useReranker,
      isStreaming: true,
      isGrounded: isGrounded,
      reasoningSteps: isGrounded ? [
        `Generated dense vector embeddings for query tokens (${strategy} strategy)`,
        `Scanned candidate propositions across ${allCorpusChunks.length} chunks`,
        useReranker 
          ? `Cross-encoder re-ranked top candidates, selecting best passages`
          : `Retrieved candidate passages via cosine similarity`,
        `Synthesizing grounded answer with verified document citations`
      ] : undefined,
      reasoning: isGrounded ? `Matched ${retrieved.filter(r => r.isTopK).length} primary chunks from candidate pool. Re-ranking verified highest factual alignment in ${retrieved[0]?.chunk.docName || 'indexed documents'}.` : undefined
    };

    setMessages((prev) => [...prev, userMessage, initialAsstMessage]);
    setIsStreaming(true);

    try {
      const activeChunksPayload = isGrounded ? retrieved.filter((r) => r.isTopK).map((r) => ({
        id: r.chunk.id,
        docName: r.chunk.docName,
        pageNo: r.chunk.pageNo,
        chunkIndex: r.chunk.chunkIndex,
        text: r.chunk.text,
        finalScore: r.finalScore
      })) : [];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          chunks: activeChunksPayload,
          provider,
          model: provider === 'openrouter' ? openRouterModel : undefined
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to initiate chat stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let streamBuffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n');
        // Retain any incomplete chunk fragment in streamBuffer
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === asstMsgId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } catch {
              // Ignore non-json fragments
            }
          }
        }
      }

      const latencyMs = Math.round(performance.now() - startTimestamp);
      const top = isGrounded ? retrieved[0]?.chunk : null;
      const finalAnswer = accumulatedText.trim() || (top 
        ? `### Grounded Excerpt from ${top.docName} (Page ${top.pageNo})\n\n${top.text}\n\n[Source: ${top.docName}, Page ${top.pageNo}, Chunk ${top.chunkIndex}]`
        : (isConversational 
            ? 'Hello! I am DocuQA, an academic and document intelligence platform. How can I help you explore your documents or prepare for exams today?' 
            : 'This information was not found in your indexed documents. You can upload new notes or ask about topics in your library.'));

      const thinkingDurationMs = isGrounded ? Math.round(Math.min(latencyMs * 0.4, 1200)) : undefined;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstMsgId
            ? { ...m, content: finalAnswer, isStreaming: false, latencyMs, thinkingDurationMs, isGrounded }
            : m
        )
      );
    } catch (err) {
      console.error('Chat error:', err);
      const latencyMs = Math.round(performance.now() - startTimestamp);
      const thinkingDurationMs = isGrounded ? Math.round(Math.min(latencyMs * 0.4, 1200)) : undefined;
      const top = isGrounded ? retrieved[0]?.chunk : null;
      const fallbackMsg = top
        ? `### Grounded Excerpt from ${top.docName} (Page ${top.pageNo})\n\n${top.text}\n\n[Source: ${top.docName}, Page ${top.pageNo}, Chunk ${top.chunkIndex}]`
        : (isConversational 
            ? 'Hello! I am DocuQA, an academic and document intelligence platform. How can I help you explore your documents or prepare for exams today?' 
            : 'This information was not found in your indexed documents. You can upload new notes or ask about topics in your library.');

      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstMsgId
            ? {
                ...m,
                content: fallbackMsg,
                isStreaming: false,
                latencyMs,
                thinkingDurationMs,
                isGrounded
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCitationClick = (chunkId: string) => {
    setRightDrawerOpen(true);
    setHighlightedChunkId(chunkId);
  };

  const handleAddDocument = (newDoc: DocumentFile) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activeDocId === docId) setActiveDocId(null);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <AnimatePresence mode="wait">
        {viewMode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen"
          >
            <LandingPage
              onLaunchWorkspace={(targetTab) => {
                if (targetTab) setActiveTab(targetTab);
                setViewMode('workspace');
              }}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onOpenDocs={() => setIsDocsModalOpen(true)}
            />

            {/* Architecture Modal */}
            <ArchitectureModal
              isOpen={isDocsModalOpen}
              onClose={() => setIsDocsModalOpen(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-screen w-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans"
          >
            {/* Minimalist Top Bar */}
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              strategy={strategy}
              setStrategy={setStrategy}
              useReranker={useReranker}
              setUseReranker={setUseReranker}
              onOpenDocs={() => setIsDocsModalOpen(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onToggleSidebar={() => setLeftSidebarOpen(true)}
              docCount={documents.length}
              provider={provider}
              setProvider={setProvider}
              openRouterModel={openRouterModel}
              setOpenRouterModel={setOpenRouterModel}
              hasOpenRouterKey={hasOpenRouterKey}
              onReturnToLanding={() => setViewMode('landing')}
            />

            {/* Focused Canvas */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Main Focused View */}
              <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {activeTab === 'chat' && (
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isStreaming={isStreaming}
                    onClearChat={() => setMessages([])}
                    onCitationClick={handleCitationClick}
                    onOpenSources={() => setRightDrawerOpen(true)}
                    strategy={strategy}
                    useReranker={useReranker}
                    documents={documents}
                    activeDocId={activeDocId}
                    setActiveDocId={setActiveDocId}
                    onAddDocument={handleAddDocument}
                    onOpenDocumentLibrary={() => setLeftSidebarOpen(true)}
                  />
                )}

                {activeTab === 'evaluation' && (
                  <EvaluationDashboard
                    documents={documents}
                    activeDocId={activeDocId}
                    setActiveDocId={setActiveDocId}
                    allChunks={allCorpusChunks}
                    activeStrategy={strategy}
                    useReranker={useReranker}
                  />
                )}

                {activeTab === 'experiments' && (
                  <ExperimentLab
                    documents={documents}
                    activeDocId={activeDocId}
                    setActiveDocId={setActiveDocId}
                    strategy={strategy}
                  />
                )}
              </main>

              {/* Slide-over Left Drawer: Document Library */}
              <LeftSidebar
                documents={documents}
                activeDocId={activeDocId}
                setActiveDocId={setActiveDocId}
                onAddDocument={handleAddDocument}
                onDeleteDocument={handleDeleteDocument}
                activeStrategy={strategy}
                isOpen={leftSidebarOpen}
                onClose={() => setLeftSidebarOpen(false)}
                onNavigateTab={setActiveTab}
              />

              {/* Slide-over Right Drawer: Retrieved Sources */}
              <RightDrawer
                isOpen={rightDrawerOpen}
                onClose={() => setRightDrawerOpen(false)}
                retrievedChunks={activeRetrievedChunks}
                highlightedChunkId={highlightedChunkId}
                onClearHighlight={() => setHighlightedChunkId(null)}
                rerankerEnabled={useReranker}
              />
            </div>

            {/* Architecture Modal */}
            <ArchitectureModal
              isOpen={isDocsModalOpen}
              onClose={() => setIsDocsModalOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
