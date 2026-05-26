'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Briefcase, Search } from 'lucide-react';
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
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [selectedDepartment, searchTerm, staff]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching staff:', error);
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  };

  const filterStaff = () => {
    let filtered = [...staff];
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredStaff(filtered);
  };

  const departments = ['all', ...new Set(staff.map(member => member.department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-4">
            Meet Our <span className="text-gradient">Staff</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dedicated educators and staff committed to excellence in education and student development
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, position, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStaff.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Photo */}
                <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{member.full_name}</h3>
                  <p className="text-amber-600 font-semibold text-sm mb-3">{member.position}</p>
                  
                  {member.department && (
                    <div className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full mb-4">
                      {member.department}
                    </div>
                  )}

                  {member.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                  )}

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${member.email}`} className="hover:text-amber-600 transition">
                          {member.email}
                        </a>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${member.phone}`} className="hover:text-amber-600 transition">
                          {member.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredStaff.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No staff members found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}