"use client";

import { useState } from 'react';
import { 
  Mail, 
  ShieldAlert, 
  Globe, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight,
  Send
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid = 
    formData.fullName.trim() && 
    formData.email.trim() && 
    formData.phone.trim() && 
    formData.message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* Page Header / Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFD] via-[#F6FCFC] to-white pt-36 pb-24 border-b border-slate-100">
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00B5B5]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#00B5B5]/20 text-[#00B5B5] text-sm font-bold shadow-sm shadow-slate-100/50 mb-8">
              <Globe className="w-4 h-4 text-[#00B5B5]" />
              <span className="tracking-wide uppercase text-xs">24/7 Global Assistance</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
              Connect With Our <br className="hidden sm:inline" />
              <span className="relative inline-block px-2 text-[#00B5B5] italic">
                Global Care Team
                <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#00B5B5]/10 -skew-x-12 rounded-full"></span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
              We&apos;re here to assist you with scheduling questions, portal queries, and custom healthcare alignments. Find options to contact our support desks around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Main Support Grid */}
      <section className="py-24 bg-white relative z-20 -mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Form Card */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              {isSubmitted ? (
                <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">Message Dispatched</h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto mb-8 text-sm">
                    Thank you, {formData.fullName}. Your request has been assigned to our patient relations department. A consultant will review your ticket and respond within 12 hours.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ fullName: '', email: '', phone: '', message: '' });
                    }}
                    className="inline-flex items-center gap-2 text-[#00B5B5] font-black hover:underline text-sm uppercase tracking-wider"
                  >
                    Send Another Message
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-[#00B5B5]/10 rounded-xl flex items-center justify-center text-[#00B5B5]">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Send us a Message</h2>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Email Address</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Message Description</label>
                      <textarea 
                        required
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 h-40 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800 resize-none leading-relaxed" 
                        placeholder="Please describe how we can assist you..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={!isFormValid}
                      className="w-full bg-gradient-to-r from-[#00B5B5] to-[#008F8F] hover:from-[#009A9A] hover:to-[#007C7C] text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-[#00B5B5]/20 hover:shadow-2xl hover:shadow-[#00B5B5]/25 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:opacity-75 flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Right Column: Contact info & Locations */}
            <div className="space-y-10">
              
              {/* Direct Lines */}
              <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-[#00B5B5]" />
                  Direct Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Support Desk</p>
                    <a href="mailto:hello@bookmydoctor.com" className="text-sm font-extrabold text-[#00B5B5] hover:underline">hello@bookmydoctor.com</a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sales & Partnerships</p>
                    <a href="mailto:sales@bookmydoctor.com" className="text-sm font-extrabold text-[#00B5B5] hover:underline">sales@bookmydoctor.com</a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Emergency Helpline</p>
                    <a href="tel:+18003628670" className="text-sm font-extrabold text-slate-800 hover:text-[#00B5B5]">+1 (800) DOCTOR-0</a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Average Response Time</p>
                    <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      &lt; 12 Hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Global Support Hubs */}
              <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-[#00B5B5]" />
                  Global Presence
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0 font-bold text-xs border border-slate-100">US</div>
                    <div>
                      <h4 className="font-extrabold text-slate-850 text-sm">North America Headquarters</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">123 Healthcare Way, Medical District, New York, NY 10001</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0 font-bold text-xs border border-slate-100">EU</div>
                    <div>
                      <h4 className="font-extrabold text-slate-850 text-sm">Europe Operations Hub</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">45 Clinical Court, Finsbury, London, EC2A 1PX</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0 font-bold text-xs border border-slate-100">AS</div>
                    <div>
                      <h4 className="font-extrabold text-slate-850 text-sm">Asia-Pacific Center</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">88 Biopolis Drive, Synapse Building, Singapore 138648</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Advisory */}
              <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100/50 flex gap-4 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 rounded-full blur-2xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-red-100/40 text-red-650 flex items-center justify-center shrink-0">
                  <ShieldAlert size={22} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-red-700 uppercase tracking-wider mb-1">Emergency Warning</h4>
                  <p className="text-xs text-red-600/80 font-semibold leading-relaxed">
                    If you are experiencing a life-threatening medical situation or extreme health emergency, please immediately contact 911 (or your local emergency response line) or proceed to the closest hospital emergency department.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
