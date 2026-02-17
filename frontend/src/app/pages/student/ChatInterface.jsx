import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import {
  Search, Plus, Send, Copy, RefreshCw, BookOpen, X,
  MessageSquare, Edit2, Trash2, FileText, Check, ChevronRight, Filter
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import useChatStore from '../../store/chatStore';
import { mockSubjects, mockLectures, mockAIResponses } from '../../utils/mockData';

const ChatInterface = () => {
  const { id } = useParams();
  const subject = mockSubjects.find(s => s.id === parseInt(id));
  const subjectLectures = mockLectures.filter(l => l.subjectId === parseInt(id));

  const {
    selectedLectures,
    setSelectedLectures,
    messages,
    addMessage,
    chatHistory,
    currentChatId,
    setCurrentChat,
    createNewChat,
    deleteChat
  } = useChatStore();

  const [searchLecture, setSearchLecture] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredLectures = subjectLectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchLecture.toLowerCase()) ||
    lecture.number.toString().includes(searchLecture)
  );

  const handleLectureToggle = (lectureId) => {
    const newSelection = selectedLectures.includes(lectureId)
      ? selectedLectures.filter(lid => lid !== lectureId)
      : [...selectedLectures, lectureId];
    setSelectedLectures(newSelection);
  };

  const handleSelectAll = () => {
    setSelectedLectures(subjectLectures.map(l => l.id));
  };

  const handleClear = () => {
    setSelectedLectures([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || selectedLectures.length === 0) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage, parseInt(id));
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)]
          .replace('{lecture}', `Lecture ${selectedLectures[0]}`)
          .replace('{count}', selectedLectures.length),
        timestamp: new Date().toISOString(),
        citations: selectedLectures.slice(0, 2).map((lectureId, idx) => {
          const lecture = mockLectures.find(l => l.id === lectureId);
          return {
            id: idx + 1,
            lecture: `Lecture ${lecture.number}: ${lecture.title}`,
            excerpt: 'ML systems combine traditional software engineering principles with machine learning models...',
            timestamp: '00:15:32'
          };
        })
      };
      addMessage(aiResponse, parseInt(id));
      setIsLoading(false);
    }, 2000);
  };

  const suggestedPrompts = [
    'Summarize today\'s lecture',
    'Explain the main concepts',
    'Create a quiz from selected lectures',
    'Compare lectures 1 and 2'
  ];

  const handleDeleteChat = (chatId) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      Today: [],
      Yesterday: [],
      'Last 7 Days': [],
      Older: []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups.Today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.Yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups['Last 7 Days'].push(chat);
      } else {
        groups.Older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(chatHistory.filter(c => c.subjectId === parseInt(id)));

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">

      {/* ───────── Left Panel: Chat History ───────── */}
      <div className="w-72 shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Chat History</h3>
            <Button size="sm" onClick={createNewChat} className="h-7 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search chats..." className="pl-9 h-9 text-sm" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="p-3">
            {Object.entries(groupedChats).map(([group, chats]) => (
              chats.length > 0 && (
                <div key={group} className="mb-4">
                  <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-wider">{group}</h4>
                  <div className="space-y-1">
                    {chats.map(chat => (
                      <div
                        key={chat.id}
                        onClick={() => setCurrentChat(chat.id)}
                        className={`group p-2.5 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                          }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white truncate mb-0.5">
                          {chat.firstMessage}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                          <span>{chat.lectureCount} lectures</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="hover:text-blue-500 transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat.id);
                              }}
                              className="hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ───────── Main Panel: Chat Area ───────── */}
      <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {subject?.name}
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 font-normal text-sm">AI Assistant</span>
            </h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLectureDialogOpen(true)}
            className={`h-8 gap-2 ${selectedLectures.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
          >
            <FileText className="w-3.5 h-3.5" />
            {selectedLectures.length === 0 ? "Select Context" : `${selectedLectures.length} Selected`}
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent" id="chat-viewport">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6 ring-8 ring-blue-50/50 dark:ring-blue-900/20">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
                Select lectures to give the AI context, then simply ask your questions.
              </p>

              {selectedLectures.length === 0 ? (
                <Button
                  onClick={() => setLectureDialogOpen(true)}
                  size="lg"
                  className="mb-8 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all px-8 h-12"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Select Context
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestedPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => setInputMessage(prompt)}
                      className="rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="mr-4 w-8 h-8 shrink-0 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[85%]`}>
                    <div
                      className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-600 rounded-bl-none'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-4 mt-2 px-1">
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1 transition-colors">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1 transition-colors">
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                      </div>
                    )}

                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {message.citations.map(citation => (
                          <div
                            key={citation.id}
                            className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 hover:bg-blue-100/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-blue-600 dark:text-blue-400 mt-0.5">
                                <BookOpen className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                  {citation.lecture}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 italic">
                                  "{citation.excerpt}"
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Avatar className="mr-4 w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-5 py-4 border border-gray-100 dark:border-gray-600 shadow-sm">
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto relative">
            <div className="flex gap-3 items-end">
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 shrink-0 ${selectedLectures.length > 0 ? 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400'}`}
                title="Manage Context"
                onClick={() => setLectureDialogOpen(true)}
              >
                <FileText className="w-5 h-5" />
              </Button>

              <div className="flex-1 relative">
                <Textarea
                  placeholder={selectedLectures.length === 0 ? "Select lectures first..." : "Ask a question about the lectures..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={selectedLectures.length === 0}
                  className="min-h-[44px] max-h-[120px] resize-none pr-12 text-sm bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || selectedLectures.length === 0 || isLoading}
                  size="icon"
                  className={`absolute right-1 bottom-1 h-9 w-9 shrink-0 rounded-lg transition-all ${inputMessage.trim() && selectedLectures.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                    : 'bg-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Improved Lecture Selection Dialog */}
      <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-0 shadow-2xl">
          <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Select Context
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">
              Choose which lectures the AI should use to answer your questions.
            </p>
          </DialogHeader>

          <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 flex-1 overflow-hidden flex flex-col gap-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title or number..."
                  value={searchLecture}
                  onChange={(e) => setSearchLecture(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
                />
              </div>
              <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <Button variant="ghost" size="sm" onClick={handleSelectAll} className="px-3 h-8 text-xs font-medium hover:bg-blue-50 hover:text-blue-600">
                  All
                </Button>
                <div className="w-px bg-gray-200 dark:bg-gray-700 my-1 mx-1"></div>
                <Button variant="ghost" size="sm" onClick={handleClear} className="px-3 h-8 text-xs font-medium hover:bg-red-50 hover:text-red-600">
                  None
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto -mx-2 px-2 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {filteredLectures.map(lecture => {
                  const isSelected = selectedLectures.includes(lecture.id);
                  return (
                    <div
                      key={lecture.id}
                      onClick={() => handleLectureToggle(lecture.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col gap-2 ${isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm'
                        : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-md'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className={`bg-white dark:bg-gray-900 ${isSelected ? 'border-blue-200 text-blue-700' : 'border-gray-200'}`}>
                          Lecture {lecture.number}
                        </Badge>
                        {isSelected && (
                          <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <h4 className={`font-semibold text-sm line-clamp-2 ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                        {lecture.title}
                      </h4>

                      <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50">
                        <span>{lecture.pages}</span>
                        <span>{new Date(lecture.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setLectureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setLectureDialogOpen(false)} className="px-8 bg-blue-600 hover:bg-blue-700">
              Apply Selection ({selectedLectures.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;