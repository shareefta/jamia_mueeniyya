import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}accounts/`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getRoles = async () => {
  const res = await axios.get(`${BASE_URL}roles/`, { headers: getAuthHeaders() });
  return res.data;
};