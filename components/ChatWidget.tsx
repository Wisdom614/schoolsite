'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! 👋 I\'m Bewise AI, your virtual assistant for St. Bernard Secondary School. How can I help you today?' 
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

  // Focus input when chat opens
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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
        content: data.reply || 'Thank you for your message. Please contact the school office for specific inquiries.' 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having technical difficulties. Please contact the school directly at +237671657357 for immediate assistance.' 
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

  return (
    <>
      {/* Chat Button - Mobile Optimized */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-lg transition-all duration-300 group"
        aria-label="Open chat"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
        {/* Pulse animation for attention */}
        <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75"></span>
      </motion.button>

      {/* Chat Window - Mobile Responsive */}
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
              mobile-chat-window
              ${isMinimized ? 'h-14 sm:h-16' : 'h-[80vh] sm:h-[500px] w-[90vw] sm:w-96'}
              bottom-20 right-4 sm:bottom-24 sm:right-6 rounded-2xl
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 sm:p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Bewise AI Assistant</h3>
                  <p className="text-xs text-gray-300 hidden sm:block">Powered by Llama 3.3</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="hover:bg-white/10 p-1 rounded-full transition"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="hover:bg-white/10 p-1 rounded-full transition"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area - Only show when not minimized */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}>
                        <p className="text-sm sm:text-base break-words">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Mobile Optimized */}
                <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything... 💬"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2 sm:p-2.5 rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2 hidden sm:block">
                    Powered by AI • Ask about admissions, events, and more
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-chat-window {
            left: 16px;
            right: 16px;
            width: auto !important;
          }
        }
      `}</style>
    </>
  );
}