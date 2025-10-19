import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/transactions/payment_modes/";

export interface PaymentModeProps {
  id: number;
  name: string;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getPaymentModes = async () => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

export const createPaymentMode = async (data: any) => {
  const res = await axios.post(BASE_URL, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("paymentmode-update"));
  return res.data;
};

export const updatePaymentMode = async (id: number, data: any) => {
  const res = await axios.put(`${BASE_URL}${id}/`, data, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("paymentmode-update"));
  return res.data;
};

export const deletePaymentMode = async (id: number) => {
  await axios.delete(`${BASE_URL}${id}/`, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event("paymentmode-update"));
};
