import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/transactions/";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export interface TransactionProps {
  id?: number;
  date: string;
  time: string;
  amount: number;
  remarks: string;
  category: number;
  payment_mode: number;
  campus: number;
  transaction_type: "IN" | "OUT";
}

export const getTransactions = async () => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

export const createTransaction = async (data: TransactionProps) => {
  const res = await axios.post(BASE_URL, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("transaction-update"));
  return res.data;
};