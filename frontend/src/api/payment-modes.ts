import api from "src/utils/api";

const BASE_PATH = "transactions/payment_modes/";
export interface PaymentModeProps {
  id: number;
  name: string;
}

export const getPaymentModes = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

export const createPaymentMode = async (data: any) => {
  const res = await api.post(BASE_PATH, data);
  window.dispatchEvent(new Event("paymentmode-update"));
  return res.data;
};

export const updatePaymentMode = async (id: number, data: any) => {
  const res = await api.put(`${BASE_PATH}${id}/`, data);
  window.dispatchEvent(new Event("paymentmode-update"));
  return res.data;
};

export const deletePaymentMode = async (id: number) => {
  await api.delete(`${BASE_PATH}${id}/`);
  window.dispatchEvent(new Event("paymentmode-update"));
};
