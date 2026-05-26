'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Calendar, Pin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });
    
    if (data) setAnnouncements(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-serif font-bold text-slate-800 mb-8">Announcements</h1>
        
        <div className="space-y-6">
          {announcements.map((announcement: any) => (
            <div key={announcement.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                {announcement.is_pinned && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(announcement.published_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">{announcement.title}</h2>
              <p className="text-gray-600">{announcement.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}