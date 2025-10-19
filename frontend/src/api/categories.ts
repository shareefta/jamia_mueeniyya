import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/transactions/categories/";

export interface CategoryProps {
  id: number;
  name: string;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getCategories = async () => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

export const createCategory = async (data: any) => {
  const res = await axios.post(BASE_URL, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("category-update"));
  return res.data;
};

export const updateCategory = async (id: number, data: any) => {
  const res = await axios.put(`${BASE_URL}${id}/`, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("category-update"));
  return res.data;
};

export const deleteCategory = async (id: number) => {
  await axios.delete(`${BASE_URL}${id}/`, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("category-update"));
};
