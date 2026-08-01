// src/lib/chat-sessions.ts

const MAX_SESSIONS_PER_MODEL = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_MESSAGE_LENGTH = 10000;
const STORAGE_PREFIX = "cortexia:chat:";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  cost?: number;
  model?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  modelSlug: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

function storageKey(modelSlug: string): string {
  return `${STORAGE_PREFIX}${modelSlug}`;
}

function readSessions(modelSlug: string): ChatSession[] {
  try {
    const raw = localStorage.getItem(storageKey(modelSlug));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(modelSlug: string, sessions: ChatSession[]): void {
  localStorage.setItem(storageKey(modelSlug), JSON.stringify(sessions));
}

export function listSessions(modelSlug: string): ChatSession[] {
  return readSessions(modelSlug).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSession(modelSlug: string, sessionId: string): ChatSession | undefined {
  return readSessions(modelSlug).find((s) => s.id === sessionId);
}

export function createSession(modelSlug: string, firstMessage?: string): ChatSession {
  const sessions = readSessions(modelSlug);
  if (sessions.length >= MAX_SESSIONS_PER_MODEL) {
    sessions.sort((a, b) => a.updatedAt - b.updatedAt);
    sessions.shift();
  }

  const session: ChatSession = {
    id: `sess_${crypto.randomUUID()}`,
    title: firstMessage?.slice(0, 60) || "New chat",
    modelSlug,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  sessions.push(session);
  writeSessions(modelSlug, sessions);
  return session;
}

export function appendMessage(
  modelSlug: string,
  sessionId: string,
  message: Omit<ChatMessage, "id" | "timestamp">,
): ChatSession | null {
  const sessions = readSessions(modelSlug);
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
    session.messages.shift();
  }

  const fullMessage: ChatMessage = {
    ...message,
    id: `msg_${crypto.randomUUID()}`,
    content: message.content.slice(0, MAX_MESSAGE_LENGTH),
    timestamp: Date.now(),
  };

  session.messages.push(fullMessage);
  session.updatedAt = Date.now();

  if (session.messages.length === 1 && message.role === "user") {
    session.title = message.content.slice(0, 60);
  }

  writeSessions(modelSlug, sessions);
  return session;
}

export function deleteSession(modelSlug: string, sessionId: string): void {
  const sessions = readSessions(modelSlug).filter((s) => s.id !== sessionId);
  writeSessions(modelSlug, sessions);
}

export function clearSessions(modelSlug: string): void {
  localStorage.removeItem(storageKey(modelSlug));
}
