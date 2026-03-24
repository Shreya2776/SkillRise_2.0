import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CalendarCheck, Search, Loader2, AlertCircle,
  LayoutGrid, MapPin, Tag, Sparkles
} from "lucide-react";

import BlogCard from "../ngo/components/BlogCard";
import ProgramCard from "../ngo/components/ProgramCard";

const BASE_API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth").replace("/api/auth", "/api");

const TAB_OPTIONS = [
  { id: "blogs", label: "Blogs & Courses", icon: BookOpen },
  { id: "programs", label: "Programs & Drives", icon: CalendarCheck },
];

export default function CommunityPage() {
  const [blogs, setBlogs]         = useState([]);
  const [programs, setPrograms]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("blogs");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [blogsRes, programsRes] = await Promise.all([
          axios.get(`${BASE_API}/blogs`),
          axios.get(`${BASE_API}/programs`),
        ]);
        setBlogs(blogsRes.data.blogs || []);
        setPrograms(programsRes.data.programs || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load community content.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.skills.some(sk => sk.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrograms = programs.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.skills || []).some(sk => sk.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Community Hub</h1>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">
              Blogs, courses & programs from NGO partners
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          {TAB_OPTIONS.map(({ id, label, icon: Icon }) => (
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

        <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-full sm:w-auto sm:min-w-[300px]">
          <Search size={18} className="text-white/20 shrink-0" />
          <input
            type="text"
            placeholder="Search by title, skill, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm font-medium placeholder-white/20 w-full"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={48} />
          <p className="text-white/20 font-bold uppercase tracking-widest text-sm">Loading community content...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-red-500/5 border border-red-500/10 rounded-3xl">
          <AlertCircle className="text-red-400" size={40} />
          <p className="text-red-400/80 font-bold uppercase tracking-widest text-sm">{error}</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === "blogs" && (
            <motion.div
              key="blogs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              {filteredBlogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                  <BookOpen size={40} className="text-white/10 mb-4" />
                  <h3 className="text-xl font-bold text-white/30">No blogs found</h3>
                  <p className="text-white/10 text-sm mt-2">Check back later for new content from NGOs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBlogs.map(blog => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <BlogCard blog={blog} readOnly />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "programs" && (
            <motion.div
              key="programs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              {filteredPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                  <CalendarCheck size={40} className="text-white/10 mb-4" />
                  <h3 className="text-xl font-bold text-white/30">No programs found</h3>
                  <p className="text-white/10 text-sm mt-2">NGO partners haven't posted any programs yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPrograms.map(program => (
                    <motion.div
                      key={program._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ProgramCard program={program} readOnly />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
