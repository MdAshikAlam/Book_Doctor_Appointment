"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/common/Card';

export default function ContactSubmissions() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const base = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/contact`;
        const res = await fetch(`${base}/admin/contacts`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (Array.isArray(data.data)) {
          setContacts(data.data);
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'super_admin') {
      fetchContacts();
    }
  }, [user]);

  if (user?.role !== 'super_admin') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-600">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-500">You do not have permission to view contact submissions.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Contact Form Submissions</h1>
      {loading ? (
        <p className="text-gray-500">Loading submissions...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500">No contact requests found.</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.fullName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.phone}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.subject}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 break-words max-w-xs">{c.message}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
