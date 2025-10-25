import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}transactions/parties/`;

export interface PartyProps {
  id: number;
  name: string;
  mobile_number?: string | null;
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Fetch all parties
export const getParties = async (): Promise<PartyProps[]> => {
  const res = await axios.get(BASE_URL, { headers: getAuthHeaders() });
  return res.data;
};

// Create a new party
export const createParty = async (party: {
  name: string;
  mobile_number?: string;
}): Promise<PartyProps> => {
  const res = await axios.post(BASE_URL, party, { headers: getAuthHeaders() });
  return res.data;
};

// Get a single party by ID
export const getPartyById = async (id: number): Promise<PartyProps> => {
  const res = await axios.get(`${BASE_URL}${id}/`, { headers: getAuthHeaders() });
  return res.data;
};
