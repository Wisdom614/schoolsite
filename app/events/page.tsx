'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (data) setEvents(data);
  };

  const groupedEvents = events.reduce((groups: any, event: any) => {
    const month = new Date(event.event_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[month]) groups[month] = [];
    groups[month].push(event);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-4xl font-serif font-bold text-slate-800 mb-8">School Calendar</h1>
        
        {Object.entries(groupedEvents).map(([month, monthEvents]: [string, any]) => (
          <div key={month} className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-amber-600 mb-4">{month}</h2>
            <div className="space-y-4">
              {monthEvents.map((event: any) => (
                <div key={event.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="bg-amber-100 rounded-lg p-3 text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-amber-700">
                        {new Date(event.event_date).getDate()}
                      </div>
                      <div className="text-xs text-amber-600">
                        {new Date(event.event_date).toLocaleString('default', { weekday: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{event.title}</h3>
                      {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {event.event_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}