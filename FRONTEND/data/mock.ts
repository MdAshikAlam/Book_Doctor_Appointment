import { Heart, Brain, Baby, Bone, Activity, Eye, Ear, Smile, Stethoscope } from 'lucide-react';

export const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    experience: 15,
    rating: 4.9,
    reviews: 124,
    location: "New York, NY",
    availability: "Tomorrow, 10:00 AM",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop"
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Pediatrician",
    experience: 10,
    rating: 4.8,
    reviews: 89,
    location: "San Francisco, CA",
    availability: "Today, 4:30 PM",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop"
  },
  {
    name: "Dr. Elena Rodriguez",
    specialization: "Neurologist",
    experience: 12,
    rating: 4.9,
    reviews: 156,
    location: "Chicago, IL",
    availability: "Fri, 14 Oct",
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&h=300&auto=format&fit=crop"
  }
];

export const specialties = [
  { name: "Cardiology", icon: Heart, count: 120 },
  { name: "Neurology", icon: Brain, count: 85 },
  { name: "Pediatrics", icon: Baby, count: 210 },
  { name: "Orthopedics", icon: Bone, count: 95 },
  { name: "Dermatology", icon: Activity, count: 150 },
  { name: "Eye Specialist (Ophthalmologist)", icon: Eye, count: 70 },
  { name: "Dentist", icon: Smile, count: 180 },
  { name: "General Physician", icon: Stethoscope, count: 320 },
  { name: "ENT", icon: Ear, count: 55 },
];

export const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Verified Patient",
    content: "I found a specialist just a few kilometers away and booked an appointment in under a minute. The process was smooth and convenient.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "David K.",
    role: "Verified Patient",
    content: "Comparing doctor profiles, fees, and clinic locations helped me choose the right healthcare provider.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/150?u=david"
  },
  {
    name: "Elena R.",
    role: "Verified Patient",
    content: "The location-based search saved me a lot of time finding a nearby clinic.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/150?u=elena"
  }
];
