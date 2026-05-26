'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  created_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    category: 'academic',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      toast.error('Failed to fetch events');
    } else {
      setEvents(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      const { error } = await supabase
        .from('events')
        .update(formData)
        .eq('id', editing.id);

      if (error) {
        toast.error('Failed to update');
      } else {
        toast.success('Event updated!');
        setIsModalOpen(false);
        fetchEvents();
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([formData]);

      if (error) {
        toast.error('Failed to create');
      } else {
        toast.success('Event created!');
        setIsModalOpen(false);
        fetchEvents();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete');
      } else {
        toast.success('Event deleted!');
        fetchEvents();
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'academic': return 'bg-blue-100 text-blue-700';
      case 'sports': return 'bg-green-100 text-green-700';
      case 'cultural': return 'bg-purple-100 text-purple-700';
      case 'exam': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date();
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Events Calendar</h1>
          <p className="text-gray-600 mt-1">Manage school events and activities</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ title: '', description: '', event_date: '', event_time: '', location: '', category: 'academic' });
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-12 text-center text-gray-500">
            No events scheduled. Click "Add Event" to create one.
          </div>
        ) : (
          events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition ${
                isUpcoming(event.event_date) ? 'border-l-4 border-l-amber-500' : 'opacity-75'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                    {event.category.toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(event);
                        setFormData({
                          title: event.title,
                          description: event.description || '',
                          event_date: event.event_date,
                          event_time: event.event_time || '',
                          location: event.location || '',
                          category: event.category,
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {event.event_time && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{event.event_time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                
                {!isUpcoming(event.event_date) && (
                  <div className="mt-3 text-xs text-gray-400">Past event</div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">
                {editing ? 'Edit Event' : 'Add New Event'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="School Hall, Sports Field, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Event details..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}