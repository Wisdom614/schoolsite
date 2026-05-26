'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to format AI responses
const formatAIResponse = (text: string) => {
  // Split into paragraphs
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((para, idx) => {
    // Handle bullet points
    if (para.includes('•') || para.includes('-')) {
      const lines = para.split('\n');
      return (
        <div key={idx} className="space-y-1">
          {lines.map((line, lineIdx) => {
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <div key={lineIdx} className="flex items-start space-x-2">
                  <span className="text-amber-500">•</span>
                  <span>{line.replace(/[•-]\s*/, '')}</span>
                </div>
              );
            }
            return line && <p key={lineIdx} className="mb-2">{line}</p>;
          })}
        </div>
      );
    }
    
    // Handle numbered lists
    if (para.match(/^\d+\./)) {
      const lines = para.split('\n');
      return (
        <div key={idx} className="space-y-1">
          {lines.map((line, lineIdx) => {
            const match = line.match(/^(\d+)\.\s*(.*)/);
            if (match) {
              return (
                <div key={lineIdx} className="flex items-start space-x-2">
                  <span className="font-semibold text-amber-600 min-w-[24px]">{match[1]}.</span>
                  <span>{match[2]}</span>
                </div>
              );
            }
            return line && <p key={lineIdx}>{line}</p>;
          })}
        </div>
      );
    }
    
    // Regular paragraph
    return <p key={idx} className="mb-2">{para}</p>;
  });
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! 👋 I\'m Bewise AI, your virtual assistant for St. Bernard Secondary School. How can I help you today?\n\nYou can ask me about:\n• Admissions and fees\n• Academic programs\n• School events\n• Contact information' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // Clean up the response - remove any "Bewise AI:" prefixes or extra formatting
      let cleanResponse = data.reply || 'Thank you for your message. Please contact the school office for specific inquiries.';
      
      // Remove any "Bewise AI:" or "Assistant:" prefixes
      cleanResponse = cleanResponse.replace(/^(Bewise AI:|Assistant:|AI:)\s*/i, '');
      
      // Ensure proper spacing after periods
      cleanResponse = cleanResponse.replace(/\.([A-Z])/g, '. $1');
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: cleanResponse
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having technical difficulties. Please contact the school directly:\n\n📞 Phone: +237671657357\n📧 Email: wisdombesong123@gmail.com' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-full shadow-2xl hover:shadow-lg transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-amber-400">✨</span>
                  Bewise AI Assistant
                </h3>
                <p className="text-xs text-gray-300">Powered by Llama 3.3 • Always learning</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.role === 'assistant' 
                        ? formatAIResponse(msg.content)
                        : msg.content
                      }
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about admissions, fees, events..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2 rounded-full hover:shadow-lg transition disabled:opacity-50 w-10 h-10 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Bewise AI • School Information Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}