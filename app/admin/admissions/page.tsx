'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Eye, Download, Check, X, Mail, Loader2, Search, 
  Filter, Calendar, Phone, MapPin, BookOpen, User, 
  Clock, Heart, FileText, GraduationCap, Users,
  AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
  id: string;
  reference_id: string;
  student_full_name: string;
  student_dob: string;
  student_gender: string;
  student_nationality: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_occupation: string;
  address: string;
  class_applying: string;
  previous_school: string;
  previous_school_address: string;
  academic_year: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string;
  allergies: string;
  status: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export default function AdmissionsAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, classFilter, applications]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error('Failed to load applications');
      console.error('Fetch error:', error);
    } else {
      setApplications(data || []);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.student_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parent_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    if (classFilter !== 'all') {
      filtered = filtered.filter(app => app.class_applying === classFilter);
    }
    
    setFilteredApps(filtered);
    setCurrentPage(1);
  };

  const updateStatus = async (id: string, status: string, rejectionReason?: string) => {
    setProcessingId(id);
    
    try {
      const response = await fetch('/api/admissions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectionReason })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Application ${status.toUpperCase()} - Email sent to parent`);
        fetchApplications();
        setIsRejectModalOpen(false);
        setRejectionReason('');
        setIsPreviewOpen(false);
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const downloadPDF = async (referenceId: string) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      const response = await fetch(`/api/admissions/download/${referenceId}`);
      
      if (!response.ok) throw new Error('PDF generation failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-${referenceId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded', { id: 'pdf-download' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'pdf-download' });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const uniqueClasses = ['all', ...new Set(applications.map(app => app.class_applying).filter(Boolean))];
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // Complete Preview Modal with all fields
  const ViewApplicationModal = ({ app, onClose }: { app: Application; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-serif font-bold">Application Details</h2>
              <p className="text-gray-300 text-sm mt-1">Reference: {app.reference_id}</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition">✕</button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Status Badge */}
          <div className="mb-6 flex justify-between items-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(app.status)}`}>
              Status: {app.status.toUpperCase()}
            </div>
            {app.reviewed_at && (
              <span className="text-xs text-gray-500">Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}</span>
            )}
          </div>

          {/* Student Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" /> Student Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow label="Full Name" value={app.student_full_name} />
              <InfoRow label="Date of Birth" value={app.student_dob ? new Date(app.student_dob).toLocaleDateString() : 'N/A'} />
              <InfoRow label="Gender" value={app.student_gender || 'N/A'} />
              <InfoRow label="Nationality" value={app.student_nationality || 'Cameroonian'} />
            </div>
          </div>

          {/* Parent Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" /> Parent/Guardian Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow label="Parent Name" value={app.parent_name} />
              <InfoRow label="Email" value={app.parent_email} />
              <InfoRow label="Phone" value={app.parent_phone} />
              <InfoRow label="Occupation" value={app.parent_occupation || 'N/A'} />
              <InfoRow label="Address" value={app.address || 'N/A'} colSpan={2} />
            </div>
          </div>

          {/* Emergency Contact */}
          {(app.emergency_contact_name || app.emergency_contact_phone) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Emergency Contact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow label="Contact Name" value={app.emergency_contact_name || 'N/A'} />
                <InfoRow label="Contact Phone" value={app.emergency_contact_phone || 'N/A'} />
              </div>
            </div>
          )}

          {/* Academic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" /> Academic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow label="Applying for Class" value={app.class_applying} />
              <InfoRow label="Academic Year" value={app.academic_year || '2025/2026'} />
              <InfoRow label="Previous School" value={app.previous_school || 'N/A'} />
              <InfoRow label="Previous School Address" value={app.previous_school_address || 'N/A'} colSpan={2} />
            </div>
          </div>

          {/* Health Information */}
          {(app.medical_conditions || app.allergies) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-500" /> Health Information
              </h3>
              <div className="space-y-3">
                {app.medical_conditions && <InfoRow label="Medical Conditions" value={app.medical_conditions} colSpan={2} />}
                {app.allergies && <InfoRow label="Allergies" value={app.allergies} colSpan={2} />}
              </div>
            </div>
          )}

          {/* Submission Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Submission Information</h3>
            <InfoRow label="Submitted" value={new Date(app.submitted_at).toLocaleString()} />
          </div>

          {/* Actions */}
          {app.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                onClick={() => updateStatus(app.id, 'approved')}
                disabled={processingId === app.id}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve & Send Email
              </button>
              <button
                onClick={() => {
                  setSelectedApp(app);
                  setIsRejectModalOpen(true);
                  onClose();
                }}
                className="flex-1 bg-rose-600 text-white py-3 rounded-xl hover:bg-rose-700 transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Reject with Reason
              </button>
            </div>
          )}
          
          {app.status !== 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => downloadPDF(app.reference_id)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const InfoRow = ({ label, value, colSpan = 1 }: { label: string; value: string; colSpan?: number }) => (
    <div className={`${colSpan === 2 ? 'md:col-span-2' : ''} bg-gray-50 rounded-lg p-3`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
  );

  // Reject Modal
  const RejectModal = ({ app, onClose }: { app: Application; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <X className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Reject Application</h3>
          <p className="text-gray-600 text-sm mt-1">
            Application for <strong>{app.student_full_name}</strong>
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for rejection <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            placeholder="Please provide a clear reason for rejecting this application..."
          />
          <p className="text-xs text-gray-500 mt-1">This will be included in the email sent to the parent.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!rejectionReason.trim()) {
                toast.error('Please provide a reason for rejection');
                return;
              }
              updateStatus(app.id, 'rejected', rejectionReason);
              onClose();
            }}
            disabled={processingId === app.id}
            className="flex-1 bg-rose-600 text-white py-2 rounded-xl hover:bg-rose-700 transition flex items-center justify-center gap-2"
          >
            {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Reject & Notify
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800">Admission Applications</h1>
        <p className="text-gray-600 text-sm mt-1">Manage and review student applications</p>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Total" value={applications.length} color="blue" />
        <StatCard label="Pending" value={applications.filter(a => a.status === 'pending').length} color="amber" />
        <StatCard label="Approved" value={applications.filter(a => a.status === 'approved').length} color="emerald" />
        <StatCard label="Rejected" value={applications.filter(a => a.status === 'rejected').length} color="rose" />
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, reference, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            {uniqueClasses.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table - Mobile Responsive Card View */}
      <div className="space-y-3 md:hidden">
        {currentItems.map((app) => (
          <div key={app.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono text-xs text-amber-600 font-semibold">{app.reference_id}</p>
                <p className="font-semibold text-slate-800 mt-1">{app.student_full_name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                {app.status}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-3">
              <p className="text-gray-600"><strong>Parent:</strong> {app.parent_name}</p>
              <p className="text-gray-600"><strong>Class:</strong> {app.class_applying}</p>
              <p className="text-gray-500 text-xs">{new Date(app.submitted_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <button onClick={() => { setSelectedApp(app); setIsPreviewOpen(true); }} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">View</button>
              {app.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(app.id, 'approved')} className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">Approve</button>
                  <button onClick={() => { setSelectedApp(app); setIsRejectModalOpen(true); }} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium">Reject</button>
                </>
              )}
              <button onClick={() => downloadPDF(app.reference_id)} className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium">PDF</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Ref ID</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Student</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Parent</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Class</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Submitted</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-sm font-medium text-amber-600">{app.reference_id}</td>
                  <td className="p-4 font-medium text-gray-900">{app.student_full_name}</td>
                  <td className="p-4 text-gray-700">{app.parent_name}</td>
                  <td className="p-4">{app.class_applying}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>{app.status}</span></td>
                  <td className="p-4 text-sm text-gray-600">{new Date(app.submitted_at).toLocaleDateString()}</td>
                  <td className="p-4"><div className="flex gap-2">
                    <button onClick={() => { setSelectedApp(app); setIsPreviewOpen(true); }} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600" title="View Details"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => downloadPDF(app.reference_id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Download PDF"><Download className="w-4 h-4" /></button>
                    {app.status === 'pending' && (<>
                      <button onClick={() => updateStatus(app.id, 'approved')} className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600" title="Approve"><Check className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedApp(app); setIsRejectModalOpen(true); }} className="p-2 hover:bg-rose-100 rounded-lg text-rose-600" title="Reject"><X className="w-4 h-4" /></button>
                    </>)}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isPreviewOpen && selectedApp && <ViewApplicationModal app={selectedApp} onClose={() => setIsPreviewOpen(false)} />}
        {isRejectModalOpen && selectedApp && <RejectModal app={selectedApp} onClose={() => setIsRejectModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color as keyof typeof colors]}`}>{value}</p>
    </div>
  );
}