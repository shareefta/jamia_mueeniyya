import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/api/accounts/";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getRoles = async () => {
  const res = await axios.get(`${BASE_URL}roles/`, { headers: getAuthHeaders() });
  return res.data;
};