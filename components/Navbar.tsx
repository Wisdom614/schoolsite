'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, School, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Image from 'next/image';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Staff', href: '/staff' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Admissions', href: '/admissions' },
  { name: 'News', href: '/announcements' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    fetchSchoolSettings();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSchoolSettings = async () => {
    const { data, error } = await supabase
      .from('school_settings')
      .select('school_name, school_logo, primary_color, secondary_color')
      .single();

    if (!error && data) {
      setSchoolSettings(data);
    } else {
      // Fallback defaults
      setSchoolSettings({
        school_name: 'St. Bernard School',
        school_logo: '',
        primary_color: '#f59e0b',
        secondary_color: '#1e293b'
      });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {schoolSettings?.school_logo ? (
                <div className="relative w-10 h-10 overflow-hidden rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={schoolSettings.school_logo}
                    alt={schoolSettings.school_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <School className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="font-serif font-bold text-xl text-slate-800">
                  {schoolSettings?.school_name || 'St. Bernard'}
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-amber-500 font-medium transition-colors duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
              <Link
                href="/admissions"
                className="bg-gradient-gold text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:text-amber-500 font-medium py-2 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/admissions"
                onClick={() => setIsOpen(false)}
                className="bg-gradient-gold text-white px-6 py-2 rounded-full font-semibold text-center"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-20"></div>
    </>
  );
}