"use client";

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const isFormValid = 
    formData.fullName && 
    formData.email && 
    formData.phone && 
    formData.message;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600">Have questions? We&apos;re here to help you navigate your healthcare journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold mb-8">Send us a Message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea 
                  className="w-full bg-gray-50 border-none rounded-xl p-4 h-40 focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>
              <button 
                disabled={!isFormValid}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:bg-gray-400 disabled:shadow-none"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-12 py-10">
            <div>
              <h3 className="text-xl font-bold mb-4">Visit Our Office</h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                123 Healthcare Way, Medical District<br />
                New York, NY 10001<br />
                United States
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Direct Contact</h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Support: hello@bookmydoctor.com<br />
                Sales: sales@bookmydoctor.com<br />
                Phone: +1 (800) DOCTOR-0
              </p>
            </div>
            <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <h3 className="text-lg font-bold text-primary mb-2">Emergency?</h3>
              <p className="text-gray-600">If you are experiencing a medical emergency, please call 911 or visit the nearest emergency room immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
