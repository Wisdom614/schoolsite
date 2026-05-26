'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, User, Mail, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Staff {
  id: string;
  full_name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  bio: string;
  photo_url: string;
  order_index: number;
  is_active: boolean;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    bio: '',
    photo_url: '',
    order_index: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      toast.error('Failed to fetch staff');
    } else {
      setStaff(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      const { error } = await supabase
        .from('staff')
        .update(formData)
        .eq('id', editing.id);

      if (error) {
        toast.error('Failed to update');
      } else {
        toast.success('Staff updated!');
        setIsModalOpen(false);
        fetchStaff();
      }
    } else {
      const { error } = await supabase
        .from('staff')
        .insert([formData]);

      if (error) {
        toast.error('Failed to create');
      } else {
        toast.success('Staff added!');
        setIsModalOpen(false);
        fetchStaff();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete');
      } else {
        toast.success('Staff removed!');
        fetchStaff();
      }
    }
  };

  const departments = ['Administration', 'Teaching', 'Science', 'Arts', 'Sports', 'Support Staff'];

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Staff Directory</h1>
          <p className="text-gray-600 mt-1">Manage teachers and staff members</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ full_name: '', position: '', department: '', email: '', phone: '', bio: '', photo_url: '', order_index: staff.length, is_active: true });
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-12 text-center text-gray-500">
            No staff members added. Click "Add Staff" to create one.
          </div>
        ) : (
          staff.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                    {member.photo_url ? (
                      <Image src={member.photo_url} alt={member.full_name} width={64} height={64} className="rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-amber-600" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(member);
                        setFormData({
                          full_name: member.full_name,
                          position: member.position,
                          department: member.department,
                          email: member.email || '',
                          phone: member.phone || '',
                          bio: member.bio || '',
                          photo_url: member.photo_url || '',
                          order_index: member.order_index,
                          is_active: member.is_active,
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800">{member.full_name}</h3>
                <p className="text-amber-600 text-sm font-medium mb-2">{member.position}</p>
                <p className="text-xs text-gray-500 mb-3">{member.department}</p>
                
                <div className="space-y-2 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="text-xs">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{member.phone}</span>
                    </div>
                  )}
                </div>
                
                {member.bio && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2">{member.bio}</p>
                )}
                
                {!member.is_active && (
                  <div className="mt-3 text-xs text-red-500">Inactive</div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">
                {editing ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Position *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                      placeholder="Principal, Teacher, etc."
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order Index</label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Brief biography..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium">Active Staff Member</label>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Staff'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}