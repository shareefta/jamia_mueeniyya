import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}accounts/offcampuses/`;

export interface OffCampus {
    id: number;
    name: string;
    address: string;
    contact_number: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function getOffCampuses() {
  const response = await axios.get(BASE_URL, { headers: authHeaders() });
  return response.data;
}

export async function createOffCampus(data: any) {
  const response = await axios.post(BASE_URL, data, { headers: authHeaders() });
  window.dispatchEvent(new Event('offcampus-update'));
  return response.data;
}

export async function updateOffCampus(id: number, data: any) {
  const response = await axios.put(`${BASE_URL}${id}/`, data, { headers: authHeaders() });
  window.dispatchEvent(new Event('offcampus-update'));
  return response.data;
}

export async function deleteOffCampus(id: number) {
  await axios.delete(`${BASE_URL}${id}/`, { headers: authHeaders() });
  window.dispatchEvent(new Event('offcampus-update'));
}
