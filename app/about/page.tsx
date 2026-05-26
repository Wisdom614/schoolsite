'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  Target, Eye, Heart, Award, Users, BookOpen, 
  GraduationCap, TrendingUp, CheckCircle, Calendar
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SchoolSettings {
  school_name: string;
  school_motto: string;
  about_text: string;
  vision: string;
  mission: string;
  school_logo: string;
  phone: string;
  email: string;
  address: string;
}

export default function AboutPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    years: 25,
    graduates: 0
  });
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('school_settings')
      .select('*')
      .single();
    
    if (data) setSettings(data);
  };

  const fetchStats = async () => {
    const { count: students } = await supabase
      .from('admissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    const { count: staff } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    setStats({
      students: students || 0,
      staff: staff || 0,
      years: new Date().getFullYear() - 1999,
      graduates: 3500
    });
  };

  const values = [
    { icon: Heart, title: 'Integrity', description: 'We uphold the highest standards of honesty and ethical behavior.' },
    { icon: Award, title: 'Excellence', description: 'We strive for excellence in all aspects of education.' },
    { icon: Users, title: 'Community', description: 'We foster a supportive and inclusive school community.' },
    { icon: TrendingUp, title: 'Innovation', description: 'We embrace technology and modern teaching methods.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-premium text-white py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">About Us</h1>
            <p className="text-xl text-gray-300">
              {settings?.school_motto || 'Excellence in Education, Digital by Design'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: stats.years, label: 'Years of Excellence', icon: Calendar },
              { value: stats.students, label: 'Students Enrolled', icon: GraduationCap },
              { value: stats.staff, label: 'Qualified Staff', icon: BookOpen },
              { value: stats.graduates, label: 'Alumni', icon: Users },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-slate-800">{stat.value}+</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-6">
                Welcome to {settings?.school_name || 'St. Bernard Secondary School'}
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>{settings?.about_text || 'St. Bernard Secondary School is a leading educational institution in Molyko - Buea, committed to providing quality education and character development.'}</p>
                <p>Located in the heart of Molyko, Buea, our school provides a nurturing environment where students are encouraged to explore their potential, develop critical thinking skills, and grow into responsible citizens.</p>
                <p>We believe in a holistic approach to education that balances academic excellence with extracurricular activities, character development, and digital literacy.</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-gold opacity-20"></div>
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800"
                  alt="School building"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">25+</div>
                    <div className="text-xs text-gray-500">Years of Excellence</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                {settings?.vision || 'To be a center of excellence in education, producing well-rounded leaders who excel academically and morally, equipped with digital skills for the future.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8"
            >
              <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {settings?.mission || 'To provide holistic education that integrates academic excellence, character development, and digital literacy, fostering critical thinking, creativity, and leadership skills in a supportive environment.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Why Choose St. Bernard?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What makes our school the best choice for your child's education
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Modern Curriculum', description: 'Cambridge and National curriculum with digital integration', icon: BookOpen },
              { title: 'Expert Teachers', description: 'Qualified and experienced educators', icon: Users },
              { title: 'Digital Learning', description: 'State-of-the-art computer lab and smart classrooms', icon: TrendingUp },
              { title: 'Extracurricular', description: 'Sports, arts, clubs, and cultural activities', icon: Award },
              { title: 'Safe Environment', description: 'Secure campus with strict safety protocols', icon: CheckCircle },
              { title: 'Parent Partnership', description: 'Regular communication and parent involvement', icon: Heart },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-gold py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-white mb-4">
              Ready to Join Our Family?
            </h2>
            <p className="text-amber-100 mb-8">
              Take the first step towards excellence in education
            </p>
            <Link
              href="/admissions"
              className="inline-block bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Apply Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}