'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Eye, Download, Check, X, Search, BookOpen, Clock, Loader2 } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    console.log('Fetching applications...');
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load applications');
    } else {
      console.log('Fetched:', data);
      setApplications(data || []);
    }
  };

  const updateStatus = async (id: string, status: string, rejectionReason?: string) => {
    setProcessingId(id);
    console.log('Updating status:', { id, status, rejectionReason });
    
    try {
      const response = await fetch('/api/admissions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectionReason })
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok && data.success) {
        toast.success(`Application ${status.toUpperCase()}!`);
        await fetchApplications(); // Refresh the list
        setIsRejectModalOpen(false);
        setIsPreviewOpen(false);
        setRejectionReason('');
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Network error. Check console.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchTerm && !app.student_full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !app.reference_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Admission Applications</h1>
        <p className="text-gray-600 mb-6">Manage and review student applications</p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === 'approved').length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{applications.filter(a => a.status === 'rejected').length}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Ref ID</th>
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Parent</th>
                <th className="text-left p-4">Class</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{app.reference_id}</td>
                  <td className="p-4 font-medium">{app.student_full_name}</td>
                  <td className="p-4">{app.parent_name}</td>
                  <td className="p-4">{app.class_applying}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsPreviewOpen(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(app.id, 'approved')}
                            disabled={processingId === app.id}
                            className="p-2 hover:bg-green-100 rounded text-green-600 disabled:opacity-50"
                          >
                            {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setIsRejectModalOpen(true);
                            }}
                            className="p-2 hover:bg-red-100 rounded text-red-600"
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
      
      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gray-800 text-white p-4 flex justify-between">
                <h3 className="font-bold">Application Details</h3>
                <button onClick={() => setIsPreviewOpen(false)}>✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Student Information</h4>
                  <p><strong>Name:</strong> {selectedApp.student_full_name}</p>
                  <p><strong>DOB:</strong> {new Date(selectedApp.student_dob).toLocaleDateString()}</p>
                  <p><strong>Class:</strong> {selectedApp.class_applying}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Parent Information</h4>
                  <p><strong>Name:</strong> {selectedApp.parent_name}</p>
                  <p><strong>Email:</strong> {selectedApp.parent_email}</p>
                  <p><strong>Phone:</strong> {selectedApp.parent_phone}</p>
                </div>
                {selectedApp.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setIsPreviewOpen(false);
                        setIsRejectModalOpen(true);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Reject Modal */}
        {isRejectModalOpen && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Reject Application</h3>
              <p className="mb-4">Application for: <strong>{selectedApp.student_full_name}</strong></p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full p-3 border rounded-lg mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(selectedApp.id, 'rejected', rejectionReason)}
                  className="flex-1 bg-red-600 text-white py-2 rounded"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}