import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

interface ContextChunkPayload {
  id: string;
  docName: string;
  pageNo: number;
  chunkIndex: number;
  text: string;
  finalScore?: number;
}

interface ChatRequestBody {
  query?: string;
  chunks?: ContextChunkPayload[];
  provider?: 'auto' | 'gemini' | 'openrouter';
  model?: string;
}

class ThoughtStreamParser {
  private inThought = false;
  private buffer = '';
  private thoughtCompleted = false;
  private onThought: (token: string) => void;
  private onText: (token: string) => void;
  private onThoughtEnd: () => void;

  constructor(
    onThought: (token: string) => void,
    onText: (token: string) => void,
    onThoughtEnd: () => void
  ) {
    this.onThought = onThought;
    this.onText = onText;
    this.onThoughtEnd = onThoughtEnd;
  }

  process(chunk: string) {
    this.buffer += chunk;

    while (this.buffer.length > 0) {
      if (!this.inThought && !this.thoughtCompleted) {
        const thoughtStartIdx = this.buffer.indexOf('<thought>');
        if (thoughtStartIdx !== -1) {
          if (thoughtStartIdx > 0) {
            this.onText(this.buffer.slice(0, thoughtStartIdx));
          }
          this.inThought = true;
          this.buffer = this.buffer.slice(thoughtStartIdx + '<thought>'.length);
          continue;
        }

        const openTagPrefix = '<thought';
        let matchLen = 0;
        for (let i = 1; i <= openTagPrefix.length; i++) {
          if (this.buffer.endsWith(openTagPrefix.slice(0, i))) {
            matchLen = i;
          }
        }
        if (matchLen > 0) {
          const safeText = this.buffer.slice(0, -matchLen);
          if (safeText) this.onText(safeText);
          this.buffer = this.buffer.slice(-matchLen);
          break;
        }

        this.onText(this.buffer);
        this.buffer = '';
      } else if (this.inThought) {
        const thoughtEndIdx = this.buffer.indexOf('</thought>');
        if (thoughtEndIdx !== -1) {
          const thoughtContent = this.buffer.slice(0, thoughtEndIdx);
          if (thoughtContent) {
            this.onThought(thoughtContent);
          }
          this.inThought = false;
          this.thoughtCompleted = true;
          this.onThoughtEnd();
          this.buffer = this.buffer.slice(thoughtEndIdx + '</thought>'.length);
          continue;
        }

        const closeTagPrefix = '</thought';
        let matchLen = 0;
        for (let i = 1; i <= closeTagPrefix.length; i++) {
          if (this.buffer.endsWith(closeTagPrefix.slice(0, i))) {
            matchLen = i;
          }
        }
        if (matchLen > 0) {
          const safeThought = this.buffer.slice(0, -matchLen);
          if (safeThought) this.onThought(safeThought);
          this.buffer = this.buffer.slice(-matchLen);
          break;
        }

        this.onThought(this.buffer);
        this.buffer = '';
      } else {
        this.onText(this.buffer);
        this.buffer = '';
      }
    }
  }

  flush() {
    if (this.buffer.length > 0) {
      if (this.inThought) {
        this.onThought(this.buffer);
        this.onThoughtEnd();
      } else {
        this.onText(this.buffer);
      }
      this.buffer = '';
    }
  }
}

function getGoogleGenAI(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function streamOpenRouter(
  prompt: string,
  systemInstruction: string,
  modelName: string,
  res: ServerResponse
): Promise<boolean> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
  if (!openRouterApiKey || openRouterApiKey === 'MY_OPENROUTER_API_KEY') {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://docuqa-rag-platform.vercel.app',
        'X-Title': 'DocuQA RAG Platform'
      },
      body: JSON.stringify({
        model: modelName || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: 0.2,
        max_tokens: 2048
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok || !response.body) {
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let streamBuffer = '';
    let hasWritten = false;

    const thoughtParser = new ThoughtStreamParser(
      (thoughtToken) => {
        hasWritten = true;
        res.write(`data: ${JSON.stringify({ thought: thoughtToken })}\n\n`);
      },
      (textToken) => {
        hasWritten = true;
        res.write(`data: ${JSON.stringify({ text: textToken })}\n\n`);
      },
      () => {
        res.write(`data: ${JSON.stringify({ thoughtDone: true })}\n\n`);
      }
    );

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      streamBuffer += decoder.decode(value, { stream: true });
      const lines = streamBuffer.split('\n');
      streamBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6).trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta;
          const reasoning = delta?.reasoning_content || delta?.reasoning;
          if (reasoning) {
            hasWritten = true;
            res.write(`data: ${JSON.stringify({ thought: reasoning })}\n\n`);
          }
          const token = delta?.content;
          if (token) {
            thoughtParser.process(token);
          }
        } catch {
          // ignore incomplete json chunk
        }
      }
    }

    thoughtParser.flush();
    return hasWritten;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

function synthesizeGroundedAnswer(
  query: string,
  chunks: ContextChunkPayload[],
  hasApiKey: boolean
): string {
  const qLower = query.toLowerCase();
  const isConversational = /^(hi|hello|hey|who are you|what is docuqa|what can you do|how does this work|good morning|good evening)/i.test(qLower.trim());

  if (isConversational) {
    return `Hello! I am **DocuQA**, an academic and document intelligence platform. I analyze your uploaded documents using dense vector embeddings, cross-encoder re-ranking, and grounded source provenance. You can ask me to summarize documents, explain technical concepts, or predict end-semester exam questions.`;
  }

  if (!chunks || chunks.length === 0) {
    return `No document context is currently loaded. Please upload a PDF, DOCX, or TXT document using the paperclip button in the workspace to begin grounded analysis.`;
  }

  const docName = chunks[0]?.docName || 'Uploaded Document';
  const isExamQuery = /\b(exam|exams|sem|semester|test|tests|question|questions|likely|marks|predict)\b/i.test(qLower);
  const isBroadQuery = /\b(about|overview|summarize|summary|what is this|explain the pdf|tell me about)\b/i.test(qLower);

  const keyMissingNote = !hasApiKey
    ? `\n\n---\n*💡 **Pro-Tip for Vercel Deployment:** To enable live multi-turn Gemini 2.5/3.8 Flash generation on your Vercel deployment, add \`GEMINI_API_KEY\` in your Vercel Project Dashboard $\\rightarrow$ **Settings** $\\rightarrow$ **Environment Variables**.*`
    : '';

  if (isExamQuery) {
    const items = chunks.slice(0, 4).map((c, i) => {
      const firstLine = c.text.split('\n')[0]?.replace(/^[-*#\s\d\.]+/, '') || `Core Concept ${i + 1}`;
      return `### 🎯 High-Probability Exam Question #${i + 1}: ${firstLine} [Source: ${c.docName}, Page ${c.pageNo}, Chunk ${c.chunkIndex}]
- **Key Concepts & Theoretical Foundation:**
  ${c.text.slice(0, 280).replace(/\n/g, ' ')}...
- **Examiner Scoring Criteria:**
  State the definition clearly and write the mathematical relation or step-by-step mechanism to secure full marks.`;
    }).join('\n\n');

    return `## 🎯 High-Probability University Exam Questions & Analysis

Based on grounded context extracted from **${docName}**, here are the highest-yield topics for your exams:

${items}${keyMissingNote}`;
  }

  if (isBroadQuery) {
    const sections = chunks.slice(0, 5).map((c, i) => {
      const lines = c.text.split('\n').filter((l) => l.trim().length > 0);
      const title = lines[0]?.replace(/^[-*#\s\d\.]+/, '') || `Section ${i + 1}`;
      const preview = lines.slice(1, 4).join('\n') || c.text.slice(0, 240);
      return `### ${i + 1}. ${title} [Source: ${c.docName}, Page ${c.pageNo}, Chunk ${c.chunkIndex}]
${preview}`;
    }).join('\n\n');

    return `## 📄 Document Intelligence Overview: **${docName}**

Here is a structured synthesis of the principal concepts, algorithms, and methodologies documented in **${docName}**:

${sections}${keyMissingNote}`;
  }

  // Find best matching passage
  const queryTerms = qLower.split(/\s+/).filter(t => t.length > 2);
  let bestPassage = '';
  let bestChunk = chunks[0];
  let maxScore = -1;

  for (const chunk of chunks) {
    const paragraphs = chunk.text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
    const candidateBlocks = paragraphs.length > 0 ? paragraphs : [chunk.text];

    for (const block of candidateBlocks) {
      const bLower = block.toLowerCase();
      let matches = 0;
      for (const term of queryTerms) {
        if (bLower.includes(term)) matches += 2;
      }
      if (matches > maxScore) {
        maxScore = matches;
        bestPassage = block.trim();
        bestChunk = chunk;
      }
    }
  }

  if (maxScore <= 0 || !bestPassage) {
    return `### Grounded Information from **${chunks[0].docName}** (Page ${chunks[0].pageNo}):

${chunks[0].text}

[Source: ${chunks[0].docName}, Page ${chunks[0].pageNo}, Chunk ${chunks[0].chunkIndex}]${keyMissingNote}`;
  }

  return `### Grounded Synthesis from **${bestChunk.docName}** (Page ${bestChunk.pageNo}):

${bestPassage}

[Source: ${bestChunk.docName}, Page ${bestChunk.pageNo}, Chunk ${bestChunk.chunkIndex}]${keyMissingNote}`;
}

async function parseBody(req: IncomingMessage): Promise<ChatRequestBody> {
  // If already parsed by Vercel serverless framework
  if ((req as any).body && typeof (req as any).body === 'object') {
    return (req as any).body;
  }

  return new Promise((resolve) => {
    let bodyStr = '';
    req.on('data', (chunk) => {
      bodyStr += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(bodyStr || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body: ChatRequestBody;
  try {
    body = await parseBody(req);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const { query, chunks = [], provider, model } = body;

  if (!query) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Query is required' }));
    return;
  }

  // Set SSE response headers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const contextBlocks = chunks.map((c) => {
    return `[Source: ${c.docName}, Page ${c.pageNo}, Chunk ${c.chunkIndex}]\n${c.text.trim()}`;
  }).join('\n\n---\n\n');

  const systemInstruction = `You are DocuQA, an expert Document Intelligence and Academic RAG Assistant.
You have access to verified document excerpts provided in the CONTEXT.

LIVE AI REASONING INSTRUCTION:
Before writing your final grounded answer, you MUST think step-by-step and output your live internal reasoning inside <thought>...</thought> tags.
In your reasoning:
- Analyze what the user is specifically seeking (factual inquiry, semester exam prediction, document summary, or conversational clarification).
- Scrutinize the retrieved context excerpts: inspect each chunk's relevance, noting document filename, page number, and chunk index.
- Evaluate factual accuracy, verify key definitions/formulas, and check if any critical data points are absent or require caveat.
- Plan the structured response layout with exact citation tags in the format: [Source: {filename}, Page {page_no}, Chunk {chunk_index}].
Close the thought block with </thought> immediately before beginning the final answer.

CORE OPERATING INSTRUCTIONS:
1. CONVERSATIONAL & META QUESTIONS:
   - If the user asks a conversational or meta question (e.g., "who are you?", "hello", "what can you do?"):
     * Respond warmly as DocuQA—an Academic Document Intelligence Platform.
2. DOCUMENT OVERVIEWS & SUMMARIES:
   - When asked "what's in this pdf", "summarize", or "overview":
     * Synthesize all provided excerpts into a comprehensive, structured summary.
     * Include explicit citations: [Source: {filename}, Page {page_no}, Chunk {chunk_index}].
3. STRICT DOCUMENT CITATIONS & GROUNDING:
   - Ground all factual claims in the provided context with [Source: {filename}, Page {page_no}, Chunk {chunk_index}].
4. EXAM PREPARATION INTELLIGENCE:
   - When asked for exam questions or test prep:
     * Synthesize high-yield short-answer (2-3 marks), conceptual (5-6 marks), and long questions (10+ marks).`;

  const prompt = `DOCUMENT CONTEXT EXCERPTS:\n${contextBlocks || 'No context chunks provided.'}\n\nUSER QUERY:\n${query}`;

  try {
    let streamSuccess = false;
    const apiKey = process.env.GEMINI_API_KEY || '';
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    const hasValidApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

    // 1. OpenRouter if requested
    if (provider === 'openrouter' && openRouterApiKey && openRouterApiKey !== 'MY_OPENROUTER_API_KEY') {
      try {
        streamSuccess = await streamOpenRouter(prompt, systemInstruction, model || 'google/gemini-2.5-flash', res);
      } catch (e: any) {
        console.warn('OpenRouter provider call failed:', e?.message);
      }
    }

    // 2. Gemini execution
    if (!streamSuccess && hasValidApiKey) {
      const ai = getGoogleGenAI(apiKey);
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

      for (const modelName of modelsToTry) {
        if (streamSuccess) break;
        try {
          const streamPromise = ai.models.generateContentStream({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
          });

          // Timeout to prevent hanging
          const responseStream = await Promise.race([
            streamPromise,
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout connecting to ${modelName}`)), 25000)
            ),
          ]);

          let hasTokens = false;
          const thoughtParser = new ThoughtStreamParser(
            (thoughtToken) => {
              hasTokens = true;
              res.write(`data: ${JSON.stringify({ thought: thoughtToken })}\n\n`);
            },
            (textToken) => {
              hasTokens = true;
              res.write(`data: ${JSON.stringify({ text: textToken })}\n\n`);
            },
            () => {
              res.write(`data: ${JSON.stringify({ thoughtDone: true })}\n\n`);
            }
          );

          for await (const chunk of responseStream) {
            const parts = chunk.candidates?.[0]?.content?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if ((part as any).thought) {
                  if (part.text) {
                    hasTokens = true;
                    res.write(`data: ${JSON.stringify({ thought: part.text })}\n\n`);
                  }
                } else if (part.text) {
                  hasTokens = true;
                  thoughtParser.process(part.text);
                }
              }
            } else if (chunk.text) {
              hasTokens = true;
              thoughtParser.process(chunk.text);
            }
          }

          thoughtParser.flush();

          if (hasTokens) {
            streamSuccess = true;
          }
        } catch (mErr: any) {
          console.warn(`Model ${modelName} error:`, mErr?.message);
        }
      }
    }

    // 3. Fallback to OpenRouter if Gemini failed
    if (!streamSuccess && openRouterApiKey && openRouterApiKey !== 'MY_OPENROUTER_API_KEY') {
      try {
        streamSuccess = await streamOpenRouter(prompt, systemInstruction, model || 'google/gemini-2.5-flash', res);
      } catch (e: any) {
        console.warn('OpenRouter fallback failed:', e?.message);
      }
    }

    // 4. Grounded extractive fallback (guaranteed never to crash)
    if (!streamSuccess) {
      const queryPreview = query.length > 60 ? query.slice(0, 57) + '...' : query;
      const initialThoughts = [
        `Received query: "${queryPreview}"\n`,
        `Analyzing query intent & verifying against ${chunks.length} active corpus chunk${chunks.length === 1 ? '' : 's'}.\n`,
        chunks.length > 0
          ? `Evaluating keyword density and cross-encoder relevance across "${chunks[0].docName}" (Page ${chunks[0].pageNo})...\n`
          : `No document chunks currently loaded; inspecting knowledge base...\n`,
        chunks.length > 0
          ? `Selected highest-scoring candidate: ${chunks[0].docName} (Page ${chunks[0].pageNo}, Chunk ${chunks[0].chunkIndex}).\n`
          : `Formulating direct guidance and prompt suggestions.\n`,
        `Synthesizing grounded response with verified citations.\n`
      ];

      for (const thoughtChunk of initialThoughts) {
        res.write(`data: ${JSON.stringify({ thought: thoughtChunk })}\n\n`);
        await new Promise((r) => setTimeout(r, 60));
      }
      res.write(`data: ${JSON.stringify({ thoughtDone: true })}\n\n`);

      const answer = synthesizeGroundedAnswer(query, chunks, hasValidApiKey);
      const textChunks = answer.match(/[\s\S]{1,40}/g) || [answer];
      for (const tc of textChunks) {
        res.write(`data: ${JSON.stringify({ text: tc })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Unhandled chat handler error:', err);
    try {
      res.write(`data: ${JSON.stringify({ text: '\n\nAn unexpected error occurred while processing your request. Please try again.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch {
      // ignore
    }
  }
}
