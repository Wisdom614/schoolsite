'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Eye, Download, Check, X, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
  id: string;
  reference_id: string;
  student_full_name: string;
  student_dob: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  address: string;
  class_applying: string;
  previous_school: string;
  status: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export default function AdmissionsAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error('Failed to load applications');
    } else {
      setApplications(data || []);
    }
  };

  const updateStatus = async (id: string, status: string, rejectionReason?: string) => {
    setProcessingId(id);
    
    try {
      const response = await fetch('/api/admissions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectionReason })
      });
      
      if (response.ok) {
        toast.success(`Application ${status} - Email sent to parent`);
        fetchApplications();
        setIsRejectModalOpen(false);
        setRejectionReason('');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const downloadPDF = async (referenceId: string) => {
    try {
      const response = await fetch(`/api/admissions/download/${referenceId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-${referenceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const ViewApplicationModal = ({ app, onClose }: { app: Application; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif font-bold">Application Details</h2>
              <p className="text-gray-300 text-sm">Reference: {app.reference_id}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-lg">
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            app.status === 'approved' ? 'bg-green-100 text-green-700' :
            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            Status: {app.status.toUpperCase()}
            {app.rejection_reason && app.status === 'rejected' && (
              <div className="mt-2 text-sm text-red-600">
                Reason: {app.rejection_reason}
              </div>
            )}
          </div>
          
          {/* Student Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Student Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{app.student_full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{new Date(app.student_dob).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applying for Class</p>
                <p className="font-medium">{app.class_applying}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Previous School</p>
                <p className="font-medium">{app.previous_school || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          {/* Parent Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Parent/Guardian Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Parent Name</p>
                <p className="font-medium">{app.parent_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{app.parent_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{app.parent_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{app.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          {/* Submission Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Submission Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Submitted Date</p>
                <p className="font-medium">{new Date(app.submitted_at).toLocaleString()}</p>
              </div>
              {app.reviewed_at && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed Date</p>
                  <p className="font-medium">{new Date(app.reviewed_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {app.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  updateStatus(app.id, 'approved');
                  onClose();
                }}
                disabled={processingId === app.id}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve & Notify
              </button>
              <button
                onClick={() => {
                  setSelectedApp(app);
                  setIsRejectModalOpen(true);
                  onClose();
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const RejectModal = ({ app, onClose }: { app: Application; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 mb-4">Reject Application</h3>
        <p className="text-gray-600 mb-4">
          Application for <strong>{app.student_full_name}</strong>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Reason for rejection *</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="Please provide a clear reason for rejecting this application..."
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
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
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Reject & Notify
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-slate-800">Admission Applications</h1>
          <div className="text-sm text-gray-600">
            Total: {applications.length} | 
            Pending: {applications.filter(a => a.status === 'pending').length}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4">Ref ID</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Parent</th>
                  <th className="text-left p-4">Class</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{app.reference_id}</td>
                    <td className="p-4 font-medium">{app.student_full_name}</td>
                    <td className="p-4">{app.parent_name}</td>
                    <td className="p-4">{app.class_applying}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsPreviewOpen(true);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadPDF(app.reference_id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              disabled={processingId === app.id}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition"
                              title="Approve"
                            >
                              {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setIsRejectModalOpen(true);
                              }}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isPreviewOpen && selectedApp && (
          <ViewApplicationModal app={selectedApp} onClose={() => setIsPreviewOpen(false)} />
        )}
        {isRejectModalOpen && selectedApp && (
          <RejectModal app={selectedApp} onClose={() => setIsRejectModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}