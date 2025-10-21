import axios from 'axios';

import { OffCampus } from './offCampus';

export interface UserProps {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  role: string | null;
  off_campuses: OffCampus[];
  is_active: boolean;
  date_joined: string;
  password?: string;
}

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}accounts/users/`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getUsers = async () => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await axios.post(BASE_URL, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("user-update"));
  return res.data;
};

export const updateUser = async (id: number, data: any) => {
  const res = await axios.put(`${BASE_URL}${id}/`, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("user-update"));
  return res.data;
};

export const deleteUser = async (id: number) => {
  await axios.delete(`${BASE_URL}${id}/`, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("user-update"));
};