'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Download, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const admissionSchema = z.object({
  student_full_name: z.string().min(2, 'Full name is required'),
  student_dob: z.string().min(1, 'Date of birth is required'),
  parent_name: z.string().min(2, 'Parent name is required'),
  parent_email: z.string().email('Valid email is required'),
  parent_phone: z.string().min(9, 'Valid phone number required'),
  address: z.string().optional(),
  class_applying: z.string().min(1, 'Please select a class'),
  previous_school: z.string().optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

export default function AdmissionsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
  });

  const onSubmit = async (data: AdmissionFormData) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/admissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setReferenceId(result.reference_id);
        setSubmitted(true);
        toast.success('Application submitted successfully!');
        reset();
      } else {
        toast.error(result.error || 'Submission failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/admissions/download/${referenceId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-${referenceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-2">Your reference ID is:</p>
            <p className="text-2xl font-mono font-bold text-amber-600 mb-6">{referenceId}</p>
            <p className="text-gray-600 mb-6">
              Please save this reference number. We will contact you within 3-5 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition"
              >
                <Download className="w-4 h-4" /> Download Application PDF
              </button>
              <Link
                href="/"
                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                Return Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Online Admission Application</h1>
            <p className="text-gray-300">St. Bernard Secondary School, Molyko - Buea</p>
            <div className="mt-4 text-sm bg-white/10 inline-block px-4 py-2 rounded-lg">
              Academic Year 2025-2026
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b">Student Information</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Full Name *
                </label>
                <input
                  {...register('student_full_name')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="John Mbah Ndumbe"
                />
                {errors.student_full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.student_full_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  {...register('student_dob')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                {errors.student_dob && (
                  <p className="text-red-500 text-xs mt-1">{errors.student_dob.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applying for Class *
                </label>
                <select
                  {...register('class_applying')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select class</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                  <option value="Form 5">Form 5</option>
                  <option value="Lower Sixth">Lower Sixth</option>
                  <option value="Upper Sixth">Upper Sixth</option>
                </select>
                {errors.class_applying && (
                  <p className="text-red-500 text-xs mt-1">{errors.class_applying.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous School
                </label>
                <input
                  {...register('previous_school')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Previous school name"
                />
              </div>
              
              {/* Parent Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b mt-4">Parent/Guardian Information</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  {...register('parent_name')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Paul Ndumbe"
                />
                {errors.parent_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.parent_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('parent_email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="parent@example.com"
                />
                {errors.parent_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.parent_email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register('parent_phone')}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="+237 6XX XXX XXX"
                />
                {errors.parent_phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.parent_phone.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Residential Address
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Full address"
                />
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> After submission, you will receive a reference ID and can download your application form as PDF.
                Please keep this reference for future communication.
              </p>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                {!submitting && <ArrowRight className="inline ml-2 w-4 h-4" />}
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}