'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function DataManagement() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const supabase = createClient();

  const exportData = async (format: 'excel' | 'csv') => {
    setExporting(true);
    const { data: students } = await supabase
      .from('admissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(students);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, `students_${new Date().toISOString()}.xlsx`);
      toast.success('Exported to Excel');
    } else {
      const csv = Papa.unparse(students);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported to CSV');
    }
    setExporting(false);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        let success = 0;
        let failed = 0;

        for (const row of results.data) {
          if (row.student_full_name && row.parent_name && row.parent_email) {
            const { error } = await supabase.from('admissions').insert([{
              ...row,
              status: row.status || 'pending',
              submitted_at: new Date().toISOString()
            }]);
            
            if (error) failed++;
            else success++;
          } else {
            failed++;
          }
        }
        
        toast.success(`Imported ${success} records, ${failed} failed`);
        setImporting(false);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800">Data Management</h1>
        <p className="text-gray-600 mt-2">Import and export student application data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Export Data</h2>
              <p className="text-sm text-gray-500">Download student data in various formats</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => exportData('excel')}
              disabled={exporting}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <span>Microsoft Excel (.xlsx)</span>
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </button>
            <button
              onClick={() => exportData('csv')}
              disabled={exporting}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <span>CSV File (.csv)</span>
              <Download className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Import Data</h2>
              <p className="text-sm text-gray-500">Bulk upload student applications</p>
            </div>
          </div>
          
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 transition">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload CSV or Excel file</p>
              <p className="text-xs text-gray-400 mt-1">Supported: .csv, .xlsx</p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={importData}
              disabled={importing}
              className="hidden"
            />
          </label>
          
          {importing && (
            <div className="mt-4 text-center text-sm text-amber-600">
              Importing... Please wait
            </div>
          )}
        </div>
      </div>

      {/* Template Download */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 CSV Template Format</h3>
        <p className="text-sm text-blue-700 mb-2">Required columns for import:</p>
        <code className="text-xs bg-white p-2 rounded block">
          student_full_name, student_dob, parent_name, parent_email, parent_phone, class_applying, address, previous_school
        </code>
        <button
          onClick={() => {
            const template = [{
              student_full_name: 'John Doe',
              student_dob: '2010-01-01',
              parent_name: 'Jane Doe',
              parent_email: 'parent@example.com',
              parent_phone: '+237600000000',
              class_applying: 'Form 1',
              address: 'Molyko, Buea',
              previous_school: 'Previous School Name'
            }];
            const csv = Papa.unparse(template);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="mt-3 text-sm text-blue-600 underline"
        >
          Download Template CSV
        </button>
      </div>
    </div>
  );
}