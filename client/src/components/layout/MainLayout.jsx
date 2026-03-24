// import React, { useState } from "react";
// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import {
//   LayoutDashboard,
//   FileSearch,
//   Briefcase,
//   Map,
//   PlayCircle,
//   MessageSquare,
//   User,
//   LogOut,
//   Activity,
//   X,
//   ArrowLeft,
//   Bot
// } from "lucide-react";
// import Sidebar from "./Sidebar";

// /* ─────────────────────────────────────────────
//    Sidebar Nav Item
// ───────────────────────────────────────────── */
// const NavItem = ({ icon: Icon, label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`group relative w-full flex items-center justify-start gap-4 px-3 py-3 rounded-[14px] text-[14px] font-medium transition-all duration-300 text-left ${
//       active
//         ? "bg-white/[0.08] text-white shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-white/[0.05]"
//         : "text-white/40 border border-transparent hover:text-white/80 hover:bg-white/[0.03]"
//     }`}
//   >
//     <div
//       className={`w-9 h-9 flex-shrink-0 rounded-[10px] flex items-center justify-center transition-all duration-300 ${
//         active
//           ? "bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
//           : "bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/10"
//       }`}
//     >
//       <Icon size={18} strokeWidth={active ? 2.5 : 2} />
//     </div>
//     <span className="relative z-10 flex-1 tracking-wide">{label}</span>
//     {active && (
//       <div className="absolute left-0 w-1 h-[50%] top-1/2 -translate-y-1/2 rounded-r-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
//     )}
//   </button>
// );

// const RecentItem = ({ title, subtitle }) => (
//   <div className="group px-4 py-4 rounded-xl border border-transparent hover:border-white/[0.05] hover:bg-white/[0.02] cursor-pointer transition-all duration-200 text-left flex flex-col gap-1.5 w-full">
//     <p className="text-[14px] font-medium text-white/60 group-hover:text-white/90 transition-colors truncate">
//       {title}
//     </p>
//     <p className="text-[12px] font-bold tracking-widest uppercase text-white/30 truncate">
//       {subtitle}
//     </p>
//   </div>
// );

// const MainLayout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

//   const navItems = [
//     { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
//     { label: "Resume Analyzer", icon: FileSearch, path: "/resume-analyzer" },
//     { label: "Job Recommendations", icon: Briefcase, path: "/jobs" },
//     { label: "Career Roadmap", icon: Map, path: "/learning-roadmap" },
//     { label: "Agentic Chatbot", icon: Bot, path: "/chatbot" },
//     { label: "Mock Interview", icon: PlayCircle, path: "/new_mock" },
//     { label: "Feedback", icon: MessageSquare, path: "/feedback" },
//   ];

//   const recent = [
//     { title: "Skills Analysis for ML", tag: "today" },
//     { title: "Resume Feedback", tag: "today" },
//     { title: "Data Science Track", tag: "month" },
//     { title: "Interview Prep", tag: "month" },
//   ];

//   const activeRouteName =
//     navItems.find((item) => item.path === location.pathname)?.label ||
//     "Dashboard";

//   return (
//     <div
//       className={`grid ${
//         isRightSidebarOpen
//           ? isSidebarCollapsed
//             ? "grid-cols-[80px_1fr_300px]"
//             : "grid-cols-[260px_1fr_300px]"
//           : isSidebarCollapsed
//           ? "grid-cols-[80px_1fr]"
//           : "grid-cols-[260px_1fr]"
//       } gap-6 p-4 md:p-6 h-screen w-screen bg-[#06060a] overflow-hidden text-white font-sans transition-all duration-500`}
//     >
//       {/* LEFT SIDEBAR */}
//       <Sidebar
//         isCollapsed={isSidebarCollapsed}
//         toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//       />

//       {/* CENTER CONTENT */}
//       <main className="w-full h-full flex flex-col overflow-hidden bg-[#0a0a0f] border border-white/[0.06] rounded-[24px]">
//         <div className="flex items-center justify-between px-8 h-[72px] border-b border-white/[0.06] flex-shrink-0">
//           <div className="flex items-center gap-4">
//             {location.pathname !== "/dashboard" && location.pathname !== "/" && (
//               <button
//                 onClick={() => navigate(-1)}
//                 className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
//               >
//                 <ArrowLeft size={16} />
//               </button>
//             )}
//             <span className="text-[14px] font-bold tracking-wide uppercase text-white/50">
//               {activeRouteName}
//             </span>
//           </div>

//           <div className="flex items-center gap-6">
//             <button
//               onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
//               className="flex items-center gap-3 px-5 py-2.5 rounded-xl border bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
//             >
//               <Activity size={18} />
//               <span className="text-[12px] uppercase font-bold">
//                 Activity Log
//               </span>
//             </button>

//             <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black">
//               D
//             </div>
//           </div>
//         </div>

//         <div className="w-full h-full overflow-y-auto pt-8 pb-10">
//           <Outlet />
//         </div>
//       </main>

//       {/* RIGHT SIDEBAR */}
//       {isRightSidebarOpen && (
//         <aside className="w-[300px] flex flex-col border border-white/[0.06] bg-[#0a0a0f] rounded-[24px] overflow-hidden">
//           <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/[0.06]">
//             <p className="text-[14px] font-bold uppercase text-white/40">
//               Activity
//             </p>
//             <button
//               onClick={() => setIsRightSidebarOpen(false)}
//               className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
//             {recent.map((item, idx) => (
//               <RecentItem key={idx} title={item.title} subtitle={item.tag} />
//             ))}
//           </div>
//         </aside>
//       )}
//     </div>
//   );
// };

// export default MainLayout;

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div
      className={`grid ${
        isSidebarCollapsed
          ? "grid-cols-[80px_1fr]"
          : "grid-cols-[260px_1fr]"
      } gap-6 p-4 md:p-6 h-screen w-screen bg-[#06060a] overflow-hidden text-white font-sans transition-all duration-500`}
    >
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="w-full h-full overflow-y-auto bg-[#0a0a0f] border border-white/[0.06] rounded-[24px]">
        <div className="px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;