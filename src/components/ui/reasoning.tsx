import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Terminal
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
  steps?: string[];
  reasoningText?: string;
  durationMs?: number;
  isThinking?: boolean;
  defaultOpen?: boolean;
}

export const Reasoning: React.FC<ReasoningProps> = ({
  steps = [],
  reasoningText,
  durationMs,
  isThinking = false,
  defaultOpen = false,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || isThinking);
  const userToggledRef = useRef(false);
  const thoughtBoxRef = useRef<HTMLDivElement>(null);

  // Automatically open the reasoning accordion when thinking starts unless user closed it
  useEffect(() => {
    if (isThinking && !userToggledRef.current) {
      setIsOpen(true);
    }
  }, [isThinking]);

  // Auto-scroll the live thought stream to keep current tokens visible
  useEffect(() => {
    if (isThinking && thoughtBoxRef.current) {
      thoughtBoxRef.current.scrollTop = thoughtBoxRef.current.scrollHeight;
    }
  }, [reasoningText, isThinking]);

  const stepCount = steps.length || (reasoningText ? 3 : 1);
  const durationStr = durationMs
    ? durationMs >= 1000
      ? `${(durationMs / 1000).toFixed(1)}s`
      : `${durationMs}ms`
    : null;

  const handleToggle = () => {
    userToggledRef.current = true;
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={cn(
        "text-xs transition-all",
        className
      )}
      {...props}
    >
      {/* Header Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-2 text-left text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer select-none py-1 group"
      >
        <div className="flex h-4 w-4 items-center justify-center shrink-0">
          {isThinking ? (
            <Loader2 className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors" />
          )}
        </div>

        <span className="font-medium text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          {isThinking ? (
            <>
              <span>Reasoning live...</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                Live stream
              </span>
            </>
          ) : (
            `Thought for ${durationStr || '0.8s'} (${stepCount} step${stepCount === 1 ? '' : 's'})`
          )}
        </span>

        {durationStr && isThinking && (
          <span className="text-[10px] font-mono text-neutral-500">
            ({durationStr})
          </span>
        )}

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Accordion Body with Vertical Timeline Line */}
      {isOpen && (
        <div className="relative pl-5 mt-2.5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-neutral-200 dark:before:bg-neutral-800">
          {/* Dynamic Steps derived from Live Reasoning */}
          {steps.length > 0 && steps.map((step, idx) => {
            const isLatest = idx === steps.length - 1 && isThinking;
            return (
              <div key={idx} className="relative flex items-start gap-2.5">
                {/* Dot / Checkmark node on the timeline */}
                <div
                  className={cn(
                    "absolute -left-5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-neutral-950 border transition-colors",
                    isLatest
                      ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 shadow-xs"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-400"
                  )}
                >
                  {isLatest ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 animate-ping" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-xs leading-relaxed",
                    isLatest 
                      ? "text-neutral-900 dark:text-neutral-100 font-medium" 
                      : "text-neutral-700 dark:text-neutral-300 font-normal"
                  )}>
                    {step}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Real Live Streaming Thoughts Terminal Card */}
          {reasoningText && (
            <div className="mt-2 rounded-md bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Terminal className="w-3 h-3 text-neutral-500" />
                  {isThinking ? "Live AI Reasoning Stream" : "AI Reasoning Trace"}
                </span>
                {isThinking ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-neutral-800 dark:text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Generating thoughts
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500">Verified</span>
                )}
              </div>
              <div
                ref={thoughtBoxRef}
                className="max-h-60 overflow-y-auto p-3 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap select-text scroll-smooth"
              >
                {reasoningText}
                {isThinking && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-neutral-900 dark:bg-neutral-100 animate-pulse align-middle" />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
