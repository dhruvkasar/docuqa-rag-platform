import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

// ChatBubble
interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  layout?: "default" | "ai";
  children: React.ReactNode;
}

export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", layout = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 max-w-[92%] md:max-w-[85%] group relative",
          variant === "sent" ? "ml-auto flex-row-reverse w-fit" : "mr-auto flex-row w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleAvatar
interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
}) => {
  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback className="text-[11px] font-medium">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
};

// ChatBubbleMessage
const chatBubbleMessageVariants = cva(
  "relative rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed transition-all shadow-2xs",
  {
    variants: {
      variant: {
        sent: "bg-primary text-primary-foreground font-normal rounded-tr-xs shadow-xs w-fit max-w-full inline-block break-words",
        received:
          "bg-card text-card-foreground border border-border/80 rounded-tl-xs w-full shadow-2xs",
      },
    },
    defaultVariants: {
      variant: "received",
    },
  }
);

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
}

export const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, variant, isLoading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(chatBubbleMessageVariants({ variant }), className)}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-1.5 py-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      ) : (
        children
      )}
    </div>
  );
});
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string;
}

export const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "text-[10px] font-mono text-muted-foreground mt-1 select-none",
        className
      )}
      {...props}
    >
      {timestamp}
    </div>
  );
};

// ChatBubbleAction
export const ChatBubbleAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 p-1 text-[11px] text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
ChatBubbleAction.displayName = "ChatBubbleAction";

// ChatBubbleActionWrapper
export const ChatBubbleActionWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 pt-2.5 mt-2.5 border-t border-border/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
