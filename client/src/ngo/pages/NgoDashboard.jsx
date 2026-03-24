import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, BookOpen, LayoutGrid, Search,
  AlertCircle, Loader2, CalendarCheck, LogOut, Briefcase
} from "lucide-react";

import BlogForm from "../components/BlogForm";
import BlogCard from "../components/BlogCard";
import ProgramForm from "../components/ProgramForm";
import ProgramCard from "../components/ProgramCard";
import OpportunityForm from "../components/OpportunityForm";
import OpportunityCard from "../../components/OpportunityCard";
// Base API configuration
const BASE_API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth").replace("/api/auth", "/api");
const BLOG_URL = `${BASE_API}/blogs`;
const PROGRAM_URL = `${BASE_API}/programs`;
const OPPORTUNITY_URL = `${BASE_API}/opportunities`;

const NAV_TABS = [
  { id: "blogs",     label: "Blog Posts",        icon: BookOpen },
  { id: "programs",  label: "Programs",          icon: CalendarCheck },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
];

export default function NgoDashboard() {
  const [blogs, setBlogs]             = useState([]);
  const [programs, setPrograms]       = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [activeTab, setActiveTab]     = useState("blogs");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BLOG_URL}/my`, axiosConfig);
      setBlogs(res.data.blogs);
    } catch (err) {
      setError("Failed to fetch blogs. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPrograms = async () => {
    try {
      const res = await axios.get(`${PROGRAM_URL}/my`, axiosConfig);
      setPrograms(res.data.programs);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  const fetchMyOpportunities = async () => {
    try {
      const res = await axios.get(`${OPPORTUNITY_URL}/my`, axiosConfig);
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
    fetchMyPrograms();
    fetchMyOpportunities();
  }, []);

  const handleCreateOrUpdateBlog = async (data, id) => {
    if (id) {
      const res = await axios.put(`${BLOG_URL}/${id}`, data, axiosConfig);
      setBlogs(blogs.map(b => b._id === id ? res.data.blog : b));
      setEditingBlog(null);
    } else {
      const res = await axios.post(BLOG_URL, data, axiosConfig);
      setBlogs([res.data.blog, ...blogs]);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`${BLOG_URL}/${id}`, axiosConfig);
        setBlogs(blogs.filter(b => b._id !== id));
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const handleCreateProgram = async (data) => {
    const res = await axios.post(PROGRAM_URL, data, axiosConfig);
    setPrograms([res.data.program, ...programs]);
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await axios.delete(`${PROGRAM_URL}/${id}`, axiosConfig);
        setPrograms(programs.filter(p => p._id !== id));
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const handleCreateOpportunity = async (data) => {
    const res = await axios.post(OPPORTUNITY_URL, data, axiosConfig);
    setOpportunities([res.data.opportunity, ...opportunities]);
  };

  const handleDeleteOpportunity = async (id) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        await axios.delete(`${OPPORTUNITY_URL}/${id}`, axiosConfig);
        setOpportunities(opportunities.filter(o => o._id !== id));
      } catch {
        alert("Delete failed.");
      }
    }
  };

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.skills.some(sk => sk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPrograms = programs.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.skills || []).some(sk => sk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOpportunities = opportunities.filter(o =>
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.skills || []).some(sk => sk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-white selection:bg-violet-500/30">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-cyan-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-white/10">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
                NGO Dashboard
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  SkillRise Partner Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats bar */}
            {!loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 px-4 py-2 bg-white/[0.03] border border-white/[0.07] rounded-xl"
            >
              <div className="flex items-center gap-1.5">
                <LayoutGrid size={13} className="text-violet-400" />
                <span className="text-xs font-bold text-white/50">
                  <span className="text-white">{blogs.length}</span> Blogs
                </span>
              </div>
              <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <CalendarCheck size={13} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white/50">
                    <span className="text-white">{programs.length}</span> Programs
                  </span>
                </div>
              <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Briefcase size={13} className="text-blue-400" />
                  <span className="text-xs font-bold text-white/50">
                    <span className="text-white">{opportunities.length}</span> Opps
                  </span>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-black/20"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </motion.header>

        {/* Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-1.5 mb-6 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl w-fit"
        >
          {NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === id
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </motion.nav>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* BLOGS TAB */}
          {activeTab === "blogs" && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left: Form */}
              <div className="lg:col-span-5">
                <div className="sticky top-12">
                  <BlogForm
                    onSubmit={handleCreateOrUpdateBlog}
                    initialData={editingBlog}
                    onCancel={() => setEditingBlog(null)}
                  />
                </div>
              </div>

              {/* Right: Blog list */}
              <div className="lg:col-span-7 space-y-8">
                {/* Search bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center gap-4 px-2 w-full sm:w-auto">
                    <Search size={20} className="text-white/20 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search courses or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-sm font-medium placeholder-white/20 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] rounded-xl border border-white/[0.08] text-[10px] font-black uppercase tracking-widest text-white/40 shrink-0">
                    <LayoutGrid size={14} />
                    {filteredBlogs.length} posts
                  </div>
                </div>

                {/* States */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-violet-500" size={40} />
                    <p className="text-white/20 font-bold uppercase tracking-widest text-sm">Synchronizing content...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 bg-red-500/5 border border-red-500/10 rounded-3xl">
                    <AlertCircle className="text-red-400" size={40} />
                    <p className="text-red-400/80 font-bold uppercase tracking-widest text-sm">{error}</p>
                  </div>
                ) : filteredBlogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 text-white/10">
                      <BookOpen size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white/30 tracking-tight">No content found</h3>
                    <p className="text-white/10 text-sm mt-2 max-w-xs text-center font-medium">
                      {searchTerm ? "Try a different search term" : "Create your first blog post to get started"}
                    </p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                      {filteredBlogs.map(blog => (
                        <motion.div
                          key={blog._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <BlogCard
                            blog={blog}
                            onDelete={handleDeleteBlog}
                            onEdit={(b) => {
                              setEditingBlog(b);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PROGRAMS TAB */}
          {activeTab === "programs" && (
            <motion.div
              key="programs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left: Form */}
              <div className="lg:col-span-5">
                <div className="sticky top-12">
                  <ProgramForm onSubmit={handleCreateProgram} />
                </div>
              </div>

              {/* Right: Programs list */}
              <div className="lg:col-span-7 space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center gap-4 px-2 w-full sm:w-auto">
                    <Search size={20} className="text-white/20 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search programs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-sm font-medium placeholder-white/20 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] rounded-xl border border-white/[0.08] text-[10px] font-black uppercase tracking-widest text-white/40 shrink-0">
                    <CalendarCheck size={14} />
                    {filteredPrograms.length} programs
                  </div>
                </div>

                {programs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 text-white/10">
                      <CalendarCheck size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white/30 tracking-tight">No programs yet</h3>
                    <p className="text-white/10 text-sm mt-2 max-w-xs text-center font-medium">
                      Create your first program to empower communities
                    </p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                      {filteredPrograms.map(program => (
                        <motion.div
                          key={program._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <ProgramCard program={program} onDelete={handleDeleteProgram} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* OPPORTUNITIES TAB */}
          {activeTab === "opportunities" && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-5">
                <div className="sticky top-12">
                  <OpportunityForm onSubmit={handleCreateOpportunity} />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-3xl backdrop-blur-sm">
                  <div className="flex items-center gap-4 px-2 w-full sm:w-auto">
                    <Search size={20} className="text-white/20 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-sm font-medium placeholder-white/20 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] rounded-xl border border-white/[0.08] text-[10px] font-black uppercase tracking-widest text-white/40 shrink-0">
                    <Briefcase size={14} />
                    {filteredOpportunities.length} opps
                  </div>
                </div>

                {opportunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 text-white/10">
                      <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white/30 tracking-tight">No opportunities yet</h3>
                    <p className="text-white/10 text-sm mt-2 max-w-xs text-center font-medium">
                      Create your first opportunity to hire or train people
                    </p>
                  </div>
                ) : (
                  <motion.div layout className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                      {filteredOpportunities.map(opp => (
                        <motion.div
                          key={opp._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <OpportunityCard opportunity={opp} onDelete={handleDeleteOpportunity} showDelete={true} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
