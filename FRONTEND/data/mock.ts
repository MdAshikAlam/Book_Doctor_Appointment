import { Heart, Brain, Baby, Bone, Activity, Eye } from 'lucide-react';

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
];

export const testimonials = [
  {
    name: "Thomas Miller",
    role: "Patient",
    content: "Finding a specialist was so easy. I booked an appointment within 2 minutes, and the care I received was exceptional.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/150?u=thomas"
  },
  {
    name: "Amanda Smith",
    role: "Mother of 2",
    content: "The pediatricians here are amazing. My kids are actually excited for their check-ups now! Highly recommend.",
    rating: 5,
    avatarUrl: "https://i.pravatar.cc/150?u=amanda"
  }
];
