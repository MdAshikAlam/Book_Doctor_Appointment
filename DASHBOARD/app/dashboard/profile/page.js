"use client"

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Edit3, 
  Settings as SettingsIcon, 
  Lock,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Header / Hero Section */}
        <section className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 to-blue-400 p-1">
                <div className="w-full h-full rounded-[1.4rem] bg-white flex items-center justify-center text-4xl font-extrabold text-blue-600">
                  {getInitials(user?.name)}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 cursor-pointer hover:scale-105 transition-transform">
                <Edit3 size={18} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  {user?.role} Account
                </span>
              </div>
              <p className="text-slate-500 font-medium max-w-lg">
                Manage your personal information, account security, and professional credentials all in one place.
              </p>
            </div>

            <Link 
              href="/dashboard/profile/edit"
              className="px-6 h-12 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <SettingsIcon size={18} /> Edit Profile
            </Link>
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <User className="text-blue-600" size={24} />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Full Name</p>
                  <p className="text-slate-900 font-bold">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-slate-900 font-bold">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-slate-900 font-bold">{user?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Member Since</p>
                  <p className="text-slate-900 font-bold">April 2026</p>
                </div>
              </div>
            </motion.div>

            {/* Role & Permissions (The requested section) */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  Role & Access Control
                </h2>
                {user?.role === 'admin' && (
                  <button className="text-xs font-bold text-blue-600 hover:underline">Manage Permissions</button>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500 text-white">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900">Active Permissions: {user?.role?.toUpperCase()}</h3>
                    <p className="text-sm text-emerald-700 mt-1">
                      You have {user?.role === 'admin' ? 'full administrative access' : 'professional medical access'} to the BookMyDoc ecosystem.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Dashboard Analytics", status: "Access Granted", icon: CheckCircle2 },
                  { label: "Patient Records", status: "Access Granted", icon: CheckCircle2 },
                  { label: "Financial Reports", status: user?.role === 'admin' ? "Access Granted" : "Restricted", icon: user?.role === 'admin' ? CheckCircle2 : Lock },
                  { label: "System Configuration", status: user?.role === 'admin' ? "Access Granted" : "Restricted", icon: user?.role === 'admin' ? CheckCircle2 : Lock },
                ].map((perm, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-slate-700 text-sm">{perm.label}</span>
                    <div className={cn(
                      "flex items-center gap-2 text-xs font-bold",
                      perm.status === "Access Granted" ? "text-emerald-600" : "text-slate-400"
                    )}>
                      <perm.icon size={14} />
                      {perm.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Account Security Card */}
            <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Lock className="text-blue-400" size={24} />
                Security
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10 text-white">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Two-Factor Auth</p>
                      <p className="text-sm font-bold">Enabled</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10 text-white">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Last Login</p>
                      <p className="text-sm font-bold">2 mins ago</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>
                <button className="w-full h-12 mt-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-700 transition-all text-sm">
                  Change Password
                </button>
              </div>
            </motion.div>

            {/* Support Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Need Help?</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Our support team is available 24/7 to help you with any issues regarding your account or permissions.
              </p>
              <button className="w-full h-12 rounded-xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all text-sm">
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
