'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Shield, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m BEWISE AI, your assistant for St. Bernard Secondary School.\n\nI can help you with:\n📋 General admission information\n📅 School calendar and events\n🎓 GCE programme details\n📢 Public announcements\n\n⚠️ Note: I cannot access private school data or statistics. For specific application status, please provide your reference ID.\n\nHow can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in (admin)
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserToken(session.access_token);
      }
    };
    checkAuth();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          userToken: userToken
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having technical difficulties. Please contact the school directly at +237 671 657 357 for assistance.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the admission requirements?",
    "How much is application fee?",
    "When are GCE exams?",
    "Check my application status with ID",
    "School contact information"
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-full shadow-2xl hover:shadow-lg transition-all"
      >
        <MessageCircle className="w-6 h-6" />
        {userToken && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
            <Shield className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">BEWISE AI Assistant</h3>
                    <p className="text-xs text-gray-300">
                      {userToken ? '✓ Admin Access' : 'Public Access - Limited Info'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 p-1 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {!userToken && (
                <div className="mt-2 text-xs bg-amber-500/20 rounded p-2 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  <span>Public mode: General information only</span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    {msg.content}
                    <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-amber-100' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-gray-50 border-t">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-xs bg-white border rounded-full px-3 py-1 hover:border-amber-500 hover:text-amber-600 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about admissions, fees, events..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading}
                  className="bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {userToken ? 'Admin mode • Full access' : 'Public mode • General info only'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}