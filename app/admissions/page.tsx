'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  Download, CheckCircle, ArrowRight, User, Calendar, 
  Mail, Phone, MapPin, BookOpen, School, FileText,
  Users, GraduationCap, Heart, Shield, Award
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const admissionSchema = z.object({
  student_full_name: z.string().min(2, 'Full name is required'),
  student_dob: z.string().min(1, 'Date of birth is required'),
  student_gender: z.string().optional(),
  student_nationality: z.string().optional(),
  parent_name: z.string().min(2, 'Parent/Guardian name is required'),
  parent_email: z.string().email('Valid email is required'),
  parent_phone: z.string().min(9, 'Valid phone number required'),
  parent_occupation: z.string().optional(),
  address: z.string().optional(),
  class_applying: z.string().min(1, 'Please select a class'),
  previous_school: z.string().optional(),
  previous_school_address: z.string().optional(),
  academic_year: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

export default function AdmissionsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const supabase = createClient();

  useEffect(() => {
    fetchSchoolSettings();
  }, []);

  const fetchSchoolSettings = async () => {
    const { data } = await supabase
      .from('school_settings')
      .select('school_name, school_logo, primary_color')
      .single();
    if (data) setSchoolSettings(data);
  };

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      academic_year: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
      student_nationality: 'Cameroonian',
    }
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
      toast.loading('Generating PDF...', { id: 'pdf' });
      const response = await fetch(`/api/admissions/download/${referenceId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-${referenceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'pdf' });
    }
  };

  const steps = [
    { number: 1, title: 'Student Info', icon: User },
    { number: 2, title: 'Parent Info', icon: Users },
    { number: 3, title: 'Academic Info', icon: GraduationCap },
    { number: 4, title: 'Health & Safety', icon: Heart },
  ];

  const classes = [
    'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5',
    'Lower Sixth', 'Upper Sixth'
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 mb-2">Your Reference ID is:</p>
            <p className="text-3xl font-mono font-bold text-amber-600 mb-6 tracking-wider">
              {referenceId}
            </p>
            <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 mb-2">
                <strong>📋 What happens next?</strong>
              </p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>You will receive a confirmation email shortly</li>
                <li>Our admissions team will review your application within 5 business days</li>
                <li>You will be notified via email about the admission decision</li>
                <li>Keep your reference ID for future correspondence</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all transform hover:scale-105"
              >
                <Download className="w-4 h-4" /> Download Application PDF
              </button>
              <Link
                href="/"
                className="border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
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
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {schoolSettings?.school_logo && (
            <img 
              src={schoolSettings.school_logo} 
              alt="School Logo" 
              className="h-20 mx-auto mb-4"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-2">
            Admission Application
          </h1>
          <p className="text-gray-600">
            {schoolSettings?.school_name || 'St. Bernard Secondary School'} • 
            Academic Year {new Date().getFullYear()}/{new Date().getFullYear() + 1}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex-1 text-center">
                  <div className="relative">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-amber-500 text-white shadow-lg scale-110' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="mt-2">
                      <p className={`text-sm font-semibold ${
                        isActive ? 'text-amber-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ transform: 'translateY(-50%)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-8">
              {/* Step 1: Student Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-3">
                    <h2 className="text-2xl font-serif font-semibold text-slate-800">
                      Student Information
                    </h2>
                    <p className="text-gray-500 text-sm">Please provide the student's personal details</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('student_full_name')}
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="John Mbah Ndumbe"
                        />
                      </div>
                      {errors.student_full_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.student_full_name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('student_dob')}
                          type="date"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      {errors.student_dob && (
                        <p className="text-red-500 text-xs mt-1">{errors.student_dob.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        {...register('student_gender')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <input
                        {...register('student_nationality')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Cameroonian"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Parent/Guardian Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-3">
                    <h2 className="text-2xl font-serif font-semibold text-slate-800">
                      Parent/Guardian Information
                    </h2>
                    <p className="text-gray-500 text-sm">Contact details of parent or legal guardian</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('parent_name')}
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="Paul Ndumbe"
                        />
                      </div>
                      {errors.parent_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.parent_name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('parent_email')}
                          type="email"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="parent@example.com"
                        />
                      </div>
                      {errors.parent_email && (
                        <p className="text-red-500 text-xs mt-1">{errors.parent_email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('parent_phone')}
                          type="tel"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="+237 6XX XXX XXX"
                        />
                      </div>
                      {errors.parent_phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.parent_phone.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                      <input
                        {...register('parent_occupation')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Software Engineer, Doctor, etc."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <textarea
                          {...register('address')}
                          rows={3}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="Full address"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                      <input
                        {...register('emergency_contact_name')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Alternative contact person"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                      <input
                        {...register('emergency_contact_phone')}
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Emergency phone number"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Academic Information */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-3">
                    <h2 className="text-2xl font-serif font-semibold text-slate-800">
                      Academic Information
                    </h2>
                    <p className="text-gray-500 text-sm">Previous education and desired class</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Applying for Class <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          {...register('class_applying')}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="">Select class</option>
                          {classes.map(className => (
                            <option key={className} value={className}>{className}</option>
                          ))}
                        </select>
                      </div>
                      {errors.class_applying && (
                        <p className="text-red-500 text-xs mt-1">{errors.class_applying.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                      <input
                        {...register('academic_year')}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Previous School</label>
                      <div className="relative">
                        <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('previous_school')}
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="Last school attended"
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Previous School Address</label>
                      <textarea
                        {...register('previous_school_address')}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Address of previous school"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Health & Safety */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-3">
                    <h2 className="text-2xl font-serif font-semibold text-slate-800">
                      Health & Safety Information
                    </h2>
                    <p className="text-gray-500 text-sm">Important medical information for student safety</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Confidential Information:</strong> This information will only be used to ensure the safety and well-being of your child while at school.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                      <textarea
                        {...register('medical_conditions')}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Asthma, diabetes, epilepsy, etc. Please specify any medications."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                      <textarea
                        {...register('allergies')}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        placeholder="Food allergies, medication allergies, insect stings, etc."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition ml-auto"
                  >
                    Next →
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 ml-auto disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                    {!submitting && <ArrowRight className="inline ml-2 w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <p className="text-xs text-gray-500 text-center">
                  By submitting this application, you confirm that the information provided is accurate and complete.
                  St. Bernard Secondary School reserves the right to verify the information provided.
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}