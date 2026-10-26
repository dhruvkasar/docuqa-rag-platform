import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  method?: string;
  query?: Record<string, string | string[]>;
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const currentKey = process.env.GEMINI_API_KEY || '';
  const currentOpenRouterKey = process.env.OPENROUTER_API_KEY || '';

  const data = {
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node',
    hasApiKey: Boolean(currentKey && currentKey !== 'MY_GEMINI_API_KEY'),
    hasOpenRouterKey: Boolean(currentOpenRouterKey && currentOpenRouterKey !== 'MY_OPENROUTER_API_KEY'),
    models: {
      gemini: 'gemini-3.8-flash',
      openRouterDefault: 'google/gemini-2.5-flash',
      embeddings: 'text-embedding-004'
    }
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
