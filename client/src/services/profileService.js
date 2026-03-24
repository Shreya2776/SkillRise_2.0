import axios from "axios";

export const createProfile = async (data) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);
  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/auth", "/profile") : "http://localhost:8000/api/profile";
  return axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },

  });
};