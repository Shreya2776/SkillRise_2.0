import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Compass, Loader2, AlertCircle,
  Briefcase, Zap, ArrowRight, FileSearch, CheckCircle,
  XCircle, ChevronRight, Share2, HeadphonesIcon
} from "lucide-react";
import BlogCard from "../ngo/components/BlogCard";
import OpportunityCard from "../components/OpportunityCard";

const BASE_API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth").replace(/\/api\/.*$/, "/api");

const glassStyle = {
  background: "rgba(25, 27, 35, 0.6)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderTop: "1px solid rgba(255, 255, 255, 0.15)",
};

export default function FeedPage() {
  const [feedData, setFeedData] = useState({ personalized: [], trending: [], explore: [] });
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personalized");
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { setResumeLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.allSettled([
      axios.get(`${BASE_API}/persistence/resume-analysis`, { headers }),
      axios.get(`${BASE_API}/persistence/roadmaps`, { headers }),
      axios.get(`${BASE_API}/profile`, { headers }),
    ]).then(([resumeRes, roadmapRes, profileRes]) => {
      if (resumeRes.status === "fulfilled") setResumeAnalysis(resumeRes.value.data?.analyses?.[0] || null);
      if (roadmapRes.status === "fulfilled") setRoadmapData(roadmapRes.value.data?.roadmaps?.[0] || null);
      if (profileRes.status === "fulfilled") setProfileData(profileRes.value.data?.profile || null);
    }).catch(() => {}).finally(() => setResumeLoading(false));
  }, [token]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const [blogReq, oppReq] = await Promise.all([
          axios.get(`${BASE_API}/blogs/feed`, { headers }),
          axios.get(`${BASE_API}/opportunities`)
        ]);
        setFeedData({
          personalized: blogReq.data.personalized || [],
          trending: blogReq.data.trending || [],
          explore: blogReq.data.explore || []
        });
        setOpportunities(oppReq.data.opportunities || []);
      } catch (err) {
        setError("Failed to load your feed. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [token]);

  const handleBlogClick = async (blog) => {
    try {
      if (token) {
        await axios.post(`${BASE_API}/blogs/${blog._id}/interact`, { type: "view" }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {}
  };

  const TABS = [
    { id: "personalized", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "opportunities", label: "Opportunities", icon: Briefcase },
  ];

  const currentBlogs = feedData[activeTab] || [];

  const profileFields = (() => {
    const d = profileData?.data || {};
    return [
      { label: "Name", value: d.name },
      { label: "Bio", value: d.bio || d.summary || d.goal },
      { label: "Skills", value: d.skills && d.skills.length > 0 },
      { label: "Experience", value: d.experience || d.exp },
      { label: "Education", value: d.education || d.college || d.degree },
      { label: "Location", value: d.location },
      { label: "Target Role", value: d.targetRole || d.desiredRole || d.role },
    ];
  })();
  const filledCount = profileFields.filter(f => f.value).length;
  const profilePct = Math.round((filledCount / profileFields.length) * 100);

  const roadmapTotal = roadmapData?.roadmap?.length || 0;
  const roadmapDone = roadmapData?.completedSteps?.length || 0;
  const roadmapPct = roadmapTotal > 0 ? Math.round((roadmapDone / roadmapTotal) * 100) : 0;

  const userName = profileData?.data?.name?.split(" ")[0] || "there";
  const targetRole = roadmapData?.targetRole || resumeAnalysis?.jobTitle || profileData?.data?.role || profileData?.data?.goal || "your goal";

  const skillGaps = [
    { title: "Advanced Node.js Patterns", desc: "Close the loop with enterprise backend architecture.", salary: "+15% Salary Potential", progress: "33%" },
    { title: "Redux ToolKit Masterclass", desc: "Master complex state synchronization for data-heavy dashboards.", salary: "+22% Salary Potential", progress: "66%" },
  ];

  return (
    <div className="w-full min-h-screen text-white pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes border-flow { 0% { background-position: 100% 0%; } 100% { background-position: -100% 0%; } }
        .ai-border::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(90deg, transparent, #5de6ff, #adc6ff, transparent);
          background-size: 200% 100%;
          animation: border-flow 4s linear infinite;
          z-index: 0;
          border-radius: inherit;
          opacity: 0.4;
        }
      `}</style>

      {/* ── AI Career Byte ── */}
      <motion.section
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-16 relative rounded-3xl p-8 md:p-12 overflow-hidden ai-border"
        style={{ ...glassStyle, boxShadow: "0 0 40px -10px rgba(173,198,255,0.2)" }}
      >
        {/* AI badge */}
        <div className="absolute top-0 right-0 p-6 z-10">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
            <Sparkles size={12} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">AI Powered</span>
          </div>
        </div>

        <div className="max-w-3xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
            Good morning, {userName}.
          </h1>
          <p className="text-lg text-white/50 mb-8 leading-relaxed font-medium">
            {roadmapPct > 0
              ? <>Your trajectory toward <span className="text-blue-300 font-bold">{targetRole}</span> is <span className="text-blue-300 font-bold">{roadmapPct}%</span> complete. Keep pushing forward.</>
              : <>Curated content based on your <span className="text-blue-300 font-bold">skills & career goals</span>. Discover blogs, opportunities, and skill gaps tailored just for you.</>
            }
          </p>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="p-6 rounded-2xl border border-blue-500/20 bg-white/[0.03] flex-1">
              <span className="text-blue-300 font-bold block mb-2 text-xs uppercase tracking-widest">Pro Tip</span>
              <p className="text-white/70 leading-snug italic text-sm">
                {resumeAnalysis
                  ? `Your ATS score is ${resumeAnalysis.score}/100${resumeAnalysis.metadata?.jobTitle ? ` for ${resumeAnalysis.metadata.jobTitle}` : ""}. ${resumeAnalysis.score < 75 ? "Improve your resume keywords to boost visibility." : "Great score! Keep your resume updated."}`
                  : "Upload your resume to get an ATS score and personalized job matches."}
              </p>
            </div>
            <button
              onClick={() => setActiveTab("opportunities")}
              className="bg-cyan-400 text-black px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-all self-center md:self-end shadow-lg shadow-cyan-400/20"
            >
              View Opportunities <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── Resume Analysis Card ── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        {resumeLoading ? (
          <div className="h-24 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
        ) : resumeAnalysis ? (
          <div className="rounded-2xl border border-indigo-500/20 bg-[#0d0d16] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <FileSearch size={16} className="text-indigo-400" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Latest Resume Analysis</span>
                {resumeAnalysis.metadata?.jobTitle && (
                  <span className="text-xs text-indigo-300/60 font-medium">— {resumeAnalysis.metadata.jobTitle}</span>
                )}
              </div>
              <button onClick={() => navigate("/resume-analyzer")} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Analyze Again <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-5 flex flex-col md:flex-row gap-6">
              {/* ATS Score ring */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="relative w-16 h-16">
                  <svg width="64" height="64" viewBox="0 0 56 56" className="-rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none"
                      stroke={resumeAnalysis.score > 75 ? "#10b981" : resumeAnalysis.score > 50 ? "#f59e0b" : "#f43f5e"}
                      strokeWidth="4"
                      strokeDasharray={`${((resumeAnalysis.score || 0) / 100) * (2 * Math.PI * 24)} ${2 * Math.PI * 24}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${
                    resumeAnalysis.score > 75 ? "text-emerald-400" : resumeAnalysis.score > 50 ? "text-amber-400" : "text-rose-400"
                  }`}>{resumeAnalysis.score || 0}</span>
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none">ATS Score</p>
                  <p className="text-white/30 text-xs mt-1">{resumeAnalysis.score > 75 ? "Excellent" : resumeAnalysis.score > 50 ? "Needs work" : "Poor"}</p>
                </div>
              </div>
              <div className="hidden md:block w-px bg-white/[0.06]" />
              {/* Skills */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.skills?.slice(0, 8).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">{skill}</span>
                  ))}
                  {resumeAnalysis.skills?.length > 8 && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/30 text-xs font-bold">+{resumeAnalysis.skills.length - 8} more</span>
                  )}
                  {!resumeAnalysis.skills?.length && <span className="text-white/20 text-sm">No skills extracted</span>}
                </div>
              </div>
              {resumeAnalysis.metadata?.missing?.length > 0 && (
                <>
                  <div className="hidden md:block w-px bg-white/[0.06]" />
                  <div className="flex-shrink-0 min-w-0 max-w-xs">
                    <p className="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest mb-2">Missing Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {resumeAnalysis.metadata.missing.slice(0, 5).map((k, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">{k}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => navigate("/resume-analyzer")}
            className="w-full flex items-center justify-between p-5 rounded-2xl border border-dashed border-indigo-500/20 bg-indigo-500/[0.03] hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] transition-all group">
            <div className="flex items-center gap-3">
              <FileSearch size={20} className="text-indigo-400" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">No resume analyzed yet</p>
                <p className="text-white/30 text-xs">Upload your resume to get an ATS score and skill extraction</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </motion.section>

      {/* ── Roadmap Progress Card ── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        {resumeLoading ? (
          <div className="h-24 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
        ) : roadmapData ? (
          <div className="rounded-2xl border border-amber-500/20 bg-[#0d0d16] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Roadmap</span>
              </div>
              <button onClick={() => navigate("/learning-roadmap")} className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
                Continue <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex items-center gap-4 flex-shrink-0">
                {(() => {
                  const r = 24, circ = 2 * Math.PI * r;
                  return (
                    <>
                      <div className="relative w-16 h-16">
                        <svg width="64" height="64" viewBox="0 0 56 56" className="-rotate-90">
                          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                          <circle cx="28" cy="28" r={r} fill="none" stroke="#f59e0b" strokeWidth="4"
                            strokeDasharray={`${(roadmapPct / 100) * circ} ${circ}`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-amber-400">{roadmapPct}%</span>
                      </div>
                      <div>
                        <p className="text-white font-black text-base leading-none truncate max-w-[160px]">{roadmapData.targetRole || "Career Path"}</p>
                        <p className="text-white/30 text-xs mt-1">{roadmapDone}/{roadmapTotal} steps completed</p>
                        {roadmapData.duration && <p className="text-white/20 text-xs">{roadmapData.duration}</p>}
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="hidden md:block w-px bg-white/[0.06] self-stretch" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Roadmap Steps</p>
                <div className="space-y-2">
                  {(roadmapData.roadmap || []).slice(0, 4).map((step, i) => {
                    const title = typeof step === "string" ? step : step?.title || step?.month || `Step ${i + 1}`;
                    const done = roadmapData.completedSteps?.includes(title);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                          done ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-white/5 border border-white/10"
                        }`}>
                          {done && <CheckCircle size={10} className="text-emerald-400" />}
                        </div>
                        <span className={`text-sm truncate ${done ? "text-white/30 line-through" : "text-white/70"}`}>{title}</span>
                      </div>
                    );
                  })}
                  {(roadmapData.roadmap?.length || 0) > 4 && (
                    <p className="text-white/20 text-xs pl-7">+{roadmapData.roadmap.length - 4} more steps</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate("/learning-roadmap")}
            className="w-full flex items-center justify-between p-5 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-500/40 hover:bg-amber-500/[0.06] transition-all group">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-amber-400" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">No roadmap generated yet</p>
                <p className="text-white/30 text-xs">Generate a personalized career roadmap to track your progress</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </motion.section>

      {/* ── Profile Strength Card ── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
        {resumeLoading ? (
          <div className="h-20 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0d0d16] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Profile Strength</span>
              </div>
              <button onClick={() => navigate("/profile")} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                {profilePct < 100 ? "Complete Profile" : "View Profile"} <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex items-center gap-4 flex-shrink-0">
                {(() => { const r = 20, circ = 2 * Math.PI * r; return (
                  <div className="relative w-14 h-14">
                    <svg width="56" height="56" viewBox="0 0 48 48" className="-rotate-90">
                      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle cx="24" cy="24" r={r} fill="none" stroke="#10b981" strokeWidth="4"
                        strokeDasharray={`${(profilePct / 100) * circ} ${circ}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-400">{profilePct}%</span>
                  </div>
                ); })()}
                <div>
                  <p className="text-white font-black text-base">{profilePct === 100 ? "Complete!" : "Incomplete"}</p>
                  <p className="text-white/30 text-xs">{filledCount}/{profileFields.length} fields filled</p>
                </div>
              </div>
              <div className="hidden md:block w-px bg-white/[0.06] self-stretch" />
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                {profileFields.map((f, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
                    f.value ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/[0.03] text-white/20 border border-white/[0.05]"
                  }`}>
                    {f.value ? <CheckCircle size={12} className="flex-shrink-0" /> : <XCircle size={12} className="flex-shrink-0" />}
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {/* ── Resume-Driven Match Cards ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="mb-16"
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-1">Based on your Resume</h2>
            <p className="text-white/40 text-sm font-medium">
              {resumeAnalysis ? "Optimized matches extracted from your latest profile upload." : "Upload a resume to get personalized matches."}
            </p>
          </div>
          <button onClick={() => navigate("/resume-analyzer")} className="text-cyan-400 text-sm font-bold flex items-center gap-2 hover:underline">
            {resumeAnalysis ? "Re-analyze" : "Analyze Resume"} <ArrowRight size={16} />
          </button>
        </div>

        {resumeLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map(i => <div key={i} className="min-w-[320px] h-72 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse flex-shrink-0" />)}
          </div>
        ) : resumeAnalysis ? (
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
            {(resumeAnalysis.skills || []).slice(0, 3).map((skill, i) => (
              <div key={i} className="min-w-[320px] md:min-w-[380px] rounded-2xl overflow-hidden group hover:border-blue-400/50 transition-all cursor-pointer flex-shrink-0" style={glassStyle}>
                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
                  <Sparkles size={48} className="text-blue-400/30" />
                  <div className="absolute top-4 left-4 bg-blue-400/90 backdrop-blur px-3 py-1 rounded-full text-black font-bold text-xs">
                    {resumeAnalysis.metadata?.keywordMatchPct != null
                      ? `${resumeAnalysis.metadata.keywordMatchPct}% Match`
                      : `${Math.max(70, 99 - i * 7)}% Match`}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/50 uppercase font-bold">{skill}</span>
                  </div>
                  <h3 className="text-xl font-black mb-2 text-white">Opportunities for {skill}</h3>
                  <p className="text-white/40 text-sm line-clamp-2">Explore roles and resources that match your {skill} expertise from your resume.</p>
                </div>
              </div>
            ))}
            {/* Static card if fewer than 3 skills */}
            {(resumeAnalysis.skills?.length || 0) < 3 && (
              <div
                onClick={() => navigate("/resume-analyzer")}
                className="min-w-[320px] md:min-w-[380px] rounded-2xl overflow-hidden group hover:border-blue-400/50 transition-all cursor-pointer flex-shrink-0 flex items-center justify-center"
                style={{ ...glassStyle, minHeight: "240px" }}
              >
                <div className="text-center p-8">
                  <FileSearch size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm font-bold">Analyze your resume for more matches</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/resume-analyzer")}
            className="w-full flex items-center justify-between p-6 rounded-2xl border border-dashed border-blue-500/20 bg-blue-500/[0.03] hover:border-blue-500/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <FileSearch size={24} className="text-blue-400" />
              <div className="text-left">
                <p className="text-white font-bold">No resume analyzed yet</p>
                <p className="text-white/30 text-sm">Upload your resume to get personalized matches</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </motion.section>

      {/* ── Skill Gap Level Up ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-16 py-12 px-8 rounded-3xl"
        style={{ background: "rgba(25,27,35,0.8)", border: "1px solid rgba(66,71,84,0.3)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Zap size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Level Up Your Stack</h2>
              <p className="text-white/40 text-sm font-medium">Bridging the gap between where you are and where the market is going.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillGaps.map((gap, i) => (
              <div key={i} className="group p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer" style={glassStyle}>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <Zap size={20} className="text-emerald-400" />
                  </div>
                  <span className="bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{gap.salary}</span>
                </div>
                <h4 className="text-xl font-black text-white mb-2">{gap.title}</h4>
                <p className="text-white/40 text-sm mb-6 leading-relaxed">{gap.desc}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(78,222,163,0.5)]" style={{ width: gap.progress }} />
                  </div>
                  <span className="text-xs font-black text-emerald-400">Level Up ⚡</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Tabs + Feed Content ── */}
      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl w-fit mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={48} />
          <p className="text-white/20 font-bold uppercase tracking-widest text-sm">Curating your feed...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-red-500/5 border border-red-500/10 rounded-3xl">
          <AlertCircle className="text-red-400" size={40} />
          <p className="text-red-400/80 font-bold uppercase tracking-widest text-sm">{error}</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
          >
            {activeTab === "opportunities" ? (
              <>
                <h2 className="text-3xl font-black tracking-tight mb-8">Direct Opportunities</h2>
                {opportunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <Briefcase size={40} className="text-white/10 mb-4" />
                    <h3 className="text-xl font-bold text-white/30">No Opportunities available</h3>
                    <p className="text-white/10 text-sm mt-2">Check back later for new listings.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opp) => (
                      <motion.div
                        key={opp._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl overflow-hidden group hover:border-cyan-400/40 transition-all hover:bg-white/5"
                        style={glassStyle}
                      >
                        <OpportunityCard opportunity={opp} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {currentBlogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <Sparkles size={40} className="text-white/10 mb-4" />
                    <h3 className="text-xl font-bold text-white/30">Nothing to show right now</h3>
                    <p className="text-white/10 text-sm mt-2">Check back later for new content.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {currentBlogs.map((blog) => (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer"
                        onClick={() => handleBlogClick(blog)}
                      >
                        <BlogCard blog={blog} readOnly />
                        {activeTab === "personalized" && blog.feedScore > 0 && (
                          <div className="mt-2 text-[10px] text-violet-400/50 font-bold uppercase tracking-widest text-right px-2">
                            Match Score: {blog.feedScore.toFixed(1)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Footer strip ── */}
      <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="text-2xl font-black tracking-tight text-white mb-1">SkillRise AI</div>
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">© 2024 SkillRise AI. Systems Operational.</p>
        </div>
        <div className="flex gap-6">
          {["Legal", "Privacy", "Security", "Status"].map(l => (
            <span key={l} className="text-white/20 text-xs font-bold uppercase tracking-widest hover:text-cyan-400 cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
        <div className="flex gap-4">
          <Share2 size={20} className="text-cyan-400 cursor-pointer hover:scale-110 transition-transform" />
          <HeadphonesIcon size={20} className="text-cyan-400 cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  );
}
