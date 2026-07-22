import axios from "axios";
import { BASE_API } from "../lib/api.js";

const API_URL = `${BASE_API}/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAdminStats = async () => {
  try {
    const res = await axios.get(`${API_URL}/stats`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    throw error;
  }
};

export const getUsersList = async (page = 1, search = "") => {
  try {
    const res = await axios.get(`${API_URL}/users?page=${page}&search=${search}`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Failed to fetch users list:", error);
    throw error;
  }
};

export const getNgosList = async () => {
  try {
    const res = await axios.get(`${API_URL}/ngos`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("Failed to fetch NGOs list:", error);
    throw error;
  }
};
