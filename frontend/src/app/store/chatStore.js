import { create } from 'zustand';

const useChatStore = create((set) => ({
  selectedLectures: [],
  currentChatId: null,
  messages: [],
  chatHistory: [],

  setSelectedLectures: (lectures) => set({ selectedLectures: lectures }),

  addMessage: (message, subjectId) => set((state) => {
    const newMessages = [...state.messages, message];

    // If active chat exists, update it
    if (state.currentChatId) {
      const updatedHistory = state.chatHistory.map(chat =>
        chat.id === state.currentChatId
          ? {
            ...chat,
            messages: newMessages,
            timestamp: message.timestamp,
            messageCount: newMessages.length,
            // Update preview text if it's the last message? Or keep first message as title?
            // Typically title is first message, but timestamp updates.
          }
          : chat
      );
      // Sort history to put newest first? 
      // simple map doesn't sort. For now just update.
      return { messages: newMessages, chatHistory: updatedHistory };
    }

    // Create new chat
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      subjectId: subjectId,
      firstMessage: message.content,
      lectureCount: state.selectedLectures.length,
      messageCount: 1,
      timestamp: message.timestamp,
      messages: newMessages
    };

    return {
      currentChatId: newChatId,
      messages: newMessages,
      chatHistory: [newChat, ...state.chatHistory]
    };
  }),

  clearMessages: () => set({ messages: [] }),

  setCurrentChat: (chatId) => {
    const state = useChatStore.getState();
    const chat = state.chatHistory.find(c => c.id === chatId);
    if (chat) {
      set({
        currentChatId: chatId,
        messages: chat.messages || [],
        selectedLectures: []
      });
    }
  },

  createNewChat: () => set({
    currentChatId: null,
    messages: [],
    selectedLectures: []
  }),

  deleteChat: (chatId) => set((state) => {
    const newHistory = state.chatHistory.filter(c => c.id !== chatId);
    const shouldClearCurrent = state.currentChatId === chatId;

    return {
      chatHistory: newHistory,
      ...(shouldClearCurrent && {
        currentChatId: null,
        messages: [],
        selectedLectures: []
      })
    };
  })
}));

export default useChatStore;
