'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Send, Mail, Users, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function BulkEmailPage() {
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    const { data } = await supabase
      .from('admissions')
      .select('id, parent_name, parent_email, student_full_name, status');
    
    if (data) setRecipients(data);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSend = async () => {
    if (!subject || !content) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setSending(true);
    const selected = recipients.filter(r => selectedRecipients.includes(r.id));
    
    let successCount = 0;
    let failCount = 0;

    for (const recipient of selected) {
      try {
        const response = await fetch('/api/admissions/send-bulk-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient.parent_email,
            subject: subject,
            content: content,
            parentName: recipient.parent_name,
            studentName: recipient.student_full_name
          })
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    toast.success(`Sent to ${successCount} recipients${failCount > 0 ? `, ${failCount} failed` : ''}`);
    setSending(false);
    setSubject('');
    setContent('');
    setSelectedRecipients([]);
    setSelectAll(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800">Bulk Email</h1>
        <p className="text-gray-600 mt-2">Send mass emails to parents and guardians</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Email Composition */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-500" />
            Compose Email
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Email subject line"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder={`Dear {parent_name},\n\nRegarding {student_name}'s application...\n\nBest regards,\nSt. Bernard School`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{parent_name}'} and {'{student_name}'} for personalization
              </p>
            </div>
          </div>
        </div>

        {/* Recipients Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Select Recipients
          </h2>
          
          <div className="mb-4 flex justify-between items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-amber-500"
              />
              <span className="text-sm">Select All ({recipients.length})</span>
            </label>
            <span className="text-sm text-gray-500">
              Selected: {selectedRecipients.length}
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {recipients.map((recipient) => (
              <label
                key={recipient.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(recipient.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecipients([...selectedRecipients, recipient.id]);
                    } else {
                      setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                    }
                  }}
                  className="w-4 h-4 text-amber-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{recipient.parent_name}</p>
                  <p className="text-xs text-gray-500">{recipient.parent_email}</p>
                  <p className="text-xs text-gray-400">Student: {recipient.student_full_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  recipient.status === 'approved' ? 'bg-green-100 text-green-700' :
                  recipient.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {recipient.status}
                </span>
              </label>
            ))}
          </div>
          
          <button
            onClick={handleSend}
            disabled={sending || selectedRecipients.length === 0}
            className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {selectedRecipients.length} Recipients
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}