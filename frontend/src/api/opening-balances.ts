import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/transactions/opening_balances/";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export interface OpeningBalanceProps {
  id?: number;
  campus: number;
  amount: number;
}

export const getOpeningBalances = async () => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

export const createOpeningBalance = async (data: OpeningBalanceProps) => {
  const res = await axios.post(BASE_URL, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("openingbalance-update"));
  return res.data;
};

export const updateOpeningBalance = async (id: number, data: OpeningBalanceProps) => {
  const res = await axios.put(`${BASE_URL}${id}/`, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("openingbalance-update"));
  return res.data;
};

export const deleteOpeningBalance = async (id: number) => {
  await axios.delete(`${BASE_URL}${id}/`, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("openingbalance-update"));
};