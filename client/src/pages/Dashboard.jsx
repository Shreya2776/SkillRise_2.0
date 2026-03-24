import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlayCircle,
  Plus,
  Mic,
  FileSearch,
  Briefcase,
  Map,
  Binary,
  TrendingUp,
  ArrowRight,
  X,
  FileText,
  Sparkles,
  Zap,
  Compass
} from "lucide-react";

import FeatureModal from "../components/common/FeatureModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

/* ─────────────────────────────────────────────
   Feature Card Colors
───────────────────────────────────────────── */
const featureColors = {
  purple: {
    border: 'border-purple-500/30 hover:border-purple-400/60',
    shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    glow: 'from-purple-600/20 to-indigo-600/10 hover:from-purple-500/30 hover:to-indigo-500/20',
    iconText: 'text-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border-purple-500/50'
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    glow: 'from-emerald-600/20 to-teal-600/10 hover:from-emerald-500/30 hover:to-teal-500/20',
    iconText: 'text-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border-emerald-500/50'
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-400/60',
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    glow: 'from-amber-600/20 to-orange-600/10 hover:from-amber-500/30 hover:to-orange-500/20',
    iconText: 'text-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500/50'
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-400/60',
    shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]',
    glow: 'from-rose-600/20 to-pink-600/10 hover:from-rose-500/30 hover:to-pink-500/20',
    iconText: 'text-rose-300',
    iconBg: 'bg-gradient-to-br from-rose-500/30 to-pink-500/30 border-rose-500/50'
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    glow: 'from-cyan-600/20 to-blue-600/10 hover:from-cyan-500/30 hover:to-blue-500/20',
    iconText: 'text-cyan-300',
    iconBg: 'bg-gradient-to-br from-cyan-500/30 to-sky-500/30 border-cyan-500/50'
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-400/60',
    shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]',
    glow: 'from-indigo-600/20 to-blue-600/10 hover:from-indigo-500/30 hover:to-blue-500/20',
    iconText: 'text-indigo-300',
    iconBg: 'bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border-indigo-500/50'
  }
};

/* ─────────────────────────────────────────────
   Feature Card — Large Grid Style
───────────────────────────────────────────── */
const FeatureCard = ({ title, description, icon: Icon, onClick, colorName = "purple" }) => {
  const color = featureColors[colorName] || featureColors.purple;
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center w-full
        p-8 rounded-[2rem] text-center
        bg-[#11111a] backdrop-blur-3xl border border-white/5
        transition-all duration-500 hover:-translate-y-2 hover:border-white/10 hover:shadow-2xl
        min-h-[160px] overflow-hidden shadow-xl
      `}
    >
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br ${color.glow} pointer-events-none group-hover:opacity-100`} />

      <div className={`relative z-10 flex-shrink-0 w-14 h-14 mb-5 rounded-2xl border flex items-center justify-center ${color.iconText} ${color.iconBg} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
        <Icon size={24} strokeWidth={2} />
      </div>

      <div className="relative z-10 flex flex-col items-center mt-auto w-full">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-white/40 mt-2 leading-relaxed font-medium px-4">{description}</p>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};
  const username = user?.name || "Mate";
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);

    // remove token from URL (clean URL)
    window.history.replaceState({}, document.title, "/dashboard");
  }
}, []);
  const features = [
    { title: "AI Recommendations", description: "Jobs & programs matched to your skills", icon: Sparkles, path: "/recommendations", colorName: "purple" },
    { title: "Resume Analyzer", description: "Instant ATS feedback & structure review", icon: FileSearch, path: "/resume-analyzer", colorName: "indigo" },
    { title: "Personalized Feed", description: "Curated blogs & learning content for you", icon: Compass, path: "/feed", colorName: "emerald" },
    { title: "Career Roadmap", description: "Month-by-month journey to success", icon: Map, path: "/learning-roadmap", colorName: "amber" },
    { title: "Mock Interview", description: "High-pressure AI-driven simulations", icon: PlayCircle, path: "/interviews", colorName: "rose" },
    { title: "Skill Gap Analysis", description: "Find missing skills for your target role", icon: Binary, path: "/skill-gap", colorName: "cyan" },
  ];



  return (
    <>
      {/* Vibrant Background Gradients */}

      <style>{`
        @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes float-fast { 
           0%, 100% { transform: translateY(0px) translateX(0px); } 
           33% { transform: translateY(-10px) translateX(5px); }
           66% { transform: translateY(5px) translateX(-5px); }
        }
        .animate-slow-spin { animation: slow-spin 12s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 8s linear infinite; }
        .animate-neural-core { animation: pulse 4s ease-in-out infinite; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>

      <div className="relative z-10 w-full h-full flex flex-col gap-10 px-10">

        {/* Greeting */}
        <div className="w-full flex flex-col items-center text-center mt-4">
          
          {/* Advanced Neural Core Animation */}
          <div className="relative w-36 h-36 mb-6 flex items-center justify-center scale-90 md:scale-100">
            {/* Outer Orbiting Ring */}
            <div className="absolute inset-0 rounded-full border border-purple-500/10 border-t-purple-500/40 animate-slow-spin shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]" />
            {/* Mid Orbiting Ring */}
            <div className="absolute inset-4 rounded-full border border-white/5 border-b-white/20 animate-reverse-spin" />
            {/* Core Energy Field */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 backdrop-blur-3xl flex items-center justify-center p-1 border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.3)] animate-neural-core">
               <div className="w-full h-full rounded-full bg-white/40 blur-[1.5px] opacity-80" />
               {/* Tiny Rapid Particles */}
               {[...Array(4)].map((_, i) => (
                 <div 
                   key={i} 
                   className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px]"
                   style={{
                     animation: `float-fast ${2 + i}s infinite`,
                     left: `${20 + i * 15}%`,
                     top: `${20 + i * 15}%`
                   }}
                 />
               ))}
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Good Evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{username}.</span>
            <br />
            Ready for your next breakthrough?
          </h1>
        </div>



        {/* ── Modules Grid ── */}
        <div className="flex flex-col items-center gap-5 w-full mt-2">
          <div className="flex items-center justify-center gap-4 w-full opacity-60">
            <div className="h-px bg-gradient-to-r from-transparent to-white/20 flex-1" />
            <p className="text-[10px] font-bold tracking-[0.45em] uppercase text-white/40 whitespace-nowrap">
              Core Modules
            </p>
            <div className="h-px bg-gradient-to-l from-transparent to-white/20 flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-6 w-full pb-10">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} onClick={() => navigate(f.path)} />
            ))}
          </div>

          
        </div>

      </div>

      <FeatureModal
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        feature={selectedFeature}
      />
    </>
  );
};

export default Dashboard;