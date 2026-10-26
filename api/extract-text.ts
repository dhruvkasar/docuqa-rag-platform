import type { IncomingMessage, ServerResponse } from 'http';
import { PDFParse } from 'pdf-parse';

export default async function handler(req: any, res: any) {
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

  let body: any = {};
  if (req.body && typeof req.body === 'object') {
    body = req.body;
  } else {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = JSON.parse(Buffer.concat(buffers).toString() || '{}');
    } catch {
      body = {};
    }
  }

  const { fileBase64, fileName } = body;
  if (!fileBase64) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'fileBase64 is required' }));
    return;
  }

  let parser: PDFParse | null = null;
  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    const isPdf = fileName?.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      const numPages = textResult.total || textResult.pages.length || 1;

      let text = '';
      if (textResult.pages && textResult.pages.length > 0) {
        text = textResult.pages
          .map((p) => `--- Page ${p.num} ---\n${p.text.trim()}`)
          .join('\n\n');
      } else {
        text = `--- Page 1 ---\n${(textResult.text || '').trim()}`;
      }

      await parser.destroy();
      parser = null;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        text,
        pageCount: numPages
      }));
      return;
    }

    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unsupported format' }));
  } catch (err: any) {
    if (parser) {
      try { await parser.destroy(); } catch {}
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Failed to parse PDF' }));
  }
}
