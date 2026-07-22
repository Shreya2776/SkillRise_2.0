import axios from "axios";
import { BASE_API } from "../lib/api.js";

export const createProfile = async (data) => {
  const token = localStorage.getItem("token");
  return axios.post(`${BASE_API}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};