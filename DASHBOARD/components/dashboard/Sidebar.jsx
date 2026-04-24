"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  CalendarCheck, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Shield
} from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from '@/context/AuthContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['super_admin', 'admin', 'sub_admin', 'doctor', 'patient'] },
  { icon: Shield, label: 'Admins & Staff', href: '/dashboard/staff', roles: ['super_admin', 'admin', 'sub_admin'] },
  { icon: Stethoscope, label: 'Doctors', href: '/dashboard/doctors', roles: ['super_admin', 'admin', 'sub_admin', 'patient'] },
  { icon: Users, label: 'Patients', href: '/dashboard/patients', roles: ['super_admin', 'admin', 'sub_admin', 'doctor'] },
  { icon: CalendarCheck, label: 'Appointments', href: '/dashboard/appointments', roles: ['super_admin', 'admin', 'sub_admin', 'doctor', 'patient'] },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports', roles: ['super_admin', 'admin'] },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['super_admin', 'admin', 'sub_admin', 'doctor', 'patient'] },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-border transition-all duration-300 z-40 sidebar-shadow",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-border">
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
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
              {!isCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
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
