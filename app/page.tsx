'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Megaphone, Users } from 'lucide-react';
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
  { icon: GraduationCap, title: 'Quality Education', description: 'Modern curriculum with experienced educators' },
  { icon: Calendar, title: 'Events & Activities', description: 'Rich extracurricular programs' },
  { icon: Megaphone, title: 'Instant Updates', description: 'Real-time announcements and news' },
  { icon: Users, title: 'Parent Portal', description: 'Stay connected with your child\'s progress' },
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
          </div>
          
          <div className="relative container mx-auto px-6 py-24 md:py-32">
            <motion.div {...fadeInUp} className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                Excellence in Education,
                <span className="text-amber-400"> Digital by Design</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10">
                Welcome to St. Bernard Secondary School, Molyko - Buea. Where tradition meets innovation in shaping tomorrow's leaders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admissions" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105">
                  Apply Now
                </Link>
                <Link href="/about" className="border-2 border-white hover:bg-white hover:text-slate-900 px-8 py-3 rounded-full font-semibold transition-all">
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
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-sm text-gray-300 mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">
                Why Choose St. Bernard?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-amber-500 to-amber-600 py-16">
          <div className="container mx-auto px-6 text-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Ready to Join Our Family?
              </h2>
              <p className="text-amber-100 mb-8 text-lg">
                Applications for the upcoming academic year are now open
              </p>
              <Link href="/admissions" className="inline-block bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                Start Application
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <ChatWidget />
    </>
  );
}