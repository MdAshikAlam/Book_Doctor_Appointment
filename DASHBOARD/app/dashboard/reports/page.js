"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Download, 
  Filter, 
  Loader2, 
  Calendar,
  Building2,
  Stethoscope,
  ChevronRight,
  Sparkles,
  FileCheck2,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Chart from '@/components/dashboard/Chart';
import Table from '@/components/dashboard/Table';
import { motion, AnimatePresence } from 'framer-motion';

// Mock report data to populate the premium visual dashboard
const appointmentVolumeData = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 19 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 },
  { name: 'Fri', count: 30 },
  { name: 'Sat', count: 18 },
  { name: 'Sun', count: 10 }
];

const clinicRevenueData = [
  { name: 'General Medicine', count: 3400 },
  { name: 'Cardiology', count: 5200 },
  { name: 'Pediatrics', count: 2800 },
  { name: 'Orthopedics', count: 4100 },
  { name: 'Dermatology', count: 3100 },
  { name: 'Neurology', count: 6000 }
];

const performanceMetrics = [
  {
    id: 'total-revenue-card',
    title: 'Total Revenue Generated',
    value: '$24,600',
    change: '+14.2%',
    isPositive: true,
    subtitle: 'from last week',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
    icon: DollarSign
  },
  {
    id: 'total-consultations-card',
    title: 'Total Consultations',
    value: '458 Visits',
    change: '+8.4%',
    isPositive: true,
    subtitle: 'vs standard average',
    color: 'bg-blue-500/10 text-blue-600 border-blue-100',
    icon: CalendarCheck
  },
  {
    id: 'new-patients-card',
    title: 'New Registered Patients',
    value: '186 Patients',
    change: '-2.1%',
    isPositive: false,
    subtitle: 'from last month',
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-100',
    icon: Users
  },
  {
    id: 'consultation-efficiency-card',
    title: 'Consultation Efficiency',
    value: '94.8%',
    change: '+3.6%',
    isPositive: true,
    subtitle: 'checked-in conversion',
    color: 'bg-amber-500/10 text-amber-600 border-amber-100',
    icon: BarChart3
  }
];

const clinicalReportsData = [
  { id: 1, name: 'Q2 Clinical Performance Assessment', type: 'Clinical Operations', branch: 'New York Central Branch', date: 'May 15, 2026', size: '4.2 MB', status: 'Generated' },
  { id: 2, name: 'Doctor Consultation Summary (April)', type: 'Financial & Auditing', branch: 'All Branches', date: 'May 02, 2026', size: '2.8 MB', status: 'Archived' },
  { id: 3, name: 'Patient Conversion & Attendance Rate', type: 'Patient Analytics', branch: 'California Bay Area', date: 'April 28, 2026', size: '1.9 MB', status: 'Generated' },
  { id: 4, name: 'Branch Revenue & Expense Sheet', type: 'Financial & Auditing', branch: 'All Branches', date: 'April 15, 2026', size: '6.4 MB', status: 'Generated' },
  { id: 5, name: 'Clinic Bed & Resource Occupancy', type: 'Clinical Operations', branch: 'Boston Medical', date: 'April 04, 2026', size: '3.1 MB', status: 'Archived' }
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('all');
  const [loadingReportId, setLoadingReportId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDownload = (report) => {
    setLoadingReportId(report.id);
    // Simulate generation of premium dynamic clinical reports
    setTimeout(() => {
      setLoadingReportId(null);
      triggerNotification(`Successfully downloaded "${report.name}"!`);
    }, 1500);
  };

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      triggerNotification('Successfully exported clinical performance dashboard to CSV/XLSX!');
    }, 2000);
  };

  const triggerNotification = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredReports = clinicalReportsData.filter(report => {
    if (reportType === 'all') return true;
    return report.type.toLowerCase().includes(reportType.toLowerCase());
  });

  const columns = [
    {
      header: 'Report Title',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{row.name}</p>
            <p className="text-xs text-slate-400 font-semibold">{row.type}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Clinic / Branch Scope',
      accessor: 'branch',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Building2 size={14} className="text-slate-400" />
          {row.branch}
        </div>
      )
    },
    {
      header: 'Generated On',
      accessor: 'date',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar size={14} className="text-slate-400" />
          {row.date}
        </div>
      )
    },
    {
      header: 'Size',
      accessor: 'size',
      render: (row) => (
        <span className="text-xs font-mono font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-100">
          {row.size}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          row.status === 'Generated' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <Button
          id={`download-report-btn-${row.id}`}
          onClick={() => handleDownload(row)}
          variant="outline"
          size="sm"
          className="h-10 rounded-xl font-bold flex items-center gap-2 text-xs group"
          disabled={loadingReportId !== null}
        >
          {loadingReportId === row.id ? (
            <Loader2 size={14} className="animate-spin text-primary" />
          ) : (
            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
          )}
          Download Report
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 font-bold text-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck2 size={16} />
            </div>
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Clinical & Revenue Analytics
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Analyze and generate comprehensive reports for clinic operations and finances.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            id="export-dashboard-btn"
            onClick={handleExportAll}
            disabled={isExporting}
            className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Export Analytics Dashboard
          </Button>
        </div>
      </div>

      {/* Grid: Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              whileHover={{ y: -4 }}
              key={metric.id}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${metric.color}`}>
                  <Icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg border ${
                  metric.isPositive 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {metric.isPositive ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
                  {metric.change}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{metric.title}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{metric.value}</h3>
                <p className="text-slate-400 text-[11px] font-semibold mt-2">{metric.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-6"
          title="Daily Appointment Volume"
          subtitle="Frequency of patient bookings throughout the week"
        >
          <div className="mt-4">
            <Chart type="line" data={appointmentVolumeData} dataKey="count" color="#2563eb" />
          </div>
        </Card>

        <Card 
          className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-6"
          title="Clinical Specialties Revenue"
          subtitle="Comparative revenue generation by clinic specialty"
        >
          <div className="mt-4">
            <Chart type="bar" data={clinicRevenueData} dataKey="count" color="#8b5cf6" />
          </div>
        </Card>
      </div>

      {/* Main Clinical Reports Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 space-y-6">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Detailed Logs & Reports</h3>
            <p className="text-sm text-slate-400 font-medium">Select a category to view and download specific clinical logs.</p>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Reports' },
              { id: 'clinical', label: 'Clinical' },
              { id: 'financial', label: 'Financial' },
              { id: 'patient', label: 'Patient Logs' }
            ].map((tab) => (
              <button
                id={`report-tab-btn-${tab.id}`}
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  reportType === tab.id
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Table component */}
        <div className="overflow-hidden rounded-3xl border border-slate-100">
          <Table 
            columns={columns}
            data={filteredReports}
            emptyMessage="No clinical or financial reports found matching your selection."
          />
        </div>
      </div>
    </div>
  );
}
