'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Users, FileText, Calendar, Megaphone, Image, 
  Download, Upload, Mail, Settings, TrendingUp,
  CheckCircle, XCircle, Clock, Edit, Trash2,
  Eye, Send, FileSpreadsheet, Printer, Award,
  GraduationCap, BookOpen, DollarSign, Activity,
  ArrowUp, ArrowDown, MoreHorizontal, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalAnnouncements: 0,
    totalEvents: 0,
    totalStaff: 0,
    totalGallery: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch admissions stats
    const { data: admissions } = await supabase
      .from('admissions')
      .select('status');
    
    // Fetch announcements count
    const { count: announcementsCount } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true });
    
    // Fetch events count
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    // Fetch staff count
    const { count: staffCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Fetch gallery count
    const { count: galleryCount } = await supabase
      .from('gallery')
      .select('*', { count: 'exact', head: true });
    
    if (admissions) {
      setStats({
        totalStudents: admissions.length,
        pendingApplications: admissions.filter(a => a.status === 'pending').length,
        approvedApplications: admissions.filter(a => a.status === 'approved').length,
        rejectedApplications: admissions.filter(a => a.status === 'rejected').length,
        totalAnnouncements: announcementsCount || 0,
        totalEvents: eventsCount || 0,
        totalStaff: staffCount || 0,
        totalGallery: galleryCount || 0
      });
    }
    
    await fetchRecentApplications();
    await fetchRecentAnnouncements();
    await fetchUpcomingEvents();
    generateRecentActivity();
    
    setLoading(false);
  };

  const fetchRecentApplications = async () => {
    const { data } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(5);
    
    if (data) setRecentApplications(data);
  };

  const fetchRecentAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (data) setRecentAnnouncements(data);
  };

  const fetchUpcomingEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(3);
    
    if (data) setUpcomingEvents(data);
  };

  const generateRecentActivity = () => {
    const activities = [];
    
    // Add application activities
    recentApplications.forEach(app => {
      activities.push({
        type: 'application',
        message: `${app.student_full_name} submitted an application`,
        time: app.submitted_at,
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100'
      });
    });
    
    setRecentActivity(activities.slice(0, 5));
  };

  const sendBulkEmail = async () => {
    if (!emailSubject || !emailContent) {
      toast.error('Please fill in subject and content');
      return;
    }

    toast.loading('Sending emails...', { id: 'bulk-email' });
    
    const { data: parents } = await supabase
      .from('admissions')
      .select('parent_email, parent_name, student_full_name');
    
    let sent = 0;
    for (const parent of parents || []) {
      try {
        await fetch('/api/admissions/send-bulk-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: parent.parent_email,
            subject: emailSubject,
            content: emailContent,
            parentName: parent.parent_name,
            studentName: parent.student_full_name
          })
        });
        sent++;
      } catch (error) {
        console.error('Failed to send to:', parent.parent_email);
      }
    }
    
    toast.success(`Sent to ${sent} parents`, { id: 'bulk-email' });
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailContent('');
  };

  const exportToExcel = async () => {
    const { data: students } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString()}.xlsx`);
    toast.success('Exported successfully!');
  };

  const statsCards = [
    { 
      title: 'Total Applications', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      trend: 'up'
    },
    { 
      title: 'Pending Review', 
      value: stats.pendingApplications, 
      icon: Clock, 
      color: 'from-yellow-500 to-yellow-600',
      change: 'Urgent',
      trend: 'warning'
    },
    { 
      title: 'Approved', 
      value: stats.approvedApplications, 
      icon: CheckCircle, 
      color: 'from-green-500 to-green-600',
      change: '+8%',
      trend: 'up'
    },
    { 
      title: 'Staff Members', 
      value: stats.totalStaff, 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      change: 'Active',
      trend: 'stable'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-500" />}
                  {stat.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>{stat.change}</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export Data
          </button>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer">
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv,.xlsx" className="hidden" />
          </label>
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Mail className="w-4 h-4" /> Bulk Email
          </button>
          <Link
            href="/admin/admissions"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Users className="w-4 h-4" /> View Applications
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Recent Applications</h3>
            <Link href="/admin/admissions" className="text-amber-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No applications yet</div>
            ) : (
              recentApplications.map((app: any) => (
                <div key={app.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{app.student_full_name}</p>
                      <p className="text-sm text-gray-500">{app.class_applying} • {app.parent_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                      <Link
                        href={`/admin/student/${app.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Recent Announcements</h3>
            <Link href="/admin/announcements" className="text-amber-600 text-sm hover:underline">
              Manage
            </Link>
          </div>
          <div className="divide-y">
            {recentAnnouncements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No announcements yet</div>
            ) : (
              recentAnnouncements.map((announcement: any) => (
                <div key={announcement.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{announcement.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{announcement.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(announcement.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    {announcement.is_pinned && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pinned</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Upcoming Events</h3>
            <Link href="/admin/events" className="text-amber-600 text-sm hover:underline">
              Add Event
            </Link>
          </div>
          <div className="divide-y">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No upcoming events</div>
            ) : (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-amber-600">
                        {new Date(event.event_date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{event.title}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500">{event.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
          </div>
          <div className="divide-y">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No recent activity</div>
            ) : (
              recentActivity.map((activity: any, idx: number) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${activity.bgColor} rounded-xl flex items-center justify-center`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-serif font-bold mb-4">Send Bulk Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Write your message here... Use {'{parent_name}'} and {'{student_name}'} for personalization"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Use {'{parent_name}'} and {'{student_name}'} to personalize each email
                  </p>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendBulkEmail}
                    className="px-6 py-2 bg-gradient-gold text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Send to All Parents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}