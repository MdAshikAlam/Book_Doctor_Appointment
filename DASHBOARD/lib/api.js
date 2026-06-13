const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiCall = async (endpoint, options = {}) => {
  const headers = {
    ...options.headers,
  };

  // Only set application/json if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const selectedClinicId = typeof window !== 'undefined' ? localStorage.getItem('selectedClinicId') : null;
  if (selectedClinicId) {
    headers['X-Clinic-ID'] = selectedClinicId;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle empty responses (like 204 No Content)
  let data = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('user');
      if (!endpoint.includes('/auth/logout') && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
        window.location.href = '/?auth=failed';
      }
    }
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
};

export const authApi = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ ...credentials, isDashboard: true }),
  }),
  registerAdmin: (data) => apiCall('/auth/register-admin', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => apiCall('/auth/me'),
  forgotPassword: (email) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token, password) => apiCall(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
  sendOtp: (email) => apiCall('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, isDashboard: true }),
  }),
  verifyOtp: (email, otp, fullName) => apiCall('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, fullName }),
  }),
};

export const doctorsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/doctors?${query}`);
  },
  getPending: (status) => apiCall(`/doctors/pending${status ? `?status=${status}` : ''}`),
  updateStatus: (id, status, rejectionReason) => apiCall(`/doctors/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason }),
  }),
  create: (data) => apiCall('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/doctors/${id}`, {
    method: 'DELETE',
  }),
  upload: (formData) => apiCall('/upload', {
    method: 'POST',
    body: formData,
  }),
  getMe: () => apiCall('/doctors/me'),
  generateAvailability: (id, data) => apiCall(`/doctors/${id}/availability/generate`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addLeave: (id, data) => apiCall(`/doctors/${id}/leave`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const appointmentsApi = {
  getMy: (status) => apiCall(`/appointments/my${status ? `?status=${status}` : ''}`),
  updateStatus: (id, data) => apiCall(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  reschedule: (id, data) => apiCall(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

export const usersApi = {
  getStaff: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/users/staff?${query}`);
  },
  getHierarchy: () => apiCall('/users/hierarchy'),
  createStaff: (data) => apiCall('/users/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/users/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),
  getPatients: () => apiCall('/users/patients'),
  getPatientDetails: (id) => apiCall(`/users/patients/${id}`),
  updatePatientStatus: (id, data) => apiCall(`/users/patients/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  getAdminRequests: (status) => apiCall(`/users/admin-requests${status ? `?status=${status}` : ''}`),
  updateStatus: (id, status, rejectionReason) => apiCall(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason }),
  }),
  suspend: (id) => apiCall(`/users/${id}/suspend`, { method: 'PATCH' }),
  reactivate: (id) => apiCall(`/users/${id}/reactivate`, { method: 'PATCH' }),
  resetPassword: (id, password) => apiCall(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
  transferData: (data) => apiCall('/users/transfer-data', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getActivityLogs: () => apiCall('/users/activity-logs'),
  getTrashBin: () => apiCall('/users/trash-bin'),
  restoreFromTrash: (adminId) => apiCall(`/users/trash-bin/${adminId}/restore`, {
    method: 'POST'
  }),
};

export const utilityApi = {
  getStates: () => apiCall('/utility/states'),
  getDistricts: (state) => apiCall(`/utility/districts?state=${state}`),
};

export const clinicsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/clinics?${query}`);
  },
  create: (data) => apiCall('/clinics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getPending: (status) => apiCall(`/clinics/pending${status ? `?status=${status}` : ''}`),
  updateStatus: (id, status, rejectionReason) => apiCall(`/clinics/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason }),
  }),
  update: (id, data) => apiCall(`/clinics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/clinics/${id}`, {
    method: 'DELETE',
  }),
};

export const analyticsApi = {
  getStats: () => apiCall('/analytics/dashboard-stats'),
  getNotifications: () => apiCall('/analytics/notifications'),
  markNotified: (category) => apiCall('/analytics/mark-notified', {
    method: 'POST',
    body: JSON.stringify({ category }),
  }),
};

