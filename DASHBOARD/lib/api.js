const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiCall = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers = {
    ...options.headers,
  };

  // Only set application/json if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const selectedBranchId = typeof window !== 'undefined' ? localStorage.getItem('selectedBranchId') : null;
  if (selectedBranchId) {
    headers['X-Branch-ID'] = selectedBranchId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/';
    }
    throw new Error(data.message || 'Something went wrong');
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
  getMe: () => apiCall('/users/me'),
  forgotPassword: (email) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token, password) => apiCall(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
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
  getMy: () => apiCall('/appointments/my'),
  updateStatus: (id, status) => apiCall(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  reschedule: (id, data) => apiCall(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

export const usersApi = {
  getStaff: () => apiCall('/users/staff'),
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
  updatePatientStatus: (id, patientStatus) => apiCall(`/users/patients/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ patientStatus }),
  }),
  getAdminRequests: (status) => apiCall(`/users/admin-requests${status ? `?status=${status}` : ''}`),
  updateStatus: (id, status, rejectionReason) => apiCall(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason }),
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
};
