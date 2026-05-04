"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2, MapPin, Phone, Mail, Globe, Clock,
  CheckCircle2, Hospital, Stethoscope, ArrowRight,
  ShieldCheck, Info, Award as AwardIcon, Users as UsersIcon, Star as StarIcon, MessageSquare as MessageSquareIcon,
  Send as SendIcon, Lock
} from "lucide-react";
import { resolveImageUrl } from "../../../lib/resolveImageUrl";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type ClinicDetails = {
  _id: string;
  name: string;
  clinicName: string;
  clinicType: string;
  description?: string;
  images: string[];
  addressLine1: string;
  addressLine2?: string;
  city: string;
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
  averageRating: number;
  reviewCount: number;
  doctors: {
    _id: string;
    slug?: string;
    specialty: string;
    status: string;
    user: {
      name: string;
      avatar?: string;
    };
  }[];
};

export default function ClinicDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [clinic, setClinic] = useState<ClinicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const fetchReviews = async (clinicId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/clinics/${clinicId}/reviews`);
      const data = await res.json();
      if (data.status === "success") {
        setReviews(data.data.reviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    if (clinic?._id) {
      fetchReviews(clinic._id);
    }
  }, [clinic]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !isAuthenticated) return;

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/clinics/${clinic._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });

      const data = await res.json();
      if (data.status === "success") {
        setNewReview({ rating: 5, comment: "" });
        fetchReviews(clinic._id);
        // Refresh clinic data to update average rating
        const refreshRes = await fetch(`${API_BASE_URL}/clinics/${slug}`);
        const refreshData = await refreshRes.json();
        if (refreshData.status === "success") {
          setClinic(refreshData.data.clinic);
        }
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch (err) {
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  /*
  // Handle auto-redirect if ID is used instead of slug
  useEffect(() => {
    if (clinic && slug && clinic.slug && slug !== clinic.slug) {
      window.history.replaceState(null, '', `/clinics/${clinic.slug}`);
    }
  }, [clinic, slug]);
  */

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
              <h1 className="text-3xl md:text-5xl font-black mb-2">{clinic.clinicName}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 font-bold">
                <p className="flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-400" />
                  {clinic.district}, {clinic.state}
                </p>
                {clinic.reviewCount > 0 && (
                  <p className="flex items-center gap-2">
                    <StarIcon size={18} className="text-yellow-400 fill-yellow-400" />
                    {clinic.averageRating?.toFixed(1)} ({clinic.reviewCount} Reviews)
                  </p>
                )}
              </div>
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
                          src={doc.user?.avatar ? resolveImageUrl(doc.user.avatar) || "" : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.name || 'Doctor')}&background=random`}
                          alt={doc.user?.name || 'Doctor'}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-black text-gray-900 group-hover:text-primary transition-colors">Dr. {doc.user?.name || 'Unknown'}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{doc.specialty}</p>
                          {doc.status === 'submitted' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-tighter rounded-full border border-amber-100">
                              Verification Pending
                            </span>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <ArrowRight size={18} />
                        </div>
                      </Link>
                    ))}
                    {(!clinic.doctors || clinic.doctors.length === 0) && (
                      <div className="col-span-full py-10 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                        <Stethoscope size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold italic">No medical staff listed for this facility yet.</p>
                      </div>
                    )}
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

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h3 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                  Patient Reviews
                </h3>
                <p className="text-gray-500 font-medium">Read what our patients have to say about our medical services.</p>
              </div>

              {clinic.reviewCount > 0 && (
                <div className="flex items-center gap-6 bg-gray-50 px-8 py-4 rounded-3xl border border-gray-100">
                  <div className="text-center border-r border-gray-200 pr-6">
                    <p className="text-3xl font-black text-gray-900">{clinic.averageRating?.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 text-yellow-400 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <StarIcon key={s} size={12} fill={s <= Math.round(clinic.averageRating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">{clinic.reviewCount} Reviews</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Ratings</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Review List */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                            {rev.user?.avatar ? (
                              <img src={resolveImageUrl(rev.user.avatar) || ""} alt={rev.user.name} className="w-full h-full object-cover" />
                            ) : (
                              <UsersIcon size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 leading-tight">{rev.user?.name || 'Anonymous Patient'}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Patient</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          {[1, 2, 3, 4, 5].map(s => (
                            <StarIcon key={s} size={14} fill={s <= rev.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium italic leading-relaxed">"{rev.comment}"</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-4">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <MessageSquareIcon size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold italic">No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>

              {/* Submit Review Form */}
              <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 h-fit sticky top-28">
                <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <AwardIcon size={24} className="text-primary" /> Write a Review
                </h4>

                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Rating Score</label>
                      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${newReview.rating >= star ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-gray-50 text-gray-300 hover:text-yellow-400'
                              }`}
                          >
                            <StarIcon size={20} fill={newReview.rating >= star ? "currentColor" : "none"} />
                          </button>
                        ))}
                        <span className="ml-auto font-black text-gray-900 text-lg">{newReview.rating}/5</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Your Experience</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about the services, doctors, and facilities..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3"
                    >
                      {submittingReview ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>Submit Review <SendIcon size={18} /></>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Lock size={40} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-900 font-black mb-2">Login Required</p>
                    <p className="text-gray-500 text-sm font-medium mb-6">Please sign in to your account to leave a review.</p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                      Go to Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
