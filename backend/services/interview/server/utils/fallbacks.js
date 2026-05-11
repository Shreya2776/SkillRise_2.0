/**
 * Static fallback question bank for common roles.
 * Used if Gemini is rate-limited or fails.
 */
const fallbacks = {
  frontend: [
    "Explain the React component lifecycle and hooks.",
    "What is the difference between props and state?",
    "How does the Virtual DOM improve performance?",
    "Explain CSS specificity and its rules.",
    "What are the different ways of styling React components?",
    "Describe what an API is and how you've used it in a project.",
    "Explain closure in JavaScript with an example.",
    "How do you handle state globally across a React app?",
    "What is tree shaking and why is it important?",
    "Explain the difference between local storage and session storage."
  ],
  backend: [
    "What is the difference between SQL and NoSQL?",
    "Explain the REST architecture and HTTP methods.",
    "What is the purpose of middleware in an Express app?",
    "How do you handle errors across an Express backend?",
    "Mention different types of indexing in MongoDB.",
    "Describe the process of hashing passwords safely.",
    "What is JWT and how do you use it for authentication?",
    "Explain horizontal vs vertical scaling.",
    "Describe what a message queue is and why you'd use one.",
    "Mention tools you've used for API documentation."
  ],
  fullstack: [
    "How do you connect a frontend with a backend securely?",
    "Explain the process of deploying a MERN stack app.",
    "How do you handle authentication across a split architecture?",
    "Describe your favorite project and its tech stack.",
    "Mention common performance bottlenecks in a web application.",
    "What is CORS and how do you resolve its issues?",
    "Explain the concept of Docker and containerization.",
    "Describe what CI/CD is and how you've used it.",
    "How do you secure your API from common threats?",
    "Explain the difference between CSR and SSR."
  ]
};

export default fallbacks;
