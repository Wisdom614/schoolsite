'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `# 👋 Welcome to St. Bernard School

I'm **Bewise AI**, your virtual assistant. I can help you with:

---

📋 **Admissions** • Requirements & application process
💰 **Fees** • Tuition and payment information
🎓 **GCE Programme** • Exam schedules & registration
📅 **Events** • Upcoming school activities
📍 **Contact** • Location & office hours

---

**What would you like to know today?**`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || 'Thank you for your inquiry. Please contact our admissions office for specific details.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Unable to connect. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `# ⚠️ Connection Issue

I'm having trouble connecting right now.

**Please try again in a few moments**, or contact us directly:

📞 **Phone:** +237 671 657 357
📧 **Email:** info@stbernard.edu.cm

We apologize for the inconvenience.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What are the admission requirements?",
    "How much is school fees?",
    "Tell me about the GCE programme",
    "What are your school hours?",
    "How do I apply online?"
  ];

  // Custom markdown components for consistent styling
  const MarkdownComponents = {
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-lg font-bold text-slate-800 mb-2 mt-1">{children}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-base font-semibold text-slate-700 mb-1 mt-2">{children}</h2>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-none space-y-1 my-2">{children}</ul>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="text-sm flex items-start gap-2">
        <span className="text-amber-500 mt-0.5">•</span>
        <span>{children}</span>
      </li>
    ),
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-amber-600">{children}</strong>
    ),
    hr: () => (
      <hr className="my-3 border-gray-200" />
    ),
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group"
        aria-label="Open chat"
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></div>
          {/* Button */}
          <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-lg transition-all duration-300">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </div>
          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { type: 'spring', damping: 25 }
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-200
              ${isMinimized ? 'h-14 sm:h-16' : 'h-[85vh] sm:h-[600px] w-[95vw] sm:w-[450px]'}
              bottom-20 right-4 sm:bottom-24 sm:right-6 rounded-2xl
            `}
          >
            {/* Header */}
            <div 
              className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex justify-between items-center cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    Bewise AI Assistant
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 rounded-full text-[10px] text-green-300">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  </h3>
                  <p className="text-xs text-gray-300 hidden sm:block">Powered by Llama 3.3 • Instant responses</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="hover:bg-white/10 p-1.5 rounded-lg transition"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="hover:bg-white/10 p-1.5 rounded-lg transition"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' 
                            ? 'bg-amber-100' 
                            : 'bg-gradient-to-r from-slate-700 to-slate-800'
                        }`}>
                          {msg.role === 'user' ? (
                            <User className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' 
                            : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                        }`}>
                          <div className={`prose prose-sm max-w-none ${
                            msg.role === 'user' ? 'prose-invert' : ''
                          }`}>
                            <ReactMarkdown components={MarkdownComponents}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          <div className={`text-xs mt-2 ${
                            msg.role === 'user' ? 'text-amber-100' : 'text-gray-400'
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex space-x-1.5">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 2 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Suggested questions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(q)}
                          className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex space-x-2 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef as any}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        rows={1}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none overflow-hidden"
                        style={{ minHeight: '44px', maxHeight: '100px' }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 100) + 'px';
                        }}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2.5 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Bewise AI • Responses are AI-generated • Verify important information with school office
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}