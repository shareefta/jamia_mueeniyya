import api from "src/utils/api";

const BASE_PATH = "accounts/offcampuses/";
export interface OffCampus {
    id: number;
    name: string;
    address: string;
    contact_number: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

export async function getOffCampuses() {
  const response = await api.get(BASE_PATH);
  return response.data;
}

export async function createOffCampus(data: any) {
  const response = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event('offcampus-update'));
  return response.data;
}

export async function updateOffCampus(id: number, data: any) {
  const response = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event('offcampus-update'));
  return response.data;
}

export async function deleteOffCampus(id: number) {
  await api.delete(`${BASE_PATH}${id}/`);
  window.dispatchEvent(new Event('offcampus-update'));
}