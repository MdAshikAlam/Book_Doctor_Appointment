"use client"

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  Building2, 
  Stethoscope,
  Users,
  CreditCard,
  Mail,
  XCircle,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export default function NotificationsPage() {
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load mock notifications mapped directly to the requested alerts
  const loadNotifications = () => {
    setLoading(true);
    const mock = [
      {
        id: 1,
        title: 'New Clinic Admin Registered',
        details: 'Proposed clinic "HealthFirst Dental" has submitted a new application.',
        category: 'registration',
        time: '5 minutes ago',
        read: false,
        icon: Building2,
        color: 'text-blue-500 bg-blue-50'
      },
      {
        id: 2,
        title: 'New Doctor Profile Submitted',
        details: 'Dr. Arthur Pendelton has uploaded licensing docs for verification.',
        category: 'doctor',
        time: '12 minutes ago',
        read: false,
        icon: Stethoscope,
        color: 'text-indigo-500 bg-indigo-50'
      },
      {
        id: 3,
        title: 'KYC Document Pending Audit',
        details: 'Verification files for "CarePlus Specialty" clinic require super admin signature.',
        category: 'kyc',
        time: '1 hour ago',
        read: false,
        icon: FileCheck,
        color: 'text-emerald-500 bg-emerald-50'
      },
      {
        id: 4,
        title: 'Support Ticket #1024 Raised',
        details: 'Patient reported doctor calendar sync issue on clinic "SmileDent".',
        category: 'support',
        time: '3 hours ago',
        read: true,
        icon: Mail,
        color: 'text-amber-500 bg-amber-50'
      },
      {
        id: 5,
        title: 'Branch Operations Suspended',
        details: 'Proposed suspension of "Metro Eye Center" has been logged.',
        category: 'safety',
        time: 'Yesterday',
        read: true,
        icon: XCircle,
        color: 'text-red-500 bg-red-50'
      },
      {
        id: 6,
        title: 'Subscription Payment Failed',
        details: 'Razorpay reported invoice #9812 unpaid for "Gastro Clinic".',
        category: 'payment',
        time: '2 days ago',
        read: true,
        icon: CreditCard,
        color: 'text-rose-500 bg-rose-50'
      }
    ];
    setNotifications(mock);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      loadNotifications();
    }
  }, [currentUser]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can access the Notifications Center.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Bell className="text-blue-600" size={32} /> Notifications Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium">System updates, validation logs, failed payments, and ticket queues.</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllRead}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-2"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm p-8">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 className="mx-auto text-slate-200 mb-4" size={40} />
            <p className="font-bold text-slate-400">All caught up! No recent notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div 
                  key={n.id} 
                  onClick={() => handleToggleRead(n.id)}
                  className={`flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                    n.read 
                      ? 'bg-white border-slate-100 hover:bg-slate-50/50' 
                      : 'bg-blue-50/20 border-blue-100/50 hover:bg-blue-50/40 shadow-sm shadow-blue-50/20'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`text-sm font-black text-slate-900 leading-snug ${!n.read && 'text-blue-900'}`}>{n.title}</h3>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{n.details}</p>
                    
                    {!n.read && (
                      <span className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[9px] font-black uppercase tracking-wider">
                        New Alert
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
