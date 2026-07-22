// Single source of truth for all API base URLs.
// Set VITE_API_URL=https://your-backend.com/api/auth in .env for production.
// The regex strips everything from /api/ onward so any value works.

const raw = import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth";
export const BASE_API = raw.replace(/\/api\/.*$/, "/api");

// Chatbot microservice (port 5002 locally)
export const CHATBOT_API =
  import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:5002/api/chatbot/message";

// Resume analyzer microservice (port 5001 locally)
export const ANALYZER_API =
  import.meta.env.VITE_ANALYZER_API_URL || "http://localhost:5001/api/analyzer";
