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
  ChevronDown,
  Home,
  UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
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
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      name: 'Applications', 
      href: '/admin/admissions', 
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      name: 'Announcements', 
      href: '/admin/announcements', 
      icon: Megaphone,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      name: 'Events', 
      href: '/admin/events', 
      icon: Calendar,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    { 
      name: 'Staff', 
      href: '/admin/staff', 
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
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
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-gray-100"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <School className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800">Admin Panel</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-slate-800">Admin Portal</h1>
                  <p className="text-xs text-gray-500">St. Bernard School</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
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
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${active 
                      ? `${item.bgColor} ${item.color} shadow-sm` 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${active ? item.color : 'group-hover:text-gray-900'}`} />
                  <span className="font-medium">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-8 bg-current rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold">
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
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border p-2">
                  <Link
                    href="/"
                    className="flex items-center gap-2 w-full px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Home className="w-4 h-4" />
                    <span>View Website</span>
                  </Link>
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
      <div className="lg:ml-72 min-h-screen">
        {/* Desktop Top Bar */}
        <div className="hidden lg:block bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, {user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">St. Bernard School</p>
                  <p className="text-xs text-gray-400">Molyko - Buea</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content - Mobile padding for fixed header */}
        <div className="pt-16 lg:pt-0">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}