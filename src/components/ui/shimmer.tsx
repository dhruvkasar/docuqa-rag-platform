import * as React from "react";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-muted via-accent/70 to-muted animate-shimmer",
        className
      )}
      {...props}
    />
  );
};

export const ShimmerText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-2.5 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={cn(
            "h-3.5",
            i === lines - 1 ? "w-3/5" : i === 0 ? "w-full" : "w-11/12"
          )}
        />
      ))}
    </div>
  );
};

export const ShimmerReasoning: React.FC<{ activeStep?: string; className?: string }> = ({
  activeStep = "Analyzing query intent & retrieving verified passages...",
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-3.5 space-y-3",
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse">
          {activeStep}
        </span>
      </div>
      <div className="space-y-1.5 pt-1">
        <Shimmer className="h-2.5 w-full" />
        <Shimmer className="h-2.5 w-4/5" />
      </div>
    </div>
  );
};
