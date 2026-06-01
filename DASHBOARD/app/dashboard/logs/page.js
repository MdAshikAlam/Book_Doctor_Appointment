"use client"

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  ShieldAlert, 
  Loader2, 
  Calendar,
  Laptop,
  Globe,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export default function AuditLogsPage() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getActivityLogs();
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchLogs();
    }
  }, [currentUser]);

  // Export CSV helper
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address', 'Device'];
    const rows = logs.map(l => [
      l.createdAt ? new Date(l.createdAt).toLocaleString() : 'N/A',
      l.user?.email || 'System',
      l.action,
      l.entityType,
      l.details,
      l.ipAddress || '127.0.0.1',
      l.userAgent || 'Server Process'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueEntities = Array.from(new Set(logs.map(l => l.entityType)));

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can audit activity logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <History className="text-blue-600" size={32} /> System Audit Logs
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Trace security logins, record deletions, role changes, and admin approvals.</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="h-12 bg-emerald-600 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-emerald-700 shadow-md"
        >
          <FileSpreadsheet size={18} /> Export Log Sheet (CSV)
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search logs by email, action, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>

        <div className="relative">
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm cursor-pointer"
          >
            <option value="all">All Action Types</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select 
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm cursor-pointer"
          >
            <option value="all">All Entity Focus Areas</option>
            {uniqueEntities.map(ent => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Trigger User</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Action Type</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Entity</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Message Details</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">IP / Client Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">No activity logs recorded.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors text-xs">
                    <td className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{log.user?.name || 'System'}</p>
                      <p className="text-[10px] text-slate-400">{log.user?.email || 'Automated Cron'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-black text-[9px] uppercase border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-500 whitespace-nowrap">
                      {log.entityType}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Globe size={12} className="text-slate-350" /> {log.ipAddress || '127.0.0.1'}</span>
                        <span className="text-[9px] text-slate-400 max-w-[150px] truncate" title={log.userAgent}><Laptop size={10} className="inline mr-1" /> {log.userAgent || 'Chrome / Windows'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
