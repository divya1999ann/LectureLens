import { create } from 'zustand';

const useChatStore = create((set) => ({
  selectedLectures: [],
  currentChatId: null,
  messages: [],
  chatHistory: [
    {
      id: '1',
      subjectId: 1,
      firstMessage: 'Can you summarize lecture 1?',
      lectureCount: 2,
      messageCount: 8,
      timestamp: '2024-02-08T14:30:00',
      messages: [
        { id: 1, role: 'user', content: 'Can you summarize lecture 1?', timestamp: '2024-02-08T14:30:00' },
        {
          id: 2,
          role: 'assistant',
          content: 'Based on Lecture 1: Introduction to ML Systems, here\'s a comprehensive summary of the main concepts:\n\n1. **ML Systems Overview**: Machine Learning systems combine traditional software engineering with ML models to create production-ready applications.\n\n2. **Key Components**: Data pipelines, model training infrastructure, serving layer, and monitoring systems.\n\n3. **Challenges**: Scalability, data quality, model drift, and integration complexity.',
          timestamp: '2024-02-08T14:30:05',
          citations: [
            { id: 1, lecture: 'Lecture 1: Introduction', excerpt: 'ML systems combine traditional software engineering principles with machine learning models...', timestamp: '00:15:32' }
          ]
        }
      ]
    },
    {
      id: '2',
      subjectId: 1,
      firstMessage: 'Explain the data pipeline architecture',
      lectureCount: 1,
      messageCount: 5,
      timestamp: '2024-02-07T10:15:00',
      messages: []
    }
  ],

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
