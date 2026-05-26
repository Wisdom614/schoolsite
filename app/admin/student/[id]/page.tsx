'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Save, ArrowLeft, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditStudent() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    const { data, error } = await supabase
      .from('admissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      toast.error('Student not found');
      router.push('/admin/dashboard');
    } else {
      setStudent(data);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('admissions')
      .update(student)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success('Student information updated!');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this application?')) {
      const { error } = await supabase
        .from('admissions')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('Failed to delete');
      } else {
        toast.success('Application deleted');
        router.push('/admin/dashboard');
      }
    }
  };

  const sendEmail = async () => {
    const subject = prompt('Email Subject:', `Update on ${student.student_full_name}'s application`);
    if (!subject) return;
    
    const message = prompt('Email Message:', `Dear ${student.parent_name},\n\n`);
    if (!message) return;
    
    const response = await fetch('/api/admissions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: student.parent_email,
        subject,
        html: `<p>${message.replace(/\n/g, '<br/>')}</p>`
      })
    });
    
    if (response.ok) {
      toast.success('Email sent!');
    } else {
      toast.error('Failed to send email');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={sendEmail}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Send className="w-4 h-4" /> Send Email
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-serif font-bold mb-6">Edit Student Application</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Student Full Name</label>
              <input
                type="text"
                value={student.student_full_name || ''}
                onChange={(e) => setStudent({...student, student_full_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={student.student_dob || ''}
                onChange={(e) => setStudent({...student, student_dob: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Parent Name</label>
              <input
                type="text"
                value={student.parent_name || ''}
                onChange={(e) => setStudent({...student, parent_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Parent Email</label>
              <input
                type="email"
                value={student.parent_email || ''}
                onChange={(e) => setStudent({...student, parent_email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={student.parent_phone || ''}
                onChange={(e) => setStudent({...student, parent_phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Class Applying</label>
              <select
                value={student.class_applying || ''}
                onChange={(e) => setStudent({...student, class_applying: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
                <option value="Form 5">Form 5</option>
                <option value="Lower Sixth">Lower Sixth</option>
                <option value="Upper Sixth">Upper Sixth</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={student.address || ''}
                onChange={(e) => setStudent({...student, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={student.status || 'pending'}
                onChange={(e) => setStudent({...student, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Reference ID</label>
              <input
                type="text"
                value={student.reference_id || ''}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}