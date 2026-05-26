'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const categories = ['all', 'academic', 'sports', 'cultural', 'event', 'graduation'];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery:', error);
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      academic: '📚 Academic',
      sports: '⚽ Sports',
      cultural: '🎭 Cultural',
      event: '🎉 Event',
      graduation: '🎓 Graduation'
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
            Our <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore moments and memories from school events, academic activities, and celebrations
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-gold text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'All Photos' : getCategoryLabel(category)}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No images found</h3>
            <p className="text-gray-400 mt-2">Check back later for new photos</p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, idx) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt={image.title || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold bg-amber-500 px-4 py-2 rounded-full">
                      View Photo
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {image.title && (
                    <h3 className="font-semibold text-slate-800 mb-2">{image.title}</h3>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                      {getCategoryLabel(image.category)}
                    </span>
                    {image.taken_at && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(image.taken_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-amber-500 transition z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
              className="absolute left-4 text-white hover:text-amber-500 transition z-10"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
              className="absolute right-4 text-white hover:text-amber-500 transition z-10"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            <div
              className="max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Gallery image'}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                {selectedImage.title && (
                  <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  {getCategoryLabel(selectedImage.category)} • 
                  {selectedImage.taken_at && new Date(selectedImage.taken_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}