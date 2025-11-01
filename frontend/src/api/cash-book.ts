import api from "src/utils/api";

const BASE_PATH = "transactions/cash_books/";

export interface CashBookProps {
  id?: number;
  name: string;
  campus?: number | null;
  is_active?: boolean;
}

// Get all Cash Books
export const getCashBooks = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

// Create a new Cash Book
export const createCashBook = async (data: CashBookProps) => {
  const res = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event("cashbook-update"));
  return res.data;
};

// Update a Cash Book
export const updateCashBook = async (id: number, data: CashBookProps) => {
  const res = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event("cashbook-update"));
  return res.data;
};

// Delete a Cash Book
export const deleteCashBook = async (id: number) => {
  try {
    const res = await api.delete(`${BASE_PATH}${id}/`);
    window.dispatchEvent(new Event("cashbook-update"));
    return res.data;
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to delete Cash Book");
  }
};