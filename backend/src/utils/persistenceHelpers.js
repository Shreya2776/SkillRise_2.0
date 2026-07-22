export const normalizeResumePayload = (payload = {}) => {
  const skills = Array.isArray(payload.skills)
    ? payload.skills.filter(Boolean).map((skill) => String(skill).trim())
    : [];

  const score = Number(payload.score ?? payload.atsScore ?? payload.ats_score ?? 0);
  const suggestions = typeof payload.suggestions === "string"
    ? payload.suggestions.trim()
    : "";

  return {
    skills,
    score: Number.isFinite(score) ? score : 0,
    suggestions,
    rawData: payload.rawData || payload.raw || {},
    metadata: payload.metadata || {},
    title: payload.title || "Resume Analysis",
    source: payload.source || "upload",
  };
};

export const normalizeRoadmapPayload = (payload = {}) => {
  const roadmap = Array.isArray(payload.roadmap)
    ? payload.roadmap
    : [];

  return {
    type: payload.type || "generate",
    roadmap,
    targetRole: payload.targetRole || payload.target_role || "",
    duration: payload.duration || "",
    completedSteps: Array.isArray(payload.completedSteps)
      ? payload.completedSteps.filter(Boolean)
      : [],
    summary: payload.summary || "",
    profileData: payload.profileData || payload.profile || {},
    rawResponse: payload.rawResponse || payload.raw || {},
    metadata: payload.metadata || {},
  };
};

export const normalizeFeedbackPayload = (payload = {}) => {
  const rating = Number(payload.rating ?? 0);
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const category = typeof payload.category === "string" && payload.category.trim()
    ? payload.category.trim()
    : "general";

  return {
    rating: Number.isFinite(rating) ? rating : 0,
    message,
    category,
    page: payload.page || "general",
  };
};
