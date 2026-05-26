'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, Pin, PinOff, Calendar, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  published_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    is_pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch announcements');
    } else {
      setAnnouncements(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            is_pinned: formData.is_pinned,
          })
          .eq('id', editing.id);

        if (error) {
          console.error('Update error:', error);
          toast.error('Failed to update: ' + error.message);
        } else {
          toast.success('Announcement updated!');
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      } else {
        // Insert new announcement (without created_by field)
        const { error } = await supabase
          .from('announcements')
          .insert([{ 
            title: formData.title,
            content: formData.content,
            category: formData.category,
            is_pinned: formData.is_pinned,
            published_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Insert error:', error);
          toast.error('Failed to create: ' + error.message);
        } else {
          toast.success('Announcement created!');
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete');
      } else {
        toast.success('Deleted successfully!');
        fetchAnnouncements();
      }
    }
  };

  const handlePin = async (id: string, currentPin: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ is_pinned: !currentPin })
      .eq('id', id);

    if (error) {
      console.error('Pin error:', error);
      toast.error('Failed to update pin');
    } else {
      toast.success(currentPin ? 'Unpinned' : 'Pinned');
      fetchAnnouncements();
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'academic': return 'bg-blue-100 text-blue-700';
      case 'exam': return 'bg-red-100 text-red-700';
      case 'event': return 'bg-purple-100 text-purple-700';
      case 'holiday': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Announcements</h1>
          <p className="text-gray-600 mt-1">Manage school news and updates</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ title: '', content: '', category: 'general', is_pinned: false });
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center text-gray-500">
            No announcements yet. Click "New Announcement" to create one.
          </div>
        ) : (
          announcements.map((announcement, idx) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {announcement.is_pinned && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(announcement.category)}`}>
                      {announcement.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(announcement.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600">{announcement.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handlePin(announcement.id, announcement.is_pinned)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={announcement.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    {announcement.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(announcement);
                      setFormData({
                        title: announcement.title,
                        content: announcement.content,
                        category: announcement.category,
                        is_pinned: announcement.is_pinned,
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
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
                {editing ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
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
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="exam">Exam</option>
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="w-4 h-4 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="pinned" className="text-sm font-medium">
                    Pin this announcement (shows at top)
                  </label>
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
                    {loading ? 'Saving...' : 'Save Announcement'}
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