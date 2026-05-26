'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LayoutDashboard, Megaphone, Calendar, Users, Image, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const menuItems = [
    { icon: Megaphone, label: 'Announcements', href: '/admin/announcements', color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { icon: Calendar, label: 'Events', href: '/admin/events', color: 'bg-green-100', iconColor: 'text-green-600' },
    { icon: Users, label: 'Staff', href: '/admin/staff', color: 'bg-purple-100', iconColor: 'text-purple-600' },
    { icon: Image, label: 'Gallery', href: '/admin/gallery', color: 'bg-pink-100', iconColor: 'text-pink-600' },
    { icon: LayoutDashboard, label: 'Admissions', href: '/admin/admissions', color: 'bg-amber-100', iconColor: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-serif font-bold text-slate-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] border border-gray-100"
            >
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.label}</h3>
              <p className="text-gray-600 text-sm">Manage {item.label.toLowerCase()} for the school</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">0</div>
              <div className="text-sm text-gray-600">Pending Admissions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">0</div>
              <div className="text-sm text-gray-600">Total Announcements</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">0</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">0</div>
              <div className="text-sm text-gray-600">Gallery Photos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}