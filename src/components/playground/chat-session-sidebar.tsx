// src/components/playground/chat-session-sidebar.tsx
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { listSessions, deleteSession, type ChatSession } from "@/lib/chat-sessions";

type Props = {
  modelSlug: string;
  activeSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  refreshKey: number;
};

export function ChatSessionSidebar({
  modelSlug,
  activeSessionId,
  onSelectSession,
  onNewSession,
  refreshKey,
}: Props) {
  const t = useT();
  const sessions = listSessions(modelSlug);

  return (
    <div className="w-64 shrink-0 border-r border-border/60 bg-surface-0/40 flex flex-col h-full">
      <div className="p-3 border-b border-border/60">
        <button
          onClick={onNewSession}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="size-3.5" />
          {t("playground.new_chat")}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            {t("playground.no_sessions")}
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition",
              session.id === activeSessionId
                ? "bg-amber/10 text-foreground"
                : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
            )}
            onClick={() => onSelectSession(session)}
          >
            <MessageSquare className="size-3.5 shrink-0" />
            <span className="flex-1 text-xs truncate">{session.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(modelSlug, session.id);
                if (session.id === activeSessionId) onNewSession();
              }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition cursor-pointer"
              aria-label="Delete session"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
