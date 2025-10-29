import api from "src/utils/api";

// const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}transactions/categories/`;
const BASE_PATH = "transactions/categories/";

export interface CategoryProps {
  id: number;
  name: string;
  is_active?: boolean;
  cash_books?: number[];
  cash_books_details?: { id: number; name: string }[];
}

// const getAuthHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

export const getCategories = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

export const createCategory = async (data: any) => {
  const res = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event("category-update"));
  return res.data;
};

export const updateCategory = async (id: number, data: any) => {
  const res = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event("category-update"));
  return res.data;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`${BASE_PATH}${id}/`);
  window.dispatchEvent(new Event("category-update"));
};