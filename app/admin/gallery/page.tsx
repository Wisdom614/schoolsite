'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  category: string;
  taken_at: string;
  uploaded_at: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: 'academic',
    taken_at: '',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch images');
    } else {
      setImages(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('gallery')
      .insert([{
        ...formData,
        uploaded_at: new Date().toISOString()
      }]);

    if (error) {
      toast.error('Failed to add image');
    } else {
      toast.success('Image added to gallery!');
      setIsModalOpen(false);
      fetchImages();
      setFormData({ title: '', image_url: '', category: 'academic', taken_at: '' });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete');
      } else {
        toast.success('Image deleted!');
        fetchImages();
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Gallery</h1>
          <p className="text-gray-600 mt-1">Manage school photo gallery</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-12 text-center text-gray-500">
            No images in gallery. Click "Add Image" to upload.
          </div>
        ) : (
          images.map((image, idx) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition group"
            >
              <div className="relative h-48 bg-gray-100">
                {image.image_url ? (
                  <Image
                    src={image.image_url}
                    alt={image.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 mb-1">{image.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{image.category}</p>
                {image.taken_at && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(image.taken_at).toLocaleDateString()}</span>
                  </div>
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
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">Add Image to Gallery</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
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
                    <option value="event">Event</option>
                    <option value="graduation">Graduation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Taken</label>
                  <input
                    type="date"
                    value={formData.taken_at}
                    onChange={(e) => setFormData({ ...formData, taken_at: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
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
                    {loading ? 'Adding...' : 'Add Image'}
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