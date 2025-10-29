import api from "src/utils/api";

const BASE_PATH = "transactions/opening_balances/";
export interface OpeningBalanceProps {
  id?: number;
  cash_book: number;
  amount: number;
}

export const getOpeningBalances = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

export const createOpeningBalance = async (data: OpeningBalanceProps) => {
  const res = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event("openingbalance-update"));
  return res.data;
};

export const updateOpeningBalance = async (id: number, data: OpeningBalanceProps) => {
  const res = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event("openingbalance-update"));
  return res.data;
};

export const deleteOpeningBalance = async (id: number) => {
  await api.delete(`${BASE_PATH}${id}/`);
  window.dispatchEvent(new Event("openingbalance-update"));
};