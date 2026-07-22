import axios from "axios";

const resolveBaseUrl = (envValue, fallbackPath) => {
  if (envValue) return envValue;

  if (typeof window !== "undefined") {
    return `${window.location.origin}${fallbackPath}`;
  }

  return fallbackPath;
};

const ANALYZER_API = axios.create({
  baseURL: resolveBaseUrl(import.meta.env.VITE_ANALYZER_API_URL, "/api/analyzer")
});

const MAIN_API = axios.create({
  baseURL: resolveBaseUrl(import.meta.env.VITE_API_URL, "/api")
});

export const analyzeResume = async (file, jobDescription = "", jobSkills = []) => {
  const formData = new FormData();
  formData.append("resume", file);
  if (jobDescription) formData.append("jobDescription", jobDescription);
  if (jobSkills.length > 0) formData.append("jobSkills", JSON.stringify(jobSkills));

  const res = await ANALYZER_API.post("/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data;
};

export const saveResumeAnalysis = async (payload) => {
  const token = localStorage.getItem("token");
  const res = await MAIN_API.post("/persistence/resume-analysis", payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

export const getMyResumeAnalyses = async () => {
  const token = localStorage.getItem("token");
  const res = await MAIN_API.get("/persistence/resume-analysis", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};