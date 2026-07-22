import Opportunity from "../models/opportunity.model.js";
import Program from "../models/program.model.js";
import Profile from "../models/Profile.js";

export const getNotifications = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const userSkills = (profile?.data?.skills || []).map(s => s.toLowerCase().trim());

    const [opportunities, programs] = await Promise.all([
      Opportunity.find().sort("-createdAt").limit(20),
      Program.find().sort("-createdAt").limit(20),
    ]);

    const score = (itemSkills) => {
      if (!userSkills.length || !itemSkills?.length) return 0;
      const normalized = itemSkills.map(s => s.toLowerCase().trim());
      return normalized.filter(s => userSkills.some(u => u.includes(s) || s.includes(u))).length;
    };

    const notifications = [
      ...opportunities.map(o => ({
        id: o._id,
        type: "opportunity",
        title: o.title,
        badge: o.type,
        skills: o.skills || [],
        location: o.location,
        deadline: o.deadline,
        matchScore: score(o.skills),
        createdAt: o.createdAt,
      })),
      ...programs.map(p => ({
        id: p._id,
        type: "program",
        title: p.title,
        badge: p.type,
        skills: p.skills || [],
        location: p.location,
        deadline: p.deadline,
        matchScore: score(p.skills),
        createdAt: p.createdAt,
      })),
    ]
      .filter(n => n.matchScore > 0 || userSkills.length === 0)
      .sort((a, b) => b.matchScore - a.matchScore || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
