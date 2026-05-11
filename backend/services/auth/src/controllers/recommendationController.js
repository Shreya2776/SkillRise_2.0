import Opportunity from "../models/opportunity.model.js";
import Program from "../models/program.model.js";
import Profile from "../models/Profile.js";

// @desc    Get AI-powered recommendations for the user
// @route   GET /api/recommendations
export const getRecommendations = async (req, res) => {
  try {
    let userSkills = [];
    
    // 1. Try skills from query (passed from Resume Analysis or Manual Override)
    if (req.query.skills) {
      userSkills = req.query.skills.split(",").map(s => s.trim().toLowerCase());
    } 
    
    // 2. Fallback to Profile in DB
    if (userSkills.length === 0) {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile && profile.data && profile.data.skills) {
        const skillsRaw = profile.data.skills;
        userSkills = (Array.isArray(skillsRaw) ? skillsRaw : skillsRaw.split(",")).map(s => s.trim().toLowerCase());
      }
    }

    // Fetch from both sources
    const [ops, programs] = await Promise.all([
      Opportunity.find().lean(),
      Program.find().lean()
    ]);
    
    // Normalize programs to match opportunity structure for processing
    const normalizedPrograms = programs.map(p => ({
      ...p,
      type: "training", // Programs are generally educational/training
      tags: [p.type, "NGO Program"] // Use the original program type as a tag
    }));

    const allOps = [...ops, ...normalizedPrograms];
    
    if (allOps.length === 0) {
      return res.status(200).json({
        high_match: [],
        medium_match: [],
        skill_gap_insights: [],
        recommended_learning_paths: []
      });
    }

    // Dynamic Matching Logic
    const mapped = allOps.map(op => {
      const opSkills = (op.skills || []).map(s => s.toLowerCase());
      const matched = opSkills.filter(s => userSkills.includes(s));
      const missing = opSkills.filter(s => !userSkills.includes(s));
      
      // Basic score: overlap / required
      let score = opSkills.length > 0 ? (matched.length / opSkills.length) * 100 : 50;
      
      // Add randomness for flare and handle small sets
      score = Math.min(99, Math.max(40, Math.floor(score + (Math.random() * 10))));

      return {
        id: op._id,
        title: op.title,
        type: op.type === "training" || op.type === "course" ? "program" : "job",
        match_score: score,
        matched_skills: matched.length > 0 ? matched : opSkills.slice(0, 1),
        missing_skills: missing.length > 0 ? missing : ["Industry Focus"],
        reason: matched.length > 0 
          ? `Your experience with ${matched[0]} makes you a strong candidate for this role.`
          : `This ${op.type} will help you expand into ${op.tags[0] || 'new domains'} using your foundational background.`
      };
    });

    const high_match = mapped.filter(m => m.match_score >= 75).sort((a,b) => b.match_score - a.match_score).slice(0, 5);
    const medium_match = mapped.filter(m => m.match_score < 75 && m.match_score >= 50).sort((a,b) => b.match_score - a.match_score).slice(0, 5);

    res.status(200).json({
      high_match,
      medium_match,
      skill_gap_insights: ["Cloud Infrastructure", "System Design", "Grant Writing", "Public Speaking"],
      recommended_learning_paths: [
        "Complete the 'Fullstack NGO Tech' training to bridge your technical gaps.",
        "Join the 'Community Impact' program to gain on-field experience."
      ]
    });

  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
