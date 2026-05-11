function buildUserContext(state) {
  const resumeData = state.data || {};
  const profile = state.userProfile || {};

  return {
    skills: resumeData.userSkills || profile.skills || [],
    education: resumeData.education || profile.education || [],
    experience: resumeData.experience || profile.experience || [],
    interests: profile.interests || [],
    goals: profile.goals || [],
    targetRole: state.data?.targetRole || state.targetRole || null
  };
}

module.exports = buildUserContext;
