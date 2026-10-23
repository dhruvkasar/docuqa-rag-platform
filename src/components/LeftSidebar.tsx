/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  X, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { DocumentFile, ChunkingStrategy } from '../types/rag';
import { parseAndProcessDocumentFile } from '../utils/chunking';

interface LeftSidebarProps {
  documents: DocumentFile[];
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  onAddDocument: (doc: DocumentFile) => void;
  onDeleteDocument: (id: string) => void;
  activeStrategy: ChunkingStrategy;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'chat' | 'evaluation' | 'experiments') => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  documents,
  activeDocId,
  setActiveDocId,
  onAddDocument,
  onDeleteDocument,
  activeStrategy,
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<DocumentFile | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const newDoc = await parseAndProcessDocumentFile(file, activeStrategy);
      onAddDocument(newDoc);
      setActiveDocId(newDoc.id);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to process document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Mobile-only backdrop (no dimming of chat on desktop) */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Document Library
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Action */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
          />
          <button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500 rounded-xl text-center transition-colors bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
          >
            <Upload className="w-3.5 h-3.5 mx-auto text-neutral-400 mb-1" />
            <span className="block text-xs font-medium">
              {isUploading ? 'Extracting text...' : 'Upload PDF, DOCX, or TXT'}
            </span>
          </button>

          {uploadError && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white dark:bg-neutral-900">
          {documents.map((doc) => {
            const isSelected = activeDocId === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDocId(isSelected ? null : doc.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-neutral-100 dark:bg-neutral-700 border-neutral-400 dark:border-neutral-500 text-neutral-900 dark:text-white'
                    : 'bg-neutral-50/70 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-900 dark:text-neutral-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-50 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                      <span>{doc.chunks.length} chunks</span>
                      <span>·</span>
                      <span>{doc.pageCount} pages</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setInspectingDoc(doc)}
                      title="Inspect chunks"
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {documents.length > 1 && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Delete"
                        className="p-1 text-neutral-400 hover:text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Module Actions for Document */}
                {isSelected && onNavigateTab && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-600 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setActiveDocId(doc.id);
                        onNavigateTab('chat');
                        onClose();
                      }}
                      className="flex-1 py-1 px-1.5 bg-neutral-200/80 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 rounded text-[10px] font-medium text-center text-neutral-800 dark:text-neutral-100 transition-colors"
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => {
                        setActiveDocId(doc.id);
                        onNavigateTab('evaluation');
                        onClose();
                      }}
                      className="flex-1 py-1 px-1.5 bg-neutral-200/80 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 rounded text-[10px] font-medium text-center text-neutral-800 dark:text-neutral-100 transition-colors"
                    >
                      📊 Evaluate
                    </button>
                    <button
                      onClick={() => {
                        setActiveDocId(doc.id);
                        onNavigateTab('experiments');
                        onClose();
                      }}
                      className="flex-1 py-1 px-1.5 bg-neutral-200/80 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 rounded text-[10px] font-medium text-center text-neutral-800 dark:text-neutral-100 transition-colors"
                    >
                      🧪 Lab
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chunk Inspector Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  {inspectingDoc.name}
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                  {inspectingDoc.chunks.length} chunks · Strategy: {inspectingDoc.activeStrategy}
                </p>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {inspectingDoc.chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Chunk #{chunk.chunkIndex} · Page {chunk.pageNo}
                    </span>
                    <span>{chunk.tokenCount} tokens</span>
                  </div>
                  <p className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
