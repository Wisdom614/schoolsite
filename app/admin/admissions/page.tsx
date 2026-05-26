'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Eye, Download, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  reference_id: string;
  student_full_name: string;
  parent_name: string;
  parent_email: string;
  class_applying: string;
  status: string;
  submitted_at: string;
}

export default function AdmissionsAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
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

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('admissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Application ${status}`);
      fetchApplications();
    }
  };

  const downloadPDF = async (referenceId: string) => {
    const response = await fetch(`/api/admissions/download/${referenceId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admission-${referenceId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-6">Admission Applications</h1>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Ref ID</th>
                <th className="text-left p-4">Student Name</th>
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
                        onClick={() => downloadPDF(app.reference_id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'approved')}
                        className="p-1 hover:bg-green-100 rounded text-green-600"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'rejected')}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}