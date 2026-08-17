import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat-sessions";

type Props = {
  messages: ChatMessage[];
};

export function ChatThread({ messages }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-amber/15 text-foreground"
                : "bg-surface-2/60 text-foreground/90",
            )}
          >
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
            {msg.cost != null && msg.cost > 0 && (
              <div className="mt-1.5 text-[10px] font-mono text-muted-foreground">
                ${msg.cost.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
