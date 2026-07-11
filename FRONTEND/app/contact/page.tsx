"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Calendar, 
  UserCheck, 
  Building2, 
  HelpCircle, 
  Settings, 
  Users, 
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// Import global UI components
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    category: 'Appointment Support',
    message: ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  // Track whether a field has been visited (blurred) to control when to show errors
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    subject: false,
    message: false
  });
  // Loading indicator during form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Success modal visibility
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Router for navigation
  const router = useRouter();

  // Helper to capitalize each word's first letter
  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  // Validation helpers
  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        else if (value.trim().length > 40) error = 'Name cannot exceed 40 characters';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (value.trim().length > 60) error = 'Email cannot exceed 60 characters';
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone is required';
        else if (!/^\+?\d+$/.test(value)) error = 'Phone must contain only digits and optional leading +';
        break;
      case 'subject':
        if (!value.trim()) error = 'Subject is required';
        else if (value.trim().length < 3) error = 'Subject must be at least 3 characters';
        else if (value.trim().length > 100) error = 'Subject cannot exceed 100 characters';
        break;
      case 'message':
        if (!value.trim()) error = 'Message is required';
        else if (value.trim().length < 10) error = 'Message must be at least 10 characters';
        else if (value.trim().length > 500) error = 'Message cannot exceed 500 characters';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };
  

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const isFormValid =
    !errors.fullName &&
    !errors.email &&
    !errors.phone &&
    !errors.subject &&
    !errors.message &&
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.subject.trim() &&
    formData.message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to submit');
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Contact submission error:', error);
      // Optionally display an error to the user
      alert('There was an error submitting the form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqData = [
    {
      q: "How do I book an appointment?",
      a: "Select your location and browse specialists or clinics based on your needs. Click on a doctor's profile to view their available slots and confirm your appointment instantly."
    },
    {
      q: "How can I cancel or reschedule an appointment?",
      a: "Navigate to the 'My Appointments' page from your dashboard or profile menu. Find your booking and choose the cancel or reschedule option to select a new slot."
    },
    {
      q: "How can doctors join BookMyDoctor?",
      a: "Doctors can start onboarding by selecting 'Doctor Registration' in the contact form categories, or directly reaching out to partners@example.com to begin profile verification."
    },
    {
      q: "How can clinics register?",
      a: "Clinics can register by choosing 'Clinic Registration' in the contact form or sending clinic details to partners@example.com. Our partner team will help set up your facilities."
    },
    {
      q: "How long does support take to respond?",
      a: "Our support team typically responds to all general, technical, and onboarding inquiries within 24 hours during working hours (Monday to Saturday)."
    },
    {
      q: "How do I report a technical issue?",
      a: "Use our contact form, select 'Technical Issue' from the category dropdown, describe the issue you are facing in detail, and our technical support team will address it."
    }
  ];

  return (
    <div className="bg-white min-h-screen relative overflow-hidden">

      {/* SUCCESS MODAL OVERLAY - shown on top of page after submit */}
      {isSubmitted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 relative border border-slate-100" style={{ animation: 'fadeScaleIn 0.25s ease' }}>
            {/* Close X button */}
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ fullName: '', email: '', phone: '', subject: '', category: 'Appointment Support', message: '' });
                setTouched({ fullName: false, email: false, phone: false, subject: false, message: false });
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Animated check icon */}
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="font-h3 text-slate-900 mb-3">Request Submitted!</h3>
              <p className="font-body-secondary text-slate-500 mb-8">
                Thank you for contacting BookMyDoctor. Our support team will review your request and respond within 24 hours.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ fullName: '', email: '', phone: '', subject: '', category: 'Appointment Support', message: '' });
                    setTouched({ fullName: false, email: false, phone: false, subject: false, message: false });
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition"
                >
                  Back to Form
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#00B5B5] text-white font-bold text-sm hover:bg-[#009999] transition"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeScaleIn {
              from { opacity: 0; transform: scale(0.92); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFD] via-[#F6FCFC] to-white pt-10 pb-16 border-b border-slate-100"> {/* Navbar -> Hero = 40px */}
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00B5B5]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

        <Container className="relative z-10 text-center">
          {/* Main Title */}
          <h1 className="font-h1 text-slate-900 mb-6">
            We&apos;re Here to Help
          </h1>

          {/* Subtitle */}
          <p className="font-body-primary text-slate-500 mx-auto mb-8">
            Need assistance with appointments, finding nearby doctors, clinic registration, or general questions? Our team is ready to help.
          </p>

          {/* Quick Support Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
            {[
              { label: "Appointment Support", emoji: "📅" },
              { label: "Doctor Registration", emoji: "👨‍⚕️" },
              { label: "Clinic Registration", emoji: "🏥" },
              { label: "General Enquiries", emoji: "💬" }
            ].map((tag, i) => (
              <div key={i} className="px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 2 & 3: FORM AND SUPPORT CHANNELS */}
      <Section className="bg-white relative z-20 -mt-10">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* CONTACT FORM */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <>
                <div className="mb-8">
                  <h3 className="font-h3 text-slate-900 mb-2">Send Us a Message</h3>
                  <p className="font-body-secondary text-slate-400">Have a question or need assistance? Fill out the form below and our team will get back to you.</p>
                </div>

                  <form id="contact-form" className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Full Name <span className="text-red-600">*</span></label>
                      <input 
                        type="text" 
                        required
                        maxLength={40}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => {
                          const val = e.target.value;
                          const capitalized = capitalizeWords(val);
                          setFormData({ ...formData, fullName: capitalized });
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, fullName: true }));
                          validateField('fullName', formData.fullName);
                        }}
                      />
                      {touched.fullName && errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Email Address <span className="text-red-600">*</span></label>
                        <input 
                          type="email" 
                          required
                          maxLength={60}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, email: val });
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, email: true }));
                            validateField('email', formData.email);
                          }}
                        />
                        {touched.email && errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Phone Number <span className="text-red-600">*</span></label>
                        <input 
                          type="tel" 
                          required
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cleanVal = (val.startsWith('+') ? '+' : '') + val.replace(/[^0-9 ]/g, '');
                            setFormData({ ...formData, phone: cleanVal });
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, phone: true }));
                            validateField('phone', formData.phone);
                          }}
                        />
                        {touched.phone && errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Category</label>
                        <div className="relative">
                          <select
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800 appearance-none"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          >
                            <option>Appointment Support</option>
                            <option>Doctor Registration</option>
                            <option>Clinic Registration</option>
                            <option>Partnership Enquiry</option>
                            <option>Technical Issue</option>
                            <option>General Question</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Subject <span className="text-red-600">*</span></label>
                        <input 
                          type="text" 
                          required
                          maxLength={100}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800" 
                          placeholder="e.g. Schedule query"
                          value={formData.subject}
                          onChange={(e) => {
                            const val = e.target.value;
                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                            setFormData({ ...formData, subject: capitalized });
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, subject: true }));
                            validateField('subject', formData.subject);
                          }}
                        />
                        {touched.subject && errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Message <span className="text-red-600">*</span></label>
                      <textarea 
                        required
                        maxLength={500}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-sm font-semibold text-slate-800 resize-none leading-relaxed" 
                        placeholder="Please describe your question or issue in detail..."
                        value={formData.message}
                        onChange={(e) => {
                          const val = e.target.value;
                          const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                          setFormData({ ...formData, message: capitalized });
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, message: true }));
                          validateField('message', formData.message);
                        }}
                      ></textarea>
                      {touched.message && errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
                    </div>

                     <button 
                       type="submit"
                       disabled={!isFormValid || isSubmitting}
                       className="btn-primary-custom w-full disabled:opacity-50 flex items-center justify-center"
                     >
                       {isSubmitting ? (
                         <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                         </svg>
                       ) : (
                         <Send size={16} className="mr-2" />
                       )}
                       Submit Request
                     </button>
                   </form>
              </>
            </div>

            {/* SUPPORT CHANNELS & OFFICE INFORMATION */}
            <div className="space-y-10">
              {/* SUPPORT CHANNELS */}
              <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                {/* Major section headings must use H2 */}
                <h2 className="font-h2 text-slate-900 mb-6">Support Channels</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} /> General Support
                      </p>
                      <a href="mailto:support@example.com" className="text-sm font-extrabold text-[#00B5B5] hover:underline">support@example.com</a>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} /> Appointment Support
                      </p>
                      <a href="mailto:appointments@example.com" className="text-sm font-extrabold text-[#00B5B5] hover:underline">appointments@example.com</a>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} /> Doctor & Clinic Onboarding
                      </p>
                      <a href="mailto:partners@example.com" className="text-sm font-extrabold text-[#00B5B5] hover:underline">partners@example.com</a>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Phone size={12} /> Phone Support
                      </p>
                      <span className="text-sm font-extrabold text-slate-800">+91 98765 43210</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200/50 flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Hours</p>
                      <p className="text-sm font-extrabold text-slate-800">Monday - Saturday — 9:00 AM – 6:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OFFICE INFORMATION */}
              <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                {/* Major section headings must use H2 */}
                <h2 className="font-h2 text-slate-900 mb-2">Office Information</h2>
                <p className="font-body-secondary text-slate-400 mb-6">For business enquiries and administrative communication.</p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0 border border-slate-100">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Address</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">BookMyDoctor, Sector 62, Noida, Uttar Pradesh, India</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0 border border-slate-100">
                      <Mail size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Email</h4>
                      <a href="mailto:support@example.com" className="text-xs text-[#00B5B5] font-semibold mt-0.5 hover:underline">support@example.com</a>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#00B5B5] shrink-0 border border-slate-100">
                      <Phone size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Phone</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">+91 98765 43210</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>

      {/* SECTION 4: COMMON REQUESTS */}
      <Section className="bg-slate-50/50 border-y border-slate-100">
        <Container className="max-w-6xl">
          <SectionHeader 
            title="Healthcare Services"
            description="We offer quick support routes for clinical onboarding, client assistance, and booking inquiries."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Appointment Booking",
                desc: "Need help booking or managing an appointment?",
                icon: Calendar
              },
              {
                title: "Doctor Registration",
                desc: "Want to join BookMyDoctor as a healthcare professional?",
                icon: UserCheck
              },
              {
                title: "Clinic Registration",
                desc: "Register your clinic and connect with more patients.",
                icon: Building2
              },
              {
                title: "Technical Support",
                desc: "Experiencing a website or account issue?",
                icon: Settings
              },
              {
                title: "Partnership Enquiries",
                desc: "Interested in working with BookMyDoctor?",
                icon: Users
              },
              {
                title: "General Questions",
                desc: "Need information about our services?",
                icon: HelpCircle
              }
            ].map((request, i) => {
              const Icon = request.icon;
              return (
                <Card key={i} className="flex-row gap-5 items-start hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    {/* Card Title must use H3 */}
                    <h3 className="font-h3 text-slate-900 mb-2">{request.title}</h3>
                    {/* Card Descriptions must use body text */}
                    <p className="font-body-secondary text-slate-400">{request.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* SECTION 5: IMPORTANT NOTICE */}
      <Section className="bg-slate-50/30 py-16 border-t border-slate-100">
        <Container className="max-w-4xl">
          <div className="bg-white border-l-4 md:border-l-8 border-rose-600 rounded-r-3xl shadow-xl shadow-slate-100/75 p-8 md:p-10 relative overflow-hidden">
            {/* Ambient gradients for a premium aesthetic */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-50 rounded-full blur-3xl -z-0 opacity-70 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-50/40 rounded-full blur-3xl -z-0 opacity-40 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
              {/* Alert icon with animation */}
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert size={28} className="text-rose-600 animate-pulse" />
              </div>
              
              <div className="flex-1">
                {/* Badge tags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-100">
                    CRITICAL NOTICE
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Patient Safety Guidelines</span>
                </div>
                
                {/* Heading */}
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-4">
                  Medical Emergency Notice
                </h3>
                
                {/* Primary statement */}
                <p className="text-base font-extrabold text-slate-950 mb-6 pb-4 border-b border-slate-100">
                  BookMyDoctor <span className="text-rose-600 underline decoration-2 decoration-rose-350">does not</span> provide emergency medical services.
                </p>
                
                {/* Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-3 items-start">
                    <span className="w-2 h-2 rounded-full bg-rose-600 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-rose-700 tracking-wider mb-1">Emergency Actions</h4>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                        If you are experiencing a medical emergency, immediately contact your local emergency services or visit the nearest hospital.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <span className="w-2 h-2 rounded-full bg-rose-600 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-1">Restricted Situations</h4>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                        Do not use this platform for urgent or life-threatening medical situations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 6: FAQ */}
      <Section className="bg-slate-50/50 border-t border-slate-100">
        <Container className="max-w-3xl">
          <SectionHeader 
            title="Frequently Asked Questions"
          />

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full p-6 text-left flex justify-between items-center font-extrabold text-slate-800 hover:text-[#00B5B5] transition-colors"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  {/* FAQ Questions must use H3 */}
                  <h3 className="font-h3 text-slate-900 m-0 p-0 flex-grow text-left">{faq.q}</h3>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transform transition-transform duration-200 ${openFaqIndex === index ? 'rotate-180 text-[#00B5B5]' : ''}`} 
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 text-sm text-slate-500 font-semibold leading-relaxed border-t border-slate-50 pt-4">
                    {/* Answer must use body text */}
                    <p className="font-body-secondary text-slate-500">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
