import React from 'react';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';

export default function TermsPage() {
  return (
    <Section className="bg-slate-50/50 min-h-screen">
      <Container className="max-w-4xl bg-white border border-slate-100 shadow-xl rounded-[2.5rem] p-8 md:p-16">
        <header className="mb-10 text-center border-b border-slate-100 pb-8">
          <h1 className="font-h1 text-slate-900 mb-4">Terms & Conditions</h1>
          <p className="font-body-secondary text-slate-400">Last updated: May 30, 2026</p>
        </header>

        <div className="space-y-8 text-slate-600 leading-relaxed font-body-secondary">
          <p className="font-body-primary text-slate-500">
            Welcome to BookMyDoctor. By accessing or using our platform, scheduling appointments, or registering as a partner clinic/medical professional, you agree to comply with and be bound by the following terms.
          </p>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">1. Services Provided</h2>
            <p>
              BookMyDoctor functions as a matching tool connecting patients with verified healthcare professionals and clinics. We do not provide clinical advice, medical diagnosis, or immediate emergency treatments.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">2. Emergency Disclaimer</h2>
            <p className="font-semibold text-rose-600 bg-rose-50 p-4.5 rounded-2xl border border-rose-100">
              IMPORTANT: BookMyDoctor is NOT designed for medical emergencies. If you are experiencing a life-threatening health scenario, please contact local emergency numbers or proceed to the nearest hospital immediately.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">3. Appointments and Booking Integrity</h2>
            <p>
              When booking an appointment, you agree to supply authentic identification details (Aadhaar, name, DOB). Cancellations and rescheduling must be performed up to 2 hours before the scheduled time slot.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">4. Partner Responsibilities</h2>
            <p>
              All doctors and clinics listed are responsible for keeping their schedule availability up to date and verifying their medical registry status before accepting patient appointments.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
