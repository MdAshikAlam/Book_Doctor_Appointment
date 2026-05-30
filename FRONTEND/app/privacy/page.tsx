import React from 'react';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';

export default function PrivacyPage() {
  return (
    <Section className="bg-slate-50/50 min-h-screen">
      <Container className="max-w-4xl bg-white border border-slate-100 shadow-xl rounded-[2.5rem] p-8 md:p-16">
        <header className="mb-10 text-center border-b border-slate-100 pb-8">
          <h1 className="font-h1 text-slate-900 mb-4">Privacy Policy</h1>
          <p className="font-body-secondary text-slate-400">Last updated: May 30, 2026</p>
        </header>

        <div className="space-y-8 text-slate-600 leading-relaxed font-body-secondary">
          <p className="font-body-primary text-slate-500">
            At BookMyDoctor, we prioritize the privacy and security of our patients and healthcare partners. This Privacy Policy describes how we collect, use, and share your personal data when you visit our website.
          </p>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">1. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when scheduling appointments, including your full name, email address, mobile number, Aadhaar number, date of birth, gender, and residential address. We also collect clinical data like symptoms to assist doctors with treatment preparations.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">2. How We Use Your Information</h2>
            <p>
              We utilize your personal information to facilitate appointment booking and verification between you and your chosen healthcare providers. We also use your email and mobile number to dispatch confirmation messages, reminders, updates, and rescheduling options.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">3. Data Sharing and Protection</h2>
            <p>
              Your data is shared exclusively with the clinic or medical professional you choose to consult. We do not sell or trade patient diagnostic histories, personal information, or address details to advertising networks. All critical client details are secured using modern encryption techniques.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-h3 text-slate-900">4. Your Privacy Rights</h2>
            <p>
              You maintain full rights to request modification, review, or erasure of your personal patient profile at any time. Simply reach out to support@bookmydoctor.in to submit a profile correction or deletion query.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
