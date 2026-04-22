"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, MapPin, Star, BadgeDollarSign, Briefcase, Hospital, CalendarDays } from "lucide-react";
import { getAvatarFallback, resolveImageUrl } from "@/lib/resolveImageUrl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type DoctorDetails = {
  _id: string;
  specialty?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
  address?: string;
  city?: string;
  country?: string;
  qualifications?: string[];
  availability?: { day: string; slots: string[] }[];
  rating?: number;
  numReviews?: number;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  clinic?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    image?: string;
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
      } catch (err: any) {
        setError(err.message || "Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Unable to load doctor profile</h1>
        <p className="text-gray-500 mb-8">{error || "Doctor not found"}</p>
        <Link href="/specialties" className="inline-flex bg-primary text-white px-6 py-3 rounded-xl font-bold">
          Back to specialists
        </Link>
      </div>
    );
  }

  const fullAddress =
    [doctor.address, doctor.city, doctor.country].filter(Boolean).join(", ") || "Address not provided";
  const clinicAddress =
    [doctor.clinic?.address, doctor.clinic?.city, doctor.clinic?.country].filter(Boolean).join(", ") ||
    "Clinic address not provided";

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <img
              src={resolveImageUrl(doctor.user?.avatar) || getAvatarFallback(doctor.user?.name)}
              alt={doctor.user?.name || "Doctor"}
              onError={(e) => {
                e.currentTarget.src = getAvatarFallback(doctor.user?.name);
              }}
              className="w-36 h-36 rounded-2xl object-cover border border-gray-100"
            />

            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{doctor.user?.name || "Doctor"}</h1>
              <p className="text-primary font-bold mb-4">{doctor.specialty || "Specialist"}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                  <Briefcase className="w-4 h-4" />
                  {doctor.experience ?? 0}+ years experience
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {(doctor.rating ?? 0).toFixed(1)} ({doctor.numReviews ?? 0} reviews)
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                  <BadgeDollarSign className="w-4 h-4" />
                  Consultation fee: ${doctor.consultationFee ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            <section className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">Doctor details</h2>
              <p className="text-gray-600 mb-4">{doctor.bio || "No biography available yet."}</p>
              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{fullAddress}</span>
                </p>
                <p><strong>Email:</strong> {doctor.user?.email || "Not provided"}</p>
                <p><strong>Qualifications:</strong> {doctor.qualifications?.length ? doctor.qualifications.join(", ") : "Not provided"}</p>
              </div>
            </section>

            <section className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">Clinic details</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <Hospital className="w-4 h-4 mt-0.5" />
                  <span>{doctor.clinic?.name || "Clinic name not provided"}</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{clinicAddress}</span>
                </p>
                {doctor.clinic?.image && (
                  <img
                    src={resolveImageUrl(doctor.clinic.image) || doctor.clinic.image}
                    alt={doctor.clinic?.name || "Clinic"}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="w-full h-40 object-cover rounded-xl border border-gray-100"
                  />
                )}
              </div>
            </section>
          </div>

          <section className="bg-gray-50 rounded-2xl p-6 mt-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">Availability</h2>
            {doctor.availability?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.availability.map((item) => (
                  <div key={item.day} className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {item.day}
                    </p>
                    <p className="text-gray-600 text-sm">{item.slots?.length ? item.slots.join(", ") : "No slots listed"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No availability schedule added yet.</p>
            )}
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/appointments?doctorId=${doctor._id}`}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Book appointment
            </Link>
            <Link
              href={`/specialties?specialty=${encodeURIComponent(doctor.specialty || "")}`}
              className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:border-primary hover:text-primary transition-colors"
            >
              More {doctor.specialty || "specialists"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
