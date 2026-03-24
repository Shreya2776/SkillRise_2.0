import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/auth", "/roadmap") : "http://localhost:8000/api/roadmap";
export const generateRoadmap = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/generate`, data, {
      timeout: 60000, // 60 seconds timeout - wait for LLM response
    });
    return res.data;
  } catch (err) {
    // Pass through the exact error from backend
    if (err.response?.data) {
      throw err.response.data;
    }
    throw { error: true, message: err.message };
  }
};

export const updateRoadmap = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 90000,
    });
    return res.data;
  } catch (err) {
    if (err.response?.data) {
      throw err.response.data;
    }
    throw { error: true, message: err.message };
  }
};

export const careerSwitchRoadmap = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/career-switch`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 90000,
    });
    return res.data;
  } catch (err) {
    if (err.response?.data) {
      throw err.response.data;
    }
    throw { error: true, message: err.message };
  }
};
