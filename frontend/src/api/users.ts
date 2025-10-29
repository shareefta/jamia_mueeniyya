import api from "src/utils/api";

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

const BASE_PATH = "accounts/users/";

export const getUsers = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event("user-update"));
  return res.data;
};

export const updateUser = async (id: number, data: any) => {
  const res = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event("user-update"));
  return res.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`${BASE_PATH}${id}/`);
  window.dispatchEvent(new Event("user-update"));
};