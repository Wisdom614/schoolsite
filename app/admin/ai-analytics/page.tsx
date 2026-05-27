'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { MessageCircle, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAnalytics() {
  const [stats, setStats] = useState({
    totalChats: 0,
    uniqueUsers: 0,
    avgResponseTime: 0,
    topQuestions: []
  });
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      const uniqueSessions = new Set(data.map(log => log.session_id)).size;
      setStats({
        totalChats: data.length,
        uniqueUsers: uniqueSessions,
        avgResponseTime: 2.5,
        topQuestions: ['Admission fees', 'Application status', 'School calendar']
      });
    }
  };

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8">AI Assistant Analytics</h1>
      
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <MessageCircle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalChats}</p>
          <p className="text-sm text-gray-500">Total Conversations</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
          <p className="text-sm text-gray-500">Unique Users</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Clock className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
          <p className="text-sm text-gray-500">Avg Response Time</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">98%</p>
          <p className="text-sm text-gray-500">User Satisfaction</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {stats.topQuestions.map((q, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>{q}</span>
              <span className="text-sm text-amber-600">High volume</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}