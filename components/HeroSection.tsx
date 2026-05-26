'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Award, Users, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function HeroSection() {
  const [settings, setSettings] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('school_settings')
      .select('school_name, school_motto, primary_color, secondary_color')
      .single();
    
    if (data) setSettings(data);
  };

  const stats = [
    { icon: Award, value: '25+', label: 'Years of Excellence' },
    { icon: Users, value: '1,200+', label: 'Students Enrolled' },
    { icon: Calendar, value: '98%', label: 'Success Rate' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000" />
      </div>

      <div className="relative container mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-white">Welcome to {settings?.school_name || 'St. Bernard'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight"
            >
              Excellence in
              <span className="text-gradient"> Education,</span>
              <br />
              Digital by Design
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              {settings?.school_motto || 'Where tradition meets innovation in shaping tomorrow\'s leaders.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/admissions"
                className="group bg-gradient-gold text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Apply Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-slate-900 transition-all text-center"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <stat.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-300 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{i}</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}