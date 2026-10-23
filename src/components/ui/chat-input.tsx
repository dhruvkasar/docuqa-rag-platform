import * as React from "react";
import { cn } from "../../lib/utils";

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

export const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, maxHeight = 220, value, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    React.useEffect(() => {
      const textarea = internalRef.current;
      if (!textarea) return;

      textarea.style.height = "auto";
      const nextHeight = Math.min(Math.max(textarea.scrollHeight, 40), maxHeight);
      textarea.style.height = `${nextHeight}px`;
    }, [value, maxHeight]);

    return (
      <textarea
        ref={internalRef}
        value={value}
        onChange={onChange}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent px-3 py-2 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-sans leading-relaxed transition-[height] duration-75",
          className
        )}
        {...props}
      />
    );
  }
);
ChatInput.displayName = "ChatInput";
