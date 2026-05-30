"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, MapPin, Star, BadgeDollarSign, Briefcase, Hospital } from "lucide-react";
import { getAvatarFallback, resolveImageUrl } from "@/lib/resolveImageUrl";

// Import global UI components
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type DoctorDetails = {
  _id: string;
  slug?: string;
  specialty?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
  address?: string;
  district?: string;
  state?: string;
  qualifications?: string[];
  availability?: { day: string; slots: string[] }[];
  rating?: number;
  numReviews?: number;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  clinic?: {
    _id?: string;
    clinicName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    images?: string[];
    slug?: string;
  };
};

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/doctors/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          setDoctor(data.data.doctor);
        } else {
          throw new Error(data.message || "Failed to load doctor profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  // Handle auto-redirect if ID is used instead of slug
  useEffect(() => {
    if (doctor && id && doctor.slug && id !== doctor.slug) {
      window.history.replaceState(null, '', `/doctors/${doctor.slug}`);
    }
  }, [doctor, id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="font-h1 text-slate-900 mb-3">Unable to load doctor profile</h1>
          <p className="font-body-primary text-slate-500 mx-auto mb-8">{error || "Doctor not found"}</p>
          <Link href="/specialties" className="btn-primary-custom">
            Back to specialists
          </Link>
        </Container>
      </Section>
    );
  }

  const fullAddress =
    [doctor.address, doctor.district, doctor.state].filter(Boolean).join(", ") || "Address not provided";
  const clinicAddress =
    [doctor.clinic?.address, doctor.clinic?.city, doctor.clinic?.state, doctor.clinic?.country].filter(Boolean).join(", ") ||
    "Clinic address not provided";

  return (
    <Section className="bg-slate-50/50">
      <Container>
        {/* Doctor Header card - wraps profile metadata */}
        <Card className="!flex-col md:!flex-row items-center md:items-start gap-8 bg-white border border-slate-100 shadow-sm p-8 md:p-10 mb-10">
          <img
            src={resolveImageUrl(doctor.user?.avatar) || getAvatarFallback(doctor.user?.name)}
            alt={doctor.user?.name || "Doctor"}
            onError={(e) => {
              e.currentTarget.src = getAvatarFallback(doctor.user?.name);
            }}
            className="w-36 h-36 rounded-[24px] object-cover border border-slate-100"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-h1 text-slate-900 mb-2">{doctor.user?.name || "Doctor"}</h1>
            <p className="text-[#00B5B5] font-bold text-lg mb-4">{doctor.specialty || "Specialist"}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-slate-600 font-medium">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {doctor.experience ?? 0}+ years experience
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-slate-600 font-medium">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {(doctor.rating ?? 0).toFixed(1)} ({doctor.numReviews ?? 0} reviews)
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-slate-600 font-medium">
                <BadgeDollarSign className="w-4 h-4 text-slate-400" />
                Consultation fee: ₹{doctor.consultationFee ?? 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Doctor & Clinic Detail Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border border-slate-100 p-8">
            <h2 className="font-h2 text-slate-900 mb-4">Doctor details</h2>
            <p className="font-body-secondary text-slate-600 mb-6">{doctor.bio || "No biography available yet."}</p>
            
            <div className="space-y-3 font-body-secondary text-slate-600">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-1 text-slate-400 shrink-0" />
                <span>{fullAddress}</span>
              </p>
              <p className="text-sm"><strong>Email:</strong> {doctor.user?.email || "Not provided"}</p>
              <p className="text-sm"><strong>Phone:</strong> {doctor.user?.phone || "Not provided"}</p>
              <p className="text-sm"><strong>Qualifications:</strong> {doctor.qualifications?.length ? doctor.qualifications.join(", ") : "Not provided"}</p>
            </div>
          </Card>

          <Card className="bg-white border border-slate-100 p-8">
            <h2 className="font-h2 text-slate-900 mb-4">Clinic details</h2>
            
            <div className="space-y-4 font-body-secondary text-slate-600">
              <p className="flex items-start gap-2.5">
                <Hospital className="w-4 h-4 mt-1 text-[#00B5B5] shrink-0" />
                <Link 
                  href={`/clinics/${doctor.clinic?.slug || doctor.clinic?._id}`}
                  className="font-black text-[#00B5B5] hover:underline transition-all"
                >
                  {doctor.clinic?.clinicName || "Clinic name not provided"}
                </Link>
              </p>
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-1 text-slate-400 shrink-0" />
                <span>{clinicAddress}</span>
              </p>
              {doctor.clinic?.phone && (
                <p className="text-sm"><strong>Phone:</strong> {doctor.clinic.phone}</p>
              )}
              {doctor.clinic?.images?.[0] && (
                <img
                  src={resolveImageUrl(doctor.clinic.images[0]) || doctor.clinic.images[0]}
                  alt={doctor.clinic?.clinicName || "Clinic"}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-full h-44 object-cover rounded-2xl border border-slate-100"
                />
              )}
            </div>
          </Card>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
          <Link
            href={`/appointments?doctorId=${doctor.slug || doctor._id}`}
            className="btn-primary-custom"
          >
            Book appointment
          </Link>
          <Link
            href={`/specialties?specialty=${encodeURIComponent(doctor.specialty || "")}`}
            className="btn-secondary-custom"
          >
            More {doctor.specialty || "specialists"}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
