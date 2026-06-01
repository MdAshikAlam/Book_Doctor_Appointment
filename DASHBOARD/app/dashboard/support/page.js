"use client"

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  Clock,
  User,
  Inbox,
  Filter
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

export default function SupportCenterPage() {
  const { user: currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Fetch contact form submissions from the contacts API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/contacts`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        // Map to support ticket object
        const mapped = (data.data.contacts || []).map((c, i) => ({
          id: c._id || i,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          category: c.category || 'General Enquiry',
          subject: c.subject,
          message: c.message,
          createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
          status: i % 3 === 0 ? 'Resolved' : i % 3 === 1 ? 'Escalated' : 'Open'
        }));
        setTickets(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch contact support items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchTickets();
    }
  }, [currentUser]);

  const handleUpdateStatus = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    setSuccessMsg(`Ticket status updated to ${newStatus}`);
    setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseMsg) return;

    try {
      setIsSending(true);
      // Mock API call to respond to ticket
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMsg('Response sent successfully to ' + selectedTicket.email);
      setResponseMsg('');
      handleUpdateStatus(selectedTicket.id, 'Resolved');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to send response');
    } finally {
      setIsSending(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && t.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can access the Support Desk.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Inbox className="text-blue-600" size={32} /> Support Center
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage patient complaints, clinic inquiries, disputes, and escalated tickets.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-650 font-bold border border-emerald-100 rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tickets by name, subject, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto w-full md:w-auto">
          {['all', 'open', 'escalated', 'resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === tab 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 animate-pulse h-64"></div>
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
            <CheckCircle2 className="mx-auto text-slate-350 mb-4" size={40} />
            <p className="font-bold text-slate-500">Inbox clear! No active support cases found.</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div 
              key={t.id} 
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    t.status === 'Escalated' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock size={12} /> {t.createdAt}
                  </span>
                </div>
                
                <h3 className="font-black text-slate-900 truncate text-base leading-snug">{t.subject}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{t.category}</p>
                <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium line-clamp-3">
                  "{t.message}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-650 flex items-center justify-center font-bold text-xs">
                    {t.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden max-w-[120px]">
                    <p className="text-xs font-bold text-slate-805 truncate">{t.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{t.email}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedTicket(t)}
                  className="h-10 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Manage Ticket
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Respond Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Manage Support Ticket"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6 py-2">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{selectedTicket.category}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  selectedTicket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  selectedTicket.status === 'Escalated' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                "{selectedTicket.message}"
              </p>
              
              <div className="pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Applicant</p>
                  <p className="text-slate-805 font-bold mt-0.5">{selectedTicket.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Email / Phone</p>
                  <p className="text-slate-805 font-bold mt-0.5">{selectedTicket.email} / {selectedTicket.phone}</p>
                </div>
              </div>
            </div>

            {selectedTicket.status !== 'Resolved' && (
              <form onSubmit={handleRespond} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Send Response Email</label>
                  <textarea 
                    value={responseMsg}
                    onChange={(e) => setResponseMsg(e.target.value)}
                    placeholder="Write response details to email to user..."
                    className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium resize-none text-sm"
                    required
                  />
                </div>
                
                <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'Escalated')}
                      className="h-12 border-rose-100 text-rose-500 hover:bg-rose-50 font-bold rounded-xl"
                    >
                      Escalate Case
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'Resolved')}
                      className="h-12 border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl"
                    >
                      Mark Resolved
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isSending}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 flex items-center justify-center gap-2"
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : 'Send Reply'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
