import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}transactions/cash_books/`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export interface CashBookProps {
  id?: number;
  name: string;
  campus?: number | null;
  is_active?: boolean;
}

// Get all Cash Books
export const getCashBooks = async () => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

// Create a new Cash Book
export const createCashBook = async (data: CashBookProps) => {
  const res = await axios.post(BASE_URL, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("cashbook-update"));
  return res.data;
};

// Update a Cash Book
export const updateCashBook = async (id: number, data: CashBookProps) => {
  const res = await axios.put(`${BASE_URL}${id}/`, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("cashbook-update"));
  return res.data;
};

// Delete a Cash Book
export const deleteCashBook = async (id: number) => {
  await axios.delete(`${BASE_URL}${id}/`, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("cashbook-update"));
};
