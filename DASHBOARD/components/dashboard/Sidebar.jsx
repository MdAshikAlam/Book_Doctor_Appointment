"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  CalendarCheck, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Shield,
  Building2,
  FileCheck,
  Flag,
  GitBranch,
  UserPlus,
  ShieldAlert,
  BarChart3,
  XCircle,
  History,
  Trash2
} from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from '@/context/AuthContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const superAdminSections = [
  {
    title: 'Core',
    items: [
      { icon: LayoutDashboard, label: 'Global Dashboard', href: '/dashboard' },
      { icon: Building2, label: 'Clinics Management', href: '/dashboard/clinics' },
      { icon: Shield, label: 'Admin Management', href: '/dashboard/staff' },
    ]
  },
  {
    title: 'Verification',
    items: [
      { icon: UserPlus, label: 'Admin Requests', href: '/dashboard/admin-requests', category: 'adminRequests' },
      { icon: FileCheck, label: 'Clinic Verification', href: '/dashboard/clinic-verification', category: 'clinicVerification' },
      { icon: FileCheck, label: 'Doctor Verification', href: '/dashboard/doctor-verification', category: 'doctorVerification' },
    ]
  },
  {
    title: 'Management',
    items: [
      { icon: GitBranch, label: 'Branch Management', href: '/dashboard/branches' },
      { icon: Stethoscope, label: 'Doctor Management', href: '/dashboard/doctors' },
      { icon: Shield, label: 'Staff Management', href: '/dashboard/staff' },
      { icon: Users, label: 'Patients Overview', href: '/dashboard/patients' },
    ]
  },
  {
    title: 'Safety',
    items: [
      { icon: Flag, label: 'Reports & Flags', href: '/dashboard/reports' },
      { icon: ShieldAlert, label: 'Block / Suspend', href: '/dashboard/safety' },
      { icon: Trash2, label: 'Trash Bin', href: '/dashboard/trash' },
    ]
  },
  {
    title: 'System',
    items: [
      { icon: Settings, label: 'System Settings', href: '/dashboard/settings' },
      { icon: BarChart3, label: 'Analytics & Logs', href: '/dashboard/analytics' },
    ]
  }
];

const adminSections = [
  {
    title: 'Clinic Operations',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Building2, label: 'Clinic Profile', href: '/dashboard/clinics' },
      { icon: Stethoscope, label: 'Doctors', href: '/dashboard/doctors' },
      { icon: CalendarCheck, label: 'Appointments', href: '/dashboard/appointments' },
      { icon: XCircle, label: 'Cancelled Appt.', href: '/dashboard/appointments/cancelled' },
    ]
  },
  {
    title: 'Staffing & History',
    items: [
      { icon: Shield, label: 'Staff Management', href: '/dashboard/staff' },
      { icon: Users, label: 'Patient History', href: '/dashboard/patients' },
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ]
  }
];

const staffItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CalendarCheck, label: 'Appointments', href: '/dashboard/appointments' },
  { icon: XCircle, label: 'Cancelled Appt.', href: '/dashboard/appointments/cancelled' },
  { icon: Users, label: 'Patient History', href: '/dashboard/patients' },
  { icon: UserRound, label: 'Profile', href: '/dashboard/profile' },
];

import { useEffect } from 'react';
import { analyticsApi } from '@/lib/api';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState({});
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchNotifications();
      // Polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await analyticsApi.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleLinkClick = async (category) => {
    if (category && notifications[category]?.new > 0) {
      try {
        await analyticsApi.markNotified(category);
        setNotifications(prev => ({
          ...prev,
          [category]: { ...prev[category], new: 0 }
        }));
      } catch (err) {
        console.error('Failed to mark notifications as viewed:', err);
      }
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const renderLink = (item, idx) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    const notification = notifications[item.category];
    const showBadge = notification && notification.new > 0;
    
    return (
      <Link
        key={`${item.href}-${idx}`}
        href={item.href}
        onClick={() => handleLinkClick(item.category)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative",
          isActive 
            ? "bg-primary text-white shadow-md shadow-primary/20" 
            : "text-slate-500 hover:bg-slate-50 hover:text-primary"
        )}
      >
        <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="font-medium text-sm whitespace-nowrap overflow-hidden truncate">
              {item.label}
            </span>
            {showBadge && (
              <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full px-1 animate-pulse">
                {notification.total}
              </span>
            )}
          </div>
        )}
        {isCollapsed && (
          <>
            {showBadge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
            <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50">
              {item.label}
              {showBadge && ` (${notification.total})`}
            </div>
          </>
        )}
      </Link>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-border transition-all duration-300 z-40 sidebar-shadow flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Stethoscope size={20} />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              BookMyDoc
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={cn("flex-1 overflow-y-auto p-4 custom-scrollbar", isCollapsed && "pt-6")}>
        {user?.role === 'super_admin' ? (
          <div className="space-y-8">
            {superAdminSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item, iIdx) => renderLink(item, iIdx))}
                </div>
              </div>
            ))}
          </div>
        ) : user?.role === 'admin' ? (
          <div className="space-y-8">
            {adminSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item, iIdx) => renderLink(item, iIdx))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {staffItems.map((item, idx) => renderLink(item, idx))}
          </div>
        )}
      </nav>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-8 -right-3 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Info (Mobile/Compact) */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 leading-none truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 mt-1 capitalize">{user?.role} Account</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
