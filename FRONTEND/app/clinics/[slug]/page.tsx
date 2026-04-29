"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Loader2, MapPin, Phone, Mail, Globe, Clock, 
  CheckCircle2, Hospital, Stethoscope, ArrowRight,
  ShieldCheck, Info, Award, Users
} from "lucide-react";
import { resolveImageUrl } from "../../../lib/resolveImageUrl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type ClinicDetails = {
  _id: string;
  name: string;
  clinicType: string;
  description?: string;
  images: string[];
  addressLine1: string;
  addressLine2?: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  emergencyAvailable: boolean;
  services: string[];
  facilities: string[];
  registrationFee?: number;
  slug: string;
  doctors: {
    _id: string;
    slug?: string;
    specialty: string;
    user: {
      name: string;
      avatar?: string;
    };
  }[];
};

export default function ClinicDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [clinic, setClinic] = useState<ClinicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/clinics/${slug}`);
        const data = await res.json();

        if (data.status === "success") {
          setClinic(data.data.clinic);
        } else {
          throw new Error(data.message || "Failed to load clinic details");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load clinic details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchClinic();
    }
  }, [slug]);

  // Handle auto-redirect if ID is used instead of slug
  useEffect(() => {
    if (clinic && slug && clinic.slug && slug !== clinic.slug) {
      window.history.replaceState(null, '', `/clinics/${clinic.slug}`);
    }
  }, [clinic, slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Loading Healthcare Facility...</p>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <Hospital size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">Clinic Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{error || "We couldn't find the medical facility you're looking for."}</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  const fullAddress = [
    clinic.addressLine1,
    clinic.addressLine2,
    clinic.district,
    clinic.state,
    clinic.pincode
  ].filter(Boolean).join(", ");

  return (
    <div className="bg-[#fafbfc] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="relative h-64 md:h-80 w-full overflow-hidden">
            <img 
              src={clinic.images?.[0] ? resolveImageUrl(clinic.images[0]) || "" : "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"} 
              alt={clinic.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 md:left-12 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {clinic.clinicType}
                </span>
                {clinic.emergencyAvailable && (
                  <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Emergency 24/7
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-2">{clinic.name}</h1>
              <p className="flex items-center gap-2 text-white/80 font-bold">
                <MapPin size={18} className="text-emerald-400" />
                {clinic.district}, {clinic.state}
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-50">
             <div className="flex flex-wrap gap-8">
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Doctors</span>
                   <span className="text-xl font-black text-gray-900">{clinic.doctors?.length || 0} Specialists</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Timings</span>
                   <span className="text-xl font-black text-gray-900">{clinic.openingTime} - {clinic.closingTime}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Registration</span>
                   <span className="text-xl font-black text-emerald-600">₹{clinic.registrationFee || 0}</span>
                </div>
             </div>
             <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-3">
                Book Consultation <ArrowRight size={20} />
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
             {/* Left Column: About & Services */}
             <div className="lg:col-span-2 p-8 md:p-12 border-r border-gray-50 space-y-12">
                <section>
                   <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-primary rounded-full"></div>
                      About the Facility
                   </h3>
                   <p className="text-gray-600 leading-loose text-lg font-medium">
                      {clinic.description || `Welcome to ${clinic.name}, a premier ${clinic.clinicType} located in ${clinic.district}. Our facility is dedicated to providing high-quality medical services with a patient-centric approach.`}
                   </p>
                </section>

                <section>
                   <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                      Available Services
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clinic.services?.map((service, index) => (
                        <div key={index} className="flex items-center gap-4 p-5 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              <Stethoscope size={20} />
                           </div>
                           <span className="font-black text-gray-800">{service}</span>
                        </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                      Medical Staff
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {clinic.doctors?.map((doc) => (
                        <Link href={`/doctors/${doc.slug || doc._id}`} key={doc._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-3xl hover:border-primary hover:shadow-lg transition-all group">
                           <img 
                              src={doc.user.avatar ? resolveImageUrl(doc.user.avatar) || "" : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user.name)}&background=random`} 
                              alt={doc.user.name}
                              className="w-16 h-16 rounded-2xl object-cover"
                           />
                           <div className="flex-1">
                              <h4 className="font-black text-gray-900 group-hover:text-primary transition-colors">Dr. {doc.user.name}</h4>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{doc.specialty}</p>
                           </div>
                           <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <ArrowRight size={18} />
                           </div>
                        </Link>
                      ))}
                   </div>
                </section>
             </div>

             {/* Right Column: Contact & Location */}
             <div className="bg-gray-50/30 p-8 md:p-12 space-y-10">
                <section>
                   <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Contact Details</h4>
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Phone size={18} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Phone</p>
                            <p className="font-black text-gray-900">{clinic.phone}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Mail size={18} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Email</p>
                            <p className="font-black text-gray-900">{clinic.email}</p>
                         </div>
                      </div>
                      {clinic.website && (
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                              <Globe size={18} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Website</p>
                              <p className="font-black text-gray-900">{clinic.website}</p>
                           </div>
                        </div>
                      )}
                   </div>
                </section>

                <section>
                   <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Facility Location</h4>
                   <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm mb-6">
                      <p className="text-gray-600 font-bold leading-relaxed">
                         {fullAddress}
                      </p>
                   </div>
                   <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                      <MapPin size={18} /> Get Directions
                   </button>
                </section>

                <section>
                   <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Working Hours</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                         <span className="font-bold text-gray-600">Weekdays</span>
                         <span className="font-black text-primary">{clinic.openingTime} - {clinic.closingTime}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-primary/5 text-primary text-xs font-black uppercase tracking-widest text-center">
                         {clinic.workingDays?.join(" • ")}
                      </div>
                   </div>
                </section>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
