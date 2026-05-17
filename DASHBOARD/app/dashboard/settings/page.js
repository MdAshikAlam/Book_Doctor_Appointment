"use client"

import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Bell, 
  ShieldAlert, 
  HelpCircle, 
  Loader2, 
  Save, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Volume2, 
  Mail, 
  Phone,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('clinic');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Clinic profile form states
  const [clinicForm, setClinicForm] = useState({
    clinicName: 'New York Central Medical Clinic',
    emergencyPhone: '+1 (555) 019-2834',
    generalEmail: 'contact@centralmedical.com',
    capacity: '120 Patients / Hour',
    operatingHours: '08:00 AM - 08:00 PM',
    address: '450 Fifth Avenue, Suite 1200, New York, NY 10018'
  });

  // Settings & Toggles states
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    soundAlerts: false,
    autoLogout: '30m'
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  const tabs = [
    { id: 'clinic', label: 'Clinic Information', icon: Building2 },
    { id: 'notifications', label: 'Alerts & System Preferences', icon: Bell },
    { id: 'security', label: 'Security & Access Control', icon: Lock }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 font-bold text-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>System configurations updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            System & Clinic Settings
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Configure global clinic settings, operational boundaries, and system preferences.</p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Side Tab Navigation */}
        <div className="xl:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`settings-tab-btn-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all text-left font-bold text-sm ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="flex-1">{tab.label}</span>
                {isActive && <ArrowRight size={14} className="text-white/70" />}
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="xl:col-span-3">
          <form onSubmit={handleSaveSettings}>
            <AnimatePresence mode="wait">
              {activeTab === 'clinic' && (
                <motion.div
                  key="clinic-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">Clinic Profile</h3>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">Modify administrative details visible to doctor schedules and patient receipts.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Clinic Name"
                      value={clinicForm.clinicName}
                      onChange={(e) => setClinicForm({...clinicForm, clinicName: e.target.value})}
                      required
                    />
                    <Input 
                      label="Emergency Hotline"
                      value={clinicForm.emergencyPhone}
                      onChange={(e) => setClinicForm({...clinicForm, emergencyPhone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="General Clinical Email"
                      value={clinicForm.generalEmail}
                      onChange={(e) => setClinicForm({...clinicForm, generalEmail: e.target.value})}
                      required
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Daily Capacity Limit</label>
                      <input 
                        type="text"
                        value={clinicForm.capacity}
                        onChange={(e) => setClinicForm({...clinicForm, capacity: e.target.value})}
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Operating Hours</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text"
                          value={clinicForm.operatingHours}
                          onChange={(e) => setClinicForm({...clinicForm, operatingHours: e.target.value})}
                          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Clinic Physical Address</label>
                      <textarea 
                        value={clinicForm.address}
                        onChange={(e) => setClinicForm({...clinicForm, address: e.target.value})}
                        rows="3"
                        className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button 
                      id="save-clinic-settings-btn"
                      type="submit" 
                      disabled={isSaving}
                      className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Configurations
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">System Preferences</h3>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">Configure how the dashboard handles system-level updates and audio-visual alerts.</p>
                  </div>

                  {/* Toggle items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="flex gap-3">
                        <Mail className="text-slate-400 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Email Alerts on Check-in</p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Send a quick confirmation email when receptionists mark a patient as checked-in.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.emailAlerts}
                        onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                        className="w-10 h-6 bg-slate-200 checked:bg-slate-900 rounded-full appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:left-5 before:transition-all cursor-pointer border border-transparent checked:bg-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="flex gap-3">
                        <Phone className="text-slate-400 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">SMS Notification Alerts</p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Notify patients via SMS automatically 1 hour prior to their scheduled slot.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.smsAlerts}
                        onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                        className="w-10 h-6 bg-slate-200 checked:bg-slate-900 rounded-full appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:left-5 before:transition-all cursor-pointer border border-transparent checked:bg-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="flex gap-3">
                        <Volume2 className="text-slate-400 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Queue Sound Alerts</p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Play a soft notification ringtone when a new patient enters the branch queue.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.soundAlerts}
                        onChange={(e) => setNotifications({...notifications, soundAlerts: e.target.checked})}
                        className="w-10 h-6 bg-slate-200 checked:bg-slate-900 rounded-full appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 checked:before:left-5 before:transition-all cursor-pointer border border-transparent checked:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Auto-Logout Idle Sessions</label>
                    <select 
                      value={notifications.autoLogout}
                      onChange={(e) => setNotifications({...notifications, autoLogout: e.target.value})}
                      className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
                    >
                      <option value="15m">15 Minutes of Inactivity</option>
                      <option value="30m">30 Minutes of Inactivity</option>
                      <option value="1h">1 Hour of Inactivity</option>
                      <option value="never">Never Log Out Automatically</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button 
                      id="save-notifications-settings-btn"
                      type="submit" 
                      disabled={isSaving}
                      className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Preferences
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-950">Security Boundaries</h3>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">Control administrative access layers, IP restriction blocks, and system logs.</p>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <h4 className="text-rose-950 font-bold text-base">Restricted Area Settings</h4>
                      <p className="text-rose-700 text-xs font-semibold leading-relaxed mt-1">
                        Only active clinical personnel under authenticated branches are permitted to download decrypted medical history documents. Ensure branch synchronization profiles are correctly matched to maintain HIPAA compliance.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Enforce Multi-Factor Authentication</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Force all receptionist and doctor staff accounts to verify login via phone SMS.</p>
                      </div>
                      <span className="text-xs font-black text-slate-400 bg-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">Super Admin Config Only</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Restrict Login to Branch IPs</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Only allow logins from designated clinic router IPs to safeguard records.</p>
                      </div>
                      <span className="text-xs font-black text-slate-400 bg-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">Super Admin Config Only</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
