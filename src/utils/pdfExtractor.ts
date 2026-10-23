import * as pdfjsLib from 'pdfjs-dist';

// Configure worker to use official cdnjs worker fallback or internal worker
try {
  if (typeof window !== 'undefined') {
    // Setting workerSrc allows worker thread processing, falling back to main-thread fake worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch {
  // If worker cannot be set, pdfjs-dist gracefully uses internal fake-worker
}

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts plain text from a PDF file using client-side PDF.js.
 * Runs completely in the browser without network payloads or server limits.
 */
export async function extractTextFromPdfClient(file: File): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageSections: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      
      const strings: string[] = [];
      let lastY: number | null = null;
      
      for (const item of content.items) {
        if ('str' in item && typeof item.str === 'string') {
          // If Y position changed significantly, insert a newline
          if (item.transform && Array.isArray(item.transform)) {
            const currentY = item.transform[5];
            if (lastY !== null && Math.abs(currentY - lastY) > 6) {
              strings.push('\n');
            }
            lastY = currentY;
          }
          strings.push(item.str);
          if (item.hasEOL) {
            strings.push('\n');
          } else {
            strings.push(' ');
          }
        }
      }

      const pageText = strings.join('').replace(/[ \t]+/g, ' ').trim();
      if (pageText) {
        pageSections.push(`--- Page ${pageNum} ---\n${pageText}`);
      }
    } catch (pageErr) {
      console.warn(`Failed reading PDF page ${pageNum}:`, pageErr);
    }
  }

  const fullText = pageSections.join('\n\n').trim();
  
  if (!fullText) {
    throw new Error('PDF contains no readable digital text. (It may be a scanned image or photo).');
  }

  return {
    text: fullText,
    pageCount: numPages
  };
}
