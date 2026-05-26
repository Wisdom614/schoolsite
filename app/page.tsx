'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import ChatWidget from '@/components/ChatWidget';
import HeroSection from '@/components/HeroSection';
import { 
  GraduationCap, Calendar, Megaphone, Users, 
  ArrowRight, Star, BookOpen, Heart, User, Image as ImageIcon
} from 'lucide-react';

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [staffPreview, setStaffPreview] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
    fetchGalleryPreview();
    fetchStaffPreview();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (data) setAnnouncements(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(3);
    
    if (data) setEvents(data);
  };

  const fetchGalleryPreview = async () => {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(4);
    if (data) setGalleryImages(data);
  };

  const fetchStaffPreview = async () => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(3);
    if (data) setStaffPreview(data);
  };

  const features = [
    { icon: BookOpen, title: 'Modern Curriculum', description: 'Cambridge and National curriculum with digital integration', color: 'from-blue-500 to-blue-600' },
    { icon: Users, title: 'Expert Teachers', description: 'Qualified educators dedicated to student success', color: 'from-green-500 to-green-600' },
    { icon: Star, title: 'Holistic Development', description: 'Sports, arts, and character development programs', color: 'from-purple-500 to-purple-600' },
    { icon: Heart, title: 'Safe Environment', description: 'Secure and nurturing learning environment', color: 'from-red-500 to-red-600' },
  ];

  return (
    <>
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
              Why Choose <span className="text-gradient">St. Bernard?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We provide a holistic education experience that prepares students for the digital age
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements & Events Section */}
      <section className="py-24 bg-gradient-light">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-800">Latest News</h2>
              </div>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No announcements yet.</p>
                ) : (
                  announcements.map((announcement: any, idx: number) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.is_pinned && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pinned</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(announcement.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{announcement.content}</p>
                    </motion.div>
                  ))
                )}
              </div>
              <Link
                href="/announcements"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold mt-6 hover:gap-3 transition-all"
              >
                View all announcements <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Events */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-800">Upcoming Events</h2>
              </div>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming events.</p>
                ) : (
                  events.map((event: any, idx: number) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-2xl font-bold text-amber-600">
                            {new Date(event.event_date).getDate()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">{event.title}</h3>
                          {event.description && (
                            <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-500">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold mt-6 hover:gap-3 transition-all"
              >
                View calendar <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-serif font-bold text-slate-800 mb-4">
              School <span className="text-gradient">Gallery</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Capturing precious moments and memories from school life
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {galleryImages.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gallery coming soon</p>
              </div>
            ) : (
              galleryImages.map((image: any, idx: number) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative h-48 rounded-xl overflow-hidden group cursor-pointer"
                  onClick={() => window.location.href = '/gallery'}
                >
                  <img
                    src={image.image_url}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold bg-amber-500 px-3 py-1 rounded-full">
                      View Photo
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {galleryImages.length > 0 && (
            <div className="text-center">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:gap-3 transition-all"
              >
                View Full Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Staff Preview Section */}
      <section className="py-24 bg-gradient-light">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-serif font-bold text-slate-800 mb-4">
              Meet Our <span className="text-gradient">Leadership</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dedicated educators shaping the future of our students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {staffPreview.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Staff directory coming soon</p>
              </div>
            ) : (
              staffPreview.map((member: any, idx: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{member.full_name}</h3>
                    <p className="text-amber-600 font-semibold text-sm mb-3">{member.position}</p>
                    {member.department && (
                      <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full mb-3">
                        {member.department}
                      </span>
                    )}
                    {member.bio && (
                      <p className="text-gray-600 text-sm line-clamp-2">{member.bio}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {staffPreview.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/staff"
                className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:gap-3 transition-all"
              >
                View All Staff <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Ready to Join Our Family?
            </h2>
            <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
              Applications for the upcoming academic year are now open. 
              Take the first step towards excellence.
            </p>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Start Application <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <ChatWidget />
    </>
  );
}