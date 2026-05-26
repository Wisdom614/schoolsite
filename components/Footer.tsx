'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Clock, Youtube } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('school_settings')
      .select('*')
      .single();
    
    if (data) setSettings(data);
  };

  return (
    <footer className="bg-gradient-premium text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">
              {settings?.school_name || 'St. Bernard School'}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              {settings?.school_motto || 'Excellence in Education, Digital by Design'}
            </p>
            <div className="flex gap-3">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-amber-500 transition">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-amber-400 transition">About Us</Link></li>
              <li><Link href="/admissions" className="text-gray-300 hover:text-amber-400 transition">Admissions</Link></li>
              <li><Link href="/staff" className="text-gray-300 hover:text-amber-400 transition">Staff Directory</Link></li>
              <li><Link href="/gallery" className="text-gray-300 hover:text-amber-400 transition">Gallery</Link></li>
              <li><Link href="/announcements" className="text-gray-300 hover:text-amber-400 transition">News & Events</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {settings?.address && (
                <li className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{settings.address}</span>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{settings.phone}</span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{settings.email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-lg mb-4">School Hours</h4>
            <div className="space-y-2 text-gray-300 text-sm whitespace-pre-line">
              {settings?.school_hours || 'Monday - Friday: 7:30 AM - 3:30 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed'}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {settings?.school_name || 'St. Bernard Secondary School'}. All rights reserved.</p>
          <p className="mt-1">Designed with ❤️ for excellence in education</p>
        </div>
      </div>
    </footer>
  );
}