const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `${protocol}//${hostname}:5000/api`;
};

const API_URL = getApiUrl();

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('bitsathy_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Auth
  devLogin: (email) => request('/auth/dev-login', { method: 'POST', body: JSON.stringify({ email }) }),
  
  // Rooms
  getRooms: () => request('/rooms'),
  getRoomTimeline: (date) => request(`/rooms/timeline?date=${date}`),
  createRoom: (roomData) => request('/rooms', { method: 'POST', body: JSON.stringify(roomData) }),

  // Bookings
  getBookings: () => request('/bookings'),
  createBooking: (bookingData) => request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Attendance
  generateOtp: (bookingId) => request('/attendance/otp/generate', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  verifyOtp: (bookingId, otpCode, surveyAnswers) => request('/attendance/otp/verify', { method: 'POST', body: JSON.stringify({ bookingId, otpCode, surveyAnswers }) }),
  overrideAttendance: (data) => request('/attendance/override', { method: 'POST', body: JSON.stringify(data) }),
  getSessionAttendance: (bookingId) => request(`/attendance/session/${bookingId}`),

  // Groups
  getGroups: () => request('/groups'),
  createGroup: (groupData) => request('/groups', { method: 'POST', body: JSON.stringify(groupData) }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  createNotification: (notifData) => request('/notifications', { method: 'POST', body: JSON.stringify(notifData) }),

  // Join Requests
  createJoinRequest: (bookingId, reasonNote) => request(`/bookings/${bookingId}/requests`, { method: 'POST', body: JSON.stringify({ reasonNote }) }),
  getJoinRequests: (bookingId) => request(`/bookings/${bookingId}/requests`),
  updateJoinRequest: (id, status) => request(`/bookings/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Users
  getUsers: (search = '') => request(`/users?search=${search}`),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(userData) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

