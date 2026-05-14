import axios from 'axios';

const BASE = 'https://landermaps.onrender.com';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  headers: { authorization: getToken() }
});

// Public
export const getMaps = () => axios.get(`${BASE}/`);
export const getMapById = (id) => axios.get(`${BASE}/${id}`);

// Auth
export const login = (data) => axios.post(`${BASE}/auth/login`, data);

// Admin
export const adminGetMaps = () => axios.get(`${BASE}/admin/maps`, authHeaders());
export const createMap = (data) => axios.post(`${BASE}/admin/maps`, data, authHeaders());
export const updateMap = (id, data) => axios.patch(`${BASE}/admin/maps/${id}`, data, authHeaders());
export const deleteMap = (id) => axios.delete(`${BASE}/admin/maps/${id}`, authHeaders());
export const uploadFile = (formData, type) =>
  axios.post(`${BASE}/admin/upload?type=${type}`, formData, {
    ...authHeaders(),
    headers: {
      ...authHeaders().headers,
      'Content-Type': 'multipart/form-data'
    }
  });

// Payment
export const createCheckout = (mapId) => axios.post(`${BASE}/api/checkout`, { mapId });
export const getDownload = (id, email) => axios.get(`${BASE}/api/download/${id}?email=${email}`);