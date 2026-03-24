import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Compass, Loader2, AlertCircle, Briefcase } from "lucide-react";
import BlogCard from "../ngo/components/BlogCard";
import OpportunityCard from "../components/OpportunityCard";

const BASE_API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth").replace("/api/auth", "/api");

export default function FeedPage() {
  const [feedData, setFeedData] = useState({ personalized: [], trending: [], explore: [] });
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personalized");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        // Run both requests in parallel
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
        console.error("Feed error:", err);
        setError("Failed to load your feed. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [token]);

  const handleBlogClick = async (blog) => {
    // Basic interaction tracking (increment view)
    try {
      if (token) {
        await axios.post(`${BASE_API}/blogs/${blog._id}/interact`, { type: "view" }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error("Failed to track view", e);
    }
  };

  const TABS = [
    { id: "personalized", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "opportunities", label: "Opportunities", icon: Briefcase },
  ];

  const currentBlogs = feedData[activeTab] || [];

  return (
    <div className="w-full min-h-screen text-white pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Your Feed</h1>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-0.5">
              Personalized learning & opportunities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
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

      {/* Content */}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "opportunities" ? (
              // -- OPPORTUNITIES SECTION --
              opportunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                   <Briefcase size={40} className="text-white/10 mb-4" />
                   <h3 className="text-xl font-bold text-white/30">No Opportunities available</h3>
                   <p className="text-white/10 text-sm mt-2">Check back later for new listings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {opportunities.map((opp) => (
                    <motion.div
                      key={opp._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <OpportunityCard opportunity={opp} />
                    </motion.div>
                  ))}
                </div>
              )
            ) : ( 
              // -- BLOGS SECTION --
              currentBlogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                  {activeTab === "personalized" ? <Sparkles size={40} className="text-white/10 mb-4" /> :
                   activeTab === "trending" ? <TrendingUp size={40} className="text-white/10 mb-4" /> :
                   <Compass size={40} className="text-white/10 mb-4" />}
                  <h3 className="text-xl font-bold text-white/30">Nothing to show right now</h3>
                  <p className="text-white/10 text-sm mt-2">Check back later for new content.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentBlogs.map((blog) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
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
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
