import { create } from 'zustand';
import { chatAPI } from '../services/api';

const useChatStore = create((set, get) => ({
  selectedLectures: [],
  currentSessionId: null,
  messages: [],
  chatHistory: [],       // list of ChatSession summaries
  historyLoading: false,

  setSelectedLectures: (lectures) => set({ selectedLectures: lectures }),

  // ── Load sessions from backend for a given subject ────────────────────────
  loadSessions: async (subjectId) => {
    set({ historyLoading: true });
    try {
      const { data } = await chatAPI.getSessions(subjectId);
      const sessions = data.results ?? data;
      set({ chatHistory: sessions });
    } catch {
      // silently fail — history just won't show
    } finally {
      set({ historyLoading: false });
    }
  },

  // ── Switch to an existing session and load its messages ───────────────────
  setCurrentSession: async (sessionId) => {
    try {
      const { data } = await chatAPI.getSession(sessionId);
      // Map backend message shape → component shape
      const messages = (data.messages || []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        citations: (m.citations || []).map((c, idx) => ({
          id: idx + 1,
          lecture: c.lecture_title || `Lecture ${c.lecture_id}`,
          excerpt: c.chunk_text,
          timestamp: null,
        })),
      }));
      set({ currentSessionId: sessionId, messages });
    } catch {
      // ignore
    }
  },

  // ── Start a fresh conversation ────────────────────────────────────────────
  createNewSession: () => set({
    currentSessionId: null,
    messages: [],
    selectedLectures: [],
  }),

  // ── Add a message locally (optimistic) and track session id ──────────────
  addMessage: (message, sessionId) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      // If backend returned a new session id, update currentSessionId
      const resolvedSessionId = sessionId || state.currentSessionId;
      return { messages: newMessages, currentSessionId: resolvedSessionId };
    });
  },

  // ── Refresh history after a message is sent ───────────────────────────────
  refreshHistory: async (subjectId) => {
    try {
      const { data } = await chatAPI.getSessions(subjectId);
      set({ chatHistory: data.results ?? data });
    } catch {
      // ignore
    }
  },

  // ── Delete a session ──────────────────────────────────────────────────────
  deleteSession: async (sessionId) => {
    try {
      await chatAPI.deleteSession(sessionId);
      set((state) => {
        const newHistory = state.chatHistory.filter((c) => c.id !== sessionId);
        const isCurrent = state.currentSessionId === sessionId;
        return {
          chatHistory: newHistory,
          ...(isCurrent && { currentSessionId: null, messages: [], selectedLectures: [] }),
        };
      });
    } catch {
      // ignore
    }
  },
}));

export default useChatStore;
