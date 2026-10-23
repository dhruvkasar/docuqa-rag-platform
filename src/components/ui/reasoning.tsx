import * as React from "react";
import { useState } from "react";
import { 
  ChevronDown, 
  CheckCircle2, 
  Loader2,
  Cpu
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
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const stepCount = steps.length || 3;
  const durationStr = durationMs
    ? durationMs >= 1000
      ? `${(durationMs / 1000).toFixed(1)}s`
      : `${durationMs}ms`
    : null;

  return (
    <div
      className={cn(
        "text-xs transition-all",
        className
      )}
      {...props}
    >
      {/* Header Button matching shadcn / assistant-ui timeline reference */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-left text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none py-1 group"
      >
        <div className="flex h-4 w-4 items-center justify-center shrink-0">
          {isThinking ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
        <span className="font-medium text-xs text-foreground/90 group-hover:text-foreground">
          {isThinking ? "Researching in progress..." : `Researched in ${stepCount} steps`}
        </span>
        {durationStr && !isThinking && (
          <span className="text-[10px] font-mono text-muted-foreground">
            ({durationStr})
          </span>
        )}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Accordion Body with Vertical Timeline Line */}
      {isOpen && (
        <div className="relative pl-5 mt-2 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-2.5">
              {/* Dot / Checkmark node on the timeline */}
              <div className="absolute -left-5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          ))}

          {/* Detailed Verification Summary Card */}
          {reasoningText && (
            <div className="mt-2 p-3 rounded-xl bg-muted/50 border border-border/70 text-[11px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {reasoningText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
