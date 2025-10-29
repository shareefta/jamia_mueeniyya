import api from "src/utils/api";

const BASE_PATH = "accounts/";

export const getRoles = async () => {
  const res = await api.get(`${BASE_PATH}roles/`);
  return res.data;
};