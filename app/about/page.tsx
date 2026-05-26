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
                  src="data:image/jpeg;base64,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"
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