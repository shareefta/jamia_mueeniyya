import api from "src/utils/api";

const BASE_PATH = "transactions/transactions/";

export interface TransactionProps {
  id?: number;
  date: string;
  time: string;
  amount: number;
  remarks: string;
  category: number;
  payment_mode: number;
  cash_book: number;
  transaction_type: "IN" | "OUT";
  user?: number;
  user_name?: string;
  category_name?: string;
  payment_mode_name?: string;
  cash_book_name?: string;
  transaction_label?: string;
  party_name?: string;
  party_mobile_number?: string;
}

// get all transactions
export const getTransactions = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

// Create transaction
export const createTransaction = async (data: TransactionProps) => {
  const res = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event("transaction-update"));
  return res.data;
};

// Edit transaction
export const updateTransaction = async (id: number, data: TransactionProps) => {
  const res = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event("transaction-update"));
  return res.data;
};

// Delete transaction
export const deleteTransaction = async (id: number) => {
  const res = await api.delete(`${BASE_PATH}${id}/`);
  window.dispatchEvent(new Event("transaction-update"));
  return res.data;
};