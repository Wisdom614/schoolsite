'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Megaphone, Users, ArrowRight, CheckCircle, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stats = [
  { label: 'Years of Excellence', value: '25+' },
  { label: 'Students Enrolled', value: '1,200+' },
  { label: 'Qualified Staff', value: '45+' },
  { label: 'Success Rate', value: '98%' },
];

const features = [
  { icon: GraduationCap, title: 'Quality Education', description: 'Modern curriculum with experienced educators preparing students for global challenges' },
  { icon: Calendar, title: 'Events & Activities', description: 'Rich extracurricular programs including sports, arts, and academic competitions' },
  { icon: Megaphone, title: 'Instant Updates', description: 'Real-time announcements and news via our digital communication system' },
  { icon: Users, title: 'Parent Portal', description: 'Stay connected with your child\'s academic progress and school activities' },
];

const announcements = [
  {
    title: '2025-2026 Admissions Open',
    date: 'December 25, 2025',
    description: 'Applications are now open for the upcoming academic year. Limited spaces available.',
    type: 'important'
  },
  {
    title: 'End of Term Examinations',
    date: 'December 20, 2025',
    description: 'End of term exams will begin on January 10th, 2026. All students are advised to prepare adequately.',
    type: 'academic'
  },
  {
    title: 'Parent-Teacher Conference',
    date: 'January 15, 2026',
    description: 'Annual parent-teacher conference scheduled for January 15th, 2026 at the school auditorium.',
    type: 'event'
  }
];

const upcomingEvents = [
  { name: 'Resumption Date', date: 'Jan 8, 2026', type: 'academic' },
  { name: 'Inter-House Sports', date: 'Jan 20, 2026', type: 'sports' },
  { name: 'Open Day', date: 'Feb 5, 2026', type: 'event' },
  { name: 'Graduation Ceremony', date: 'Mar 15, 2026', type: 'ceremony' },
];

export default function Home() {
  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl animate-float" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-600 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-2xl animate-float animation-delay-4000" />
          </div>
          
          <div className="relative container mx-auto px-6 py-24 md:py-32">
            <motion.div {...fadeInUp} className="text-center max-w-5xl mx-auto">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-6"
              >
                <span className="bg-amber-500/20 backdrop-blur-sm text-amber-300 px-4 py-2 rounded-full text-sm font-semibold">
                  Excellence in Education Since 1998
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
                Excellence in Education,
                <span className="text-amber-400"> Digital by Design</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Welcome to St. Bernard Secondary School, Molyko - Buea. Where tradition meets innovation in shaping tomorrow's leaders through quality education and modern technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admissions" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/about" className="border-2 border-white hover:bg-white hover:text-slate-900 px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105">
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {stats.map((stat, idx) => (
                <motion.div 
                  key={idx} 
                  className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
                Why Choose St. Bernard?
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                We provide a holistic education experience that prepares students for the digital age
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="container mx-auto px-6">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
                Latest Announcements
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Stay updated with the latest news and events from St. Bernard Secondary School
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {announcements.map((announcement, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className={`h-2 ${
                    announcement.type === 'important' ? 'bg-red-500' :
                    announcement.type === 'academic' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-slate-800">{announcement.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{announcement.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-600 font-medium">{announcement.date}</span>
                      <Link href="/announcements" className="text-slate-600 hover:text-amber-600 transition">Read More →</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
                Upcoming Events
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Mark your calendars for these important dates
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-4">
              {upcomingEvents.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-center text-white"
                >
                  <div className="text-2xl font-bold text-amber-400 mb-2">{event.name}</div>
                  <div className="text-sm text-gray-300">{event.date}</div>
                  <div className="mt-3 text-xs uppercase tracking-wide bg-white/10 inline-block px-3 py-1 rounded-full">
                    {event.type}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Admissions */}
        <section className="bg-gradient-to-r from-amber-500 to-amber-600 py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div {...fadeInUp}>
              <div className="inline-block mb-6">
                <BookOpen className="w-16 h-16 text-white opacity-80" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Ready to Join Our Family?
              </h2>
              <p className="text-amber-100 mb-8 text-lg max-w-2xl mx-auto">
                Applications for the 2025-2026 academic year are now open. Take the first step towards excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admissions" className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                  Start Application <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-all">
                  Contact Us <Award className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-serif font-bold mb-4">St. Bernard SS</h3>
                <p className="text-gray-400 text-sm">Excellence in Education, Digital by Design</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/admissions" className="hover:text-amber-400 transition">Admissions</Link></li>
                  <li><Link href="/about" className="hover:text-amber-400 transition">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-amber-400 transition">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact Info</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Molyko - Buea</li>
                  <li>South West Region</li>
                  <li>+237 671657357</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition">Facebook</a>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition">Twitter</a>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition">Instagram</a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              © 2025 St. Bernard Secondary School. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
      
      <ChatWidget />
    </>
  );
}