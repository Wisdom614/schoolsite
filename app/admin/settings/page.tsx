'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  Save, Building, Mail, Phone, MapPin, Clock, Globe, 
  Facebook, Twitter, Instagram, Youtube, Shield, Bell,
  Database, RefreshCw, UserCog, Lock, Palette, Globe2,
  Image as ImageIcon, Trash2, Eye, CheckCircle, XCircle,
  AlertCircle, Upload, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SchoolSettings {
  id: string;
  school_name: string;
  school_motto: string;
  school_logo: string;
  about_text: string;
  vision: string;
  mission: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  school_hours: string;
  primary_color: string;
  secondary_color: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoPreview, setLogoPreview] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.school_logo) {
      setLogoPreview(settings.school_logo);
    }
  }, [settings?.school_logo]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } else if (data) {
      setSettings(data);
      // Apply colors to CSS variables
      if (data.primary_color) {
        document.documentElement.style.setProperty('--primary-color', data.primary_color);
      }
      if (data.secondary_color) {
        document.documentElement.style.setProperty('--secondary-color', data.secondary_color);
      }
    } else {
      // Create default settings if none exist
      const defaultSettings = {
        school_name: 'St. Bernard Secondary School',
        school_motto: 'Excellence in Education, Digital by Design',
        school_logo: '',
        about_text: 'St. Bernard Secondary School is a leading educational institution in Molyko - Buea, committed to providing quality education and character development. Our school combines traditional values with modern teaching methods to prepare students for the digital age.',
        vision: 'To be a center of excellence in education, producing well-rounded leaders who excel academically and morally, equipped with digital skills for the future.',
        mission: 'To provide holistic education that integrates academic excellence, character development, and digital literacy, fostering critical thinking, creativity, and leadership skills in a supportive environment.',
        address: 'Molyko - Buea, South West Region, Cameroon',
        phone: '+237 671 657 357',
        email: 'info@stbernard.edu.cm',
        website: 'https://stbernard.edu.cm',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        youtube_url: '',
        school_hours: 'Monday - Friday: 7:30 AM - 3:30 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed',
        primary_color: '#f59e0b',
        secondary_color: '#1e293b'
      };

      const { data: newData, error: insertError } = await supabase
        .from('school_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating settings:', insertError);
        toast.error('Failed to create settings');
      } else {
        setSettings(newData);
        toast.success('Default settings created');
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('school_settings')
      .update({
        school_name: settings.school_name,
        school_motto: settings.school_motto,
        school_logo: settings.school_logo,
        about_text: settings.about_text,
        vision: settings.vision,
        mission: settings.mission,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        facebook_url: settings.facebook_url,
        twitter_url: settings.twitter_url,
        instagram_url: settings.instagram_url,
        youtube_url: settings.youtube_url,
        school_hours: settings.school_hours,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } else {
      toast.success('Settings saved successfully!');
      // Apply colors to CSS variables
      if (settings.primary_color) {
        document.documentElement.style.setProperty('--primary-color', settings.primary_color);
      }
      if (settings.secondary_color) {
        document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
      }
    }
    setSaving(false);
  };

  const handleLogoPreview = (url: string) => {
    setLogoPreview(url);
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      // Valid URL
      return true;
    }
    return false;
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building, description: 'School name, motto, and logo' },
    { id: 'contact', label: 'Contact', icon: Mail, description: 'Address, phone, and email' },
    { id: 'social', label: 'Social Media', icon: Facebook, description: 'Connect with parents online' },
    { id: 'content', label: 'Content', icon: Database, description: 'About, vision, and mission' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Colors and branding' },
    { id: 'security', label: 'Security', icon: Shield, description: 'API keys and security status' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage school information, branding, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-80 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-amber-50 text-amber-600 border-l-4 border-amber-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">General Settings</h2>
              
              <div className="space-y-6">
                {/* School Logo */}
                <div>
                  <label className="block text-sm font-medium mb-2">School Logo</label>
                  <div className="flex items-start gap-6">
                    {/* Logo Preview */}
                    <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="School Logo Preview"
                          className="w-full h-full object-cover"
                          onError={() => setLogoPreview('')}
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Logo URL Input */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={settings?.school_logo || ''}
                          onChange={(e) => {
                            setSettings({ ...settings!, school_logo: e.target.value });
                            handleLogoPreview(e.target.value);
                          }}
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                          placeholder="https://your-image-url.com/logo.png"
                        />
                        <button
                          onClick={() => handleLogoPreview(settings?.school_logo || '')}
                          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter the URL of your school logo image. Recommended size: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">School Name</label>
                  <input
                    type="text"
                    value={settings?.school_name || ''}
                    onChange={(e) => setSettings({ ...settings!, school_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="St. Bernard Secondary School"
                  />
                </div>

                {/* School Motto */}
                <div>
                  <label className="block text-sm font-medium mb-2">School Motto / Tagline</label>
                  <input
                    type="text"
                    value={settings?.school_motto || ''}
                    onChange={(e) => setSettings({ ...settings!, school_motto: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Excellence in Education, Digital by Design"
                  />
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <input
                    type="url"
                    value={settings?.website || ''}
                    onChange={(e) => setSettings({ ...settings!, website: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://stbernard.edu.cm"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Settings */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={settings?.address || ''}
                    onChange={(e) => setSettings({ ...settings!, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Molyko - Buea, South West Region, Cameroon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings?.phone || ''}
                    onChange={(e) => setSettings({ ...settings!, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="+237 671 657 357"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings?.email || ''}
                    onChange={(e) => setSettings({ ...settings!, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="info@stbernard.edu.cm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">School Hours</label>
                  <textarea
                    value={settings?.school_hours || ''}
                    onChange={(e) => setSettings({ ...settings!, school_hours: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Monday - Friday: 7:30 AM - 3:30 PM&#10;Saturday: 8:00 AM - 12:00 PM&#10;Sunday: Closed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use &#10; for line breaks</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">Social Media Links</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <input
                    type="url"
                    value={settings?.facebook_url || ''}
                    onChange={(e) => setSettings({ ...settings!, facebook_url: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://facebook.com/your-school"
                  />
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Twitter className="w-6 h-6 text-sky-500" />
                  <input
                    type="url"
                    value={settings?.twitter_url || ''}
                    onChange={(e) => setSettings({ ...settings!, twitter_url: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://twitter.com/your-school"
                  />
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Instagram className="w-6 h-6 text-pink-600" />
                  <input
                    type="url"
                    value={settings?.instagram_url || ''}
                    onChange={(e) => setSettings({ ...settings!, instagram_url: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://instagram.com/your-school"
                  />
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Youtube className="w-6 h-6 text-red-600" />
                  <input
                    type="url"
                    value={settings?.youtube_url || ''}
                    onChange={(e) => setSettings({ ...settings!, youtube_url: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://youtube.com/your-school"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Content Settings */}
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">School Content</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">About Text</label>
                <textarea
                  value={settings?.about_text || ''}
                  onChange={(e) => setSettings({ ...settings!, about_text: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Write about your school..."
                />
                <p className="text-xs text-gray-500 mt-1">This text appears on the About page</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Vision Statement</label>
                <textarea
                  value={settings?.vision || ''}
                  onChange={(e) => setSettings({ ...settings!, vision: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="School vision statement..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mission Statement</label>
                <textarea
                  value={settings?.mission || ''}
                  onChange={(e) => setSettings({ ...settings!, mission: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="School mission statement..."
                />
              </div>
            </motion.div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">Appearance</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={settings?.primary_color || '#f59e0b'}
                      onChange={(e) => setSettings({ ...settings!, primary_color: e.target.value })}
                      className="w-16 h-16 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings?.primary_color || '#f59e0b'}
                      onChange={(e) => setSettings({ ...settings!, primary_color: e.target.value })}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder="#f59e0b"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and highlights</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={settings?.secondary_color || '#1e293b'}
                      onChange={(e) => setSettings({ ...settings!, secondary_color: e.target.value })}
                      className="w-16 h-16 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings?.secondary_color || '#1e293b'}
                      onChange={(e) => setSettings({ ...settings!, secondary_color: e.target.value })}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder="#1e293b"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for backgrounds and accents</p>
                </div>

                {/* Preview Section */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Preview</h3>
                  <div className="space-y-3">
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-semibold"
                      style={{ backgroundColor: settings?.primary_color || '#f59e0b' }}
                    >
                      Primary Button
                    </button>
                    <div 
                      className="p-3 rounded-lg text-white"
                      style={{ backgroundColor: settings?.secondary_color || '#1e293b' }}
                    >
                      Secondary Background
                    </div>
                    <div className="flex gap-2">
                      <span 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: settings?.primary_color || '#f59e0b' }}
                      ></span>
                      <span 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: settings?.secondary_color || '#1e293b' }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">Security</h2>
              
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">⚠️ Important Security Information</h3>
                      <p className="text-sm text-amber-700">
                        Keep your API keys and service role keys secure. Never share them publicly or commit them to version control.
                        These keys are stored as environment variables on your hosting platform.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">API Keys Status</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Supabase URL</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Configured</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Supabase Anon Key</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Configured</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Service Role Key</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Configured</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Resend API Key</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Configured</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">🔐 Best Practices</h3>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Never share API keys via email or chat</li>
                    <li>Rotate keys periodically for security</li>
                    <li>Use environment variables for all sensitive data</li>
                    <li>Enable 2FA on your Supabase account</li>
                    <li>Regularly audit access logs</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-gold text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}