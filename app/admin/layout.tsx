'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Calendar,
  Images,
  Settings,
  LogOut,
  Menu,
  X,
  School,
  Mail,
  FileSpreadsheet,
  GraduationCap,
  Bell,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
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
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      name: 'Applications', 
      href: '/admin/admissions', 
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      name: 'Announcements', 
      href: '/admin/announcements', 
      icon: Megaphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      name: 'Events', 
      href: '/admin/events', 
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      name: 'Staff Directory', 
      href: '/admin/staff', 
      icon: School,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      name: 'Gallery', 
      href: '/admin/gallery', 
      icon: Images,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    { 
      name: 'Bulk Email', 
      href: '/admin/email', 
      icon: Mail,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      name: 'Import/Export', 
      href: '/admin/data', 
      icon: FileSpreadsheet,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-slate-800">St. Bernard</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${active 
                      ? `${item.bgColor} ${item.color} shadow-sm` 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 ${active ? item.color : 'group-hover:text-gray-900'}`} />
                  <span className="font-medium">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-1 h-8 bg-current rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border p-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">St. Bernard School</p>
                  <p className="text-xs text-gray-500">Molyko - Buea</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}