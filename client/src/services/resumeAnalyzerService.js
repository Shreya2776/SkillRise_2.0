// import axios from "axios";

// const API = axios.create({
//   baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8000/api") + "/resume"
// });

// export const analyzeResume = async (file) => {
//   const formData = new FormData();
//   formData.append("resume", file);

//   const res = await API.post("/analyze", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data"
//     }
//   });

//   return res.data;
// };

import axios from "axios";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8000/api") + "/resume"
});

export const analyzeResume = async (file, { jobTitle, jobDescription, jobSkills, experienceYears } = {}) => {
  const formData = new FormData();
  formData.append("resume", file);

  if (jobTitle) formData.append("jobTitle", jobTitle);
  if (jobDescription) formData.append("jobDescription", jobDescription);
  if (Array.isArray(jobSkills)) formData.append("jobSkills", JSON.stringify(jobSkills));
  if (experienceYears !== undefined) formData.append("experienceYears", String(experienceYears));

  const res = await API.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;
};