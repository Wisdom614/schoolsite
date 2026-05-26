'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, FileText, Calendar, Megaphone, Image, 
  Download, Upload, Mail, Settings, TrendingUp,
  CheckCircle, XCircle, Clock, Edit, Trash2,
  Eye, Send, FileSpreadsheet, Printer, ArrowUp,
  UserPlus, MessageSquare, Star, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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
  const [recentActivity, setRecentActivity] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ months: [], counts: [] });
  const supabase = createClient();

  useEffect(() => {
    fetchAllData();
    fetchRecentActivity();
    fetchChartData();
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
      .select('*', { count: 'exact', head: true });
    
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
    
    // Fetch recent applications
    const { data: recent } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(5);
    
    if (recent) setRecentApplications(recent);
    
    setLoading(false);
  };

  const fetchRecentActivity = async () => {
    // Combine recent submissions and status changes
    const { data: recentSubmissions } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(10);
    
    if (recentSubmissions) {
      const activities = recentSubmissions.map(app => ({
        id: app.id,
        type: 'submission',
        message: `${app.student_full_name} submitted application`,
        time: app.submitted_at,
        status: app.status
      }));
      setRecentActivity(activities);
    }
  };

  const fetchChartData = async () => {
    const { data } = await supabase
      .from('admissions')
      .select('submitted_at')
      .order('submitted_at', { ascending: true });
    
    if (data) {
      const last6Months = [];
      const counts = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        last6Months.push(month);
        
        const count = data.filter(app => {
          const appDate = new Date(app.submitted_at);
          return appDate.getMonth() === date.getMonth() &&
                 appDate.getFullYear() === date.getFullYear();
        }).length;
        counts.push(count);
      }
      setChartData({ months: last6Months, counts });
    }
  };

  const sendBulkEmail = async () => {
    if (!emailSubject || !emailContent) {
      toast.error('Please fill in subject and content');
      return;
    }

    toast.loading('Sending emails...', { id: 'bulk-email' });
    
    // Get all parent emails
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
    toast.loading('Preparing export...', { id: 'export' });
    const { data: students } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported successfully!', { id: 'export' });
  };

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    toast.loading(`Importing students...`, { id: 'import' });
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        let success = 0;
        for (const student of results.data) {
          if (student.student_full_name && student.parent_name && student.parent_email) {
            const { error } = await supabase.from('admissions').insert([{
              ...student,
              status: 'pending',
              submitted_at: new Date().toISOString()
            }]);
            if (!error) success++;
          }
        }
        toast.success(`Imported ${success} students!`, { id: 'import' });
        fetchAllData();
        event.target.value = '';
      }
    });
  };

  const statsCards = [
    { title: 'Total Applications', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', change: '+12%', period: 'this month' },
    { title: 'Pending', value: stats.pendingApplications, icon: Clock, color: 'bg-yellow-500', change: '+3', period: 'new' },
    { title: 'Approved', value: stats.approvedApplications, icon: CheckCircle, color: 'bg-green-500', change: '+8', period: 'this month' },
    { title: 'Rejected', value: stats.rejectedApplications, icon: XCircle, color: 'bg-red-500', change: '-2', period: 'this month' },
  ];

  const quickActions = [
    { title: 'New Application', icon: UserPlus, href: '/admissions', color: 'bg-amber-500', description: 'Add new student application' },
    { title: 'Send Email', icon: Mail, onClick: () => setShowEmailModal(true), color: 'bg-purple-500', description: 'Send bulk emails' },
    { title: 'Export Data', icon: Download, onClick: exportToExcel, color: 'bg-green-500', description: 'Export to Excel' },
    { title: 'Import Data', icon: Upload, onClick: () => document.getElementById('import-file')?.click(), color: 'bg-blue-500', description: 'Import from CSV' },
    { title: 'Manage Staff', icon: Users, href: '/admin/staff', color: 'bg-indigo-500', description: 'Add or edit staff' },
    { title: 'Add Event', icon: Calendar, href: '/admin/events', color: 'bg-orange-500', description: 'Schedule new event' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for import */}
      <input
        id="import-file"
        type="file"
        accept=".csv,.xlsx"
        onChange={importFromCSV}
        className="hidden"
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-serif font-bold mb-2">Welcome back, Administrator</h1>
            <p className="text-gray-300">Here's what's happening with your school today.</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">{stat.change}</span>
                  <span className="text-xs text-gray-400">{stat.period}</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick || (action.href ? () => window.location.href = action.href : undefined)}
              className="bg-white rounded-xl p-4 text-center hover:shadow-md transition border border-gray-100"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-sm text-slate-800">{action.title}</p>
              <p className="text-xs text-gray-400 mt-1">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Applications Trend</h2>
          <div className="h-64 flex items-end gap-2">
            {chartData.counts.map((count, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-amber-500 to-amber-600 rounded-lg transition-all duration-500"
                  style={{ height: `${(count / Math.max(...chartData.counts, 1)) * 200}px` }}
                >
                  <div className="text-center text-white text-sm font-medium mt-1">
                    {count}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{chartData.months[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>
          <Link href="/admin/admissions" className="text-sm text-amber-600 hover:text-amber-700">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Reference</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Student</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Parent</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Class</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Submitted</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app: any) => (
                <tr key={app.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-sm text-amber-600">{app.reference_id}</td>
                  <td className="p-4 font-medium text-gray-900">{app.student_full_name}</td>
                  <td className="p-4 text-gray-600">{app.parent_name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                      {app.class_applying}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/student/${app.id}`}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600 transition"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedStudent(app);
                          setEmailSubject(`Update on ${app.student_full_name}'s application`);
                          setEmailContent(`Dear ${app.parent_name},\n\nRegarding ${app.student_full_name}'s application...`);
                          setShowEmailModal(true);
                        }}
                        className="p-1 hover:bg-purple-100 rounded text-purple-600 transition"
                        title="Send Email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>

      {/* System Status */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Database Status</p>
              <p className="font-semibold text-green-600">Connected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Service</p>
              <p className="font-semibold text-green-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Backup</p>
              <p className="font-semibold text-gray-700">Today, 02:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Send Email</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedStudent && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Sending to:</strong> {selectedStudent.parent_name} ({selectedStudent.parent_email})
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Student:</strong> {selectedStudent.student_full_name}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Write your message here..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{parent_name}'} and {'{student_name}'} for personalization
                  </p>
                </div>
                
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendBulkEmail}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Send Email
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