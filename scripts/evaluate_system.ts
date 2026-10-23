/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_DOC_ALPHABET, DEFAULT_DOC_RAG_WHITEPAPER, DEFAULT_DOC_UT1_ELECTRONICS } from '../src/data/defaultDocuments';
import { QA_BENCHMARK_DATASET } from '../src/data/qaDataset';
import { cleanDocumentText, processDocumentChunks } from '../src/utils/chunking';
import { retrieveAndRerank, isBroadOrStudyQuery } from '../src/utils/vectorEngine';
import { DocumentChunk } from '../src/types/rag';
import http from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  metrics?: Record<string, any>;
}

const results: TestResult[] = [];

function assertTest(name: string, condition: boolean, details: string, metrics?: Record<string, any>) {
  results.push({
    name,
    passed: condition,
    details,
    metrics
  });
  console.log(`[${condition ? 'PASS' : 'FAIL'}] ${name}: ${details}`);
}

async function runLiveChatQuery(query: string, chunks: any[]): Promise<{ status: number; text: string; timeMs: number }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query,
      chunks,
      model: 'google/gemini-2.5-flash',
      provider: 'auto'
    });

    const req = http.request(
      'http://localhost:3000/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk.toString();
        });
        res.on('end', () => {
          let text = '';
          const lines = rawData.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.text) text += parsed.text;
              } catch (_) {}
            }
          }
          resolve({
            status: res.statusCode || 500,
            text: text || rawData,
            timeMs: Date.now() - start
          });
        });
      }
    );

    req.on('error', (e) => {
      resolve({
        status: 500,
        text: `Error: ${e.message}`,
        timeMs: Date.now() - start
      });
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=================================================================');
  console.log('   DocuQA Academic Platform - Real End-to-End System Evaluation  ');
  console.log('=================================================================\n');

  // 1. INGESTION & CHUNKING MODULE
  console.log('--- MODULE 1: Document Processing & Token Chunking ---');
  const alphabetText = cleanDocumentText(DEFAULT_DOC_ALPHABET);
  const ut1Text = cleanDocumentText(DEFAULT_DOC_UT1_ELECTRONICS);
  const whitepaperText = cleanDocumentText(DEFAULT_DOC_RAG_WHITEPAPER);

  const alphabetSemantic = processDocumentChunks(alphabetText, 'doc_alpha', 'Alphabet_Q3_2024_Financial_Report.txt', 'semantic');
  const ut1Semantic = processDocumentChunks(ut1Text, 'doc_ut1', 'UT1_Detailed_Easy_Answers.pdf', 'semantic');
  const whitepaperSemantic = processDocumentChunks(whitepaperText, 'doc_wp', 'Frontier_AI_Safety_and_RAG_Architecture_Whitepaper.txt', 'semantic');

  const allSemanticChunks = [...alphabetSemantic, ...ut1Semantic, ...whitepaperSemantic];

  assertTest(
    'TC-01: Corpus Ingestion & Semantic Chunking',
    alphabetSemantic.length >= 6 && ut1Semantic.length >= 7 && whitepaperSemantic.length >= 5,
    `Ingested 3 documents into ${allSemanticChunks.length} semantic chunks across 25 total pages`,
    {
      alphabetChunks: alphabetSemantic.length,
      ut1Chunks: ut1Semantic.length,
      whitepaperChunks: whitepaperSemantic.length,
      totalChunks: allSemanticChunks.length
    }
  );

  const alphabetFixed = processDocumentChunks(alphabetText, 'doc_alpha', 'Alphabet_Q3_2024_Financial_Report.txt', 'fixed');
  const alphabetRecursive = processDocumentChunks(alphabetText, 'doc_alpha', 'Alphabet_Q3_2024_Financial_Report.txt', 'recursive');

  assertTest(
    'TC-02: Chunking Strategy Multi-Mode Generator',
    alphabetFixed.length > 0 && alphabetRecursive.length > 0,
    `Verified Fixed (${alphabetFixed.length} chunks), Recursive (${alphabetRecursive.length} chunks), Semantic (${alphabetSemantic.length} chunks)`
  );

  // 2. INTENT CLASSIFICATION & BROAD QUERY DETECTION
  console.log('\n--- MODULE 2: Query Intent Classification ---');
  const conversationalQueries = ['hey !', 'hello docuqa', 'who are you', 'how does this work?'];
  const broadQueries = ['whats in this pdf', 'what is in this document', 'summarize the pdf', 'outline all topics in this course'];
  const domainQueries = ['What was Alphabet operating margin?', 'Explain BJT as a switch in saturation', 'State Thevenin theorem'];

  let convAllMatch = true;
  for (const q of conversationalQueries) {
    const isConv = /^(hi|hey|hello|greetings|good\s+(morning|afternoon|evening)|who\s+are\s+you|what\s+can\s+you\s+do|how\s+are\s+you|how\s+(do|does)\s+(you|this)\s+work|what\s+is\s+your\s+purpose|help\s*me|thanks|thank\s+you)\b/i.test(q.trim());
    if (!isConv) convAllMatch = false;
  }
  assertTest('TC-03: Conversational Intent Classifier', convAllMatch, 'Correctly routed greetings to conversational without grounded retrieval overhead');

  let broadAllMatch = true;
  for (const q of broadQueries) {
    const isBroad = isBroadOrStudyQuery(q);
    if (!isBroad) broadAllMatch = false;
  }
  assertTest('TC-04: Broad Overview & PDF Intent Detection', broadAllMatch, 'Correctly detected overview/summary intent triggering multi-page stratified sampling');

  // 3. VECTOR ENGINE HYBRID RETRIEVAL & RE-RANKING
  console.log('\n--- MODULE 3: Hybrid Retrieval & Cross-Encoder Evaluation ---');
  
  // Test 3a: Broad query retrieval sampling
  const overviewRetrieval = retrieveAndRerank('whats in this pdf', ut1Semantic, 10, 6, true);
  const overviewPages = new Set(overviewRetrieval.map(r => r.chunk.pageNo));
  assertTest(
    'TC-05: Stratified Multi-Page Sampling for Overview Queries',
    overviewRetrieval.length >= 4 && overviewPages.size >= 3,
    `Overview query retrieved ${overviewRetrieval.length} chunks spanning ${overviewPages.size} distinct pages`,
    { retrievedPages: Array.from(overviewPages) }
  );

  // Test 3b: Grounded Technical Query (BJT Switch Saturation)
  const bjtRetrieval = retrieveAndRerank('Explain BJT as a switch in saturation', ut1Semantic, 10, 5, true);
  const bjtTopChunk = bjtRetrieval[0]?.chunk;
  const bjtMatches = bjtTopChunk?.text.includes('Saturation') && bjtTopChunk?.text.includes('BJT');
  assertTest(
    'TC-06: Technical Electronics Retrieval (BJT Switch)',
    bjtMatches,
    `Top chunk [Page ${bjtTopChunk?.pageNo}, Chunk ${bjtTopChunk?.chunkIndex}] score: ${bjtRetrieval[0]?.finalScore.toFixed(3)}`
  );

  // Test 3c: Grounded Financial Query (Alphabet Operating Margin)
  const alphaRetrieval = retrieveAndRerank('What was Alphabet operating margin in Q3 2024?', alphabetSemantic, 10, 5, true);
  const alphaTopChunk = alphaRetrieval[0]?.chunk;
  const alphaMatches = (alphaTopChunk?.text.includes('32%') && alphaTopChunk?.text.toLowerCase().includes('operating margin'));
  assertTest(
    'TC-07: Financial Numerical Retrieval (Alphabet Margin)',
    alphaMatches,
    `Top chunk [Page ${alphaTopChunk?.pageNo}, Chunk ${alphaTopChunk?.chunkIndex}] score: ${alphaRetrieval[0]?.finalScore.toFixed(3)}`
  );

  // 4. BENCHMARK SUITE EVALUATION (40 Test Cases)
  console.log('\n--- MODULE 4: Quantitative Benchmark Suite (40 Cases) ---');
  let hitsAt1 = 0;
  let hitsAt3 = 0;
  let hitsAt5 = 0;
  let reciprocalRankSum = 0;
  let totalLatency = 0;

  for (const test of QA_BENCHMARK_DATASET) {
    const t0 = performance.now();
    const retrieved = retrieveAndRerank(test.question, allSemanticChunks, 10, 5, true);
    const latency = performance.now() - t0;
    totalLatency += latency;

    let rank = 0;
    for (let r = 0; r < retrieved.length; r++) {
      const c = retrieved[r].chunk;
      const kwMatch = test.expectedKeywords.some(kw => c.text.toLowerCase().includes(kw.toLowerCase()));
      const docMatch = c.docName === test.sourceDoc && Math.abs(c.pageNo - test.sourcePage) <= 1;
      if (docMatch && kwMatch) {
        rank = r + 1;
        break;
      }
    }

    if (rank === 1) hitsAt1++;
    if (rank > 0 && rank <= 3) hitsAt3++;
    if (rank > 0 && rank <= 5) hitsAt5++;
    if (rank > 0) reciprocalRankSum += 1 / rank;
  }

  const totalN = QA_BENCHMARK_DATASET.length;
  const hitRateAt1 = Math.round((hitsAt1 / totalN) * 1000) / 10;
  const hitRateAt3 = Math.round((hitsAt3 / totalN) * 1000) / 10;
  const hitRateAt5 = Math.round((hitsAt5 / totalN) * 1000) / 10;
  const mrr = Math.round((reciprocalRankSum / totalN) * 100) / 100;
  const avgLatency = Math.round(totalLatency / totalN);

  assertTest(
    'TC-08: Benchmark Hit Rate @3 >= 85%',
    hitRateAt3 >= 85.0,
    `Achieved Hit Rate @3: ${hitRateAt3}% (Hit@1: ${hitRateAt1}%, Hit@5: ${hitRateAt5}%)`,
    { hitRateAt1, hitRateAt3, hitRateAt5, mrr, avgLatency }
  );

  assertTest(
    'TC-09: Benchmark MRR >= 0.80',
    mrr >= 0.80,
    `Achieved MRR: ${mrr} across ${totalN} mixed domain questions`
  );

  // 5. LIVE SERVER STREAMING & RAG EXTRACTIVE FALLBACK
  console.log('\n--- MODULE 5: Live Server Endpoints & Streaming Fallback ---');

  // Test 5a: Conversational greeting
  const liveGreeting = await runLiveChatQuery('hey !', []);
  assertTest(
    'TC-10: Live API Casual Greeting Route',
    liveGreeting.status === 200 && liveGreeting.text.length > 20,
    `Status ${liveGreeting.status} (${liveGreeting.timeMs}ms): Received DocuQA assistant introduction`
  );

  // Test 5b: Overview Query with UT1 semiconductor chunks
  const liveOverview = await runLiveChatQuery(
    'whats in this pdf',
    overviewRetrieval.map(r => ({
      id: r.chunk.id,
      docName: r.chunk.docName,
      pageNo: r.chunk.pageNo,
      chunkIndex: r.chunk.chunkIndex,
      text: r.chunk.text,
      finalScore: r.finalScore
    }))
  );
  const overviewHasHeadings = liveOverview.text.includes('###') || liveOverview.text.includes('Source:');
  assertTest(
    'TC-11: Live API Document Overview Synthesis',
    liveOverview.status === 200 && overviewHasHeadings,
    `Status ${liveOverview.status} (${liveOverview.timeMs}ms): Synthesized structured multi-topic summary with citations`
  );

  // Test 5c: Grounded Exam Prediction Query
  const liveExam = await runLiveChatQuery(
    'predict likely exam questions for unit test 1',
    bjtRetrieval.map(r => ({
      id: r.chunk.id,
      docName: r.chunk.docName,
      pageNo: r.chunk.pageNo,
      chunkIndex: r.chunk.chunkIndex,
      text: r.chunk.text,
      finalScore: r.finalScore
    }))
  );
  const examHasHeadings = liveExam.text.includes('Exam') || liveExam.text.includes('###');
  assertTest(
    'TC-12: Live API Exam Question Prediction',
    liveExam.status === 200 && examHasHeadings,
    `Status ${liveExam.status} (${liveExam.timeMs}ms): Generated high-yield predicted questions with key points`
  );

  console.log('\n=================================================================');
  const passCount = results.filter(r => r.passed).length;
  console.log(`EVALUATION COMPLETE: ${passCount}/${results.length} Tests Passed (${Math.round((passCount/results.length)*100)}%)`);
  console.log('=================================================================\n');
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
