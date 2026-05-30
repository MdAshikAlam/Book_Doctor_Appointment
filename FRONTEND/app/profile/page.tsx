"use client";

import { useState } from 'react';

export default function Profile() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe'
  });

  const isFormValid = formData.firstName && formData.lastName;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl">
        <h1 className="font-h1 text-slate-900 mb-8">Edit Profile</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-none rounded-xl p-4" 
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border-none rounded-xl p-4" 
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input type="email" className="w-full bg-gray-50 border-none rounded-xl p-4" defaultValue="john@example.com" disabled />
          </div>
          <button 
            disabled={!isFormValid}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:bg-gray-400 disabled:shadow-none"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
