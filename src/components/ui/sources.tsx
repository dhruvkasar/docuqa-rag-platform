import * as React from "react";
import { FileText, ExternalLink, ChevronRight } from "lucide-react";
import { RetrievalResult } from "../../types/rag";
import { Badge } from "./badge";
import { cn } from "../../lib/utils";

export interface SourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  sources: RetrievalResult[];
  onSelectSource?: (chunkId: string) => void;
  onOpenAllSources?: () => void;
  maxVisible?: number;
}

export const Sources: React.FC<SourcesProps> = ({
  sources,
  onSelectSource,
  onOpenAllSources,
  maxVisible = 3,
  className,
  ...props
}) => {
  if (!sources || sources.length === 0) return null;

  const topSources = sources.slice(0, maxVisible);
  const remainingCount = sources.length - topSources.length;

  return (
    <div className={cn("space-y-2 pt-1", className)} {...props}>
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <FileText className="w-3 h-3 text-indigo-500" />
          <span>Grounded Sources ({sources.length})</span>
        </div>

        {onOpenAllSources && remainingCount > 0 && (
          <button
            type="button"
            onClick={onOpenAllSources}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <span>+{remainingCount} more in inspector</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Grid of Interactive Source Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {topSources.map((item, idx) => {
          const chunk = item.chunk;
          const chunkId = chunk.id;
          const percentage = Math.round(Math.min(Math.max(item.finalScore * 100, 40), 99));

          const scoreVariant: "emerald" | "indigo" | "secondary" =
            percentage >= 80 ? "emerald" : percentage >= 60 ? "indigo" : "secondary";

          return (
            <div
              key={chunk.id || idx}
              onClick={() => onSelectSource?.(chunkId)}
              className="group relative p-3 rounded-xl border border-border/80 bg-card hover:bg-accent/40 hover:border-border transition-all cursor-pointer shadow-2xs flex flex-col justify-between"
              title={`Click to inspect passage in ${chunk.docName}`}
            >
              <div>
                {/* Header: Name and Match Score */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span
                    className="font-semibold text-xs text-card-foreground truncate group-hover:text-primary transition-colors"
                    title={chunk.docName}
                  >
                    {chunk.docName.replace(/\.[^/.]+$/, '')}
                  </span>
                  <Badge variant={scoreVariant} className="text-[10px] font-mono shrink-0">
                    {percentage}% match
                  </Badge>
                </div>

                {/* Excerpt Snippet */}
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  "{chunk.text}"
                </p>
              </div>

              {/* Card Footer: Page and Chunk info */}
              <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Page {chunk.pageNo} · Chunk #{chunk.chunkIndex}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
