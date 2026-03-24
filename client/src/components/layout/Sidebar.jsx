
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  Compass,
  Map,
  Bot,
  Mic,
  MessageSquare,
  Sparkles,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Command
} from "lucide-react";
import { cn } from "../../services/utils";

const user = JSON.parse(localStorage.getItem("user") || "{}");
const username = user?.name || "User";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Sparkles, label: "AI Recommendations", path: "/recommendations" },
    { icon: FileSearch, label: "Resume Analyzer", path: "/resume-analyzer" },
    { icon: Compass, label: "Personalized Feed", path: "/feed" },
    { icon: Map, label: "Career Roadmap", path: "/learning-roadmap" },
    { icon: Bot, label: "Agentic Chatbot", path: "/chatbot" },
    { icon: Mic, label: "Mock Interview", path: "/interviews" },
    { icon: MessageSquare, label: "Feedback", path: "/feedback" }
  ];

  return (
    <aside
      className={cn(
        "h-full bg-[#0a0a0f] border border-white/[0.06] rounded-[24px] flex flex-col relative transition-all duration-300",
        isCollapsed ? "w-[84px]" : "w-[260px]"
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 bg-[#0f0f0f] border border-white/10 rounded-lg p-1.5 hover:bg-white/10 transition"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
          <Command size={18} className="text-black" />
        </div>

        {!isCollapsed && (
          <span className="text-[17px] font-bold tracking-tight text-white">
            SkillRise
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-3 py-6">
        {menuItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-xl transition-all duration-200",
                isCollapsed
                  ? "justify-center h-11 w-11 mx-auto"
                  : "gap-4 px-4 h-11",
                isActive
                  ? "bg-white/10 text-white border border-white/5"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )
            }
          >
            <item.icon size={20} strokeWidth={2} className="flex-shrink-0" />

            {!isCollapsed && (
              <span className="text-[14px] font-medium tracking-wide">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col">

        {/* Profile + Logout */}
        <div className="border-t border-white/[0.05] px-3 py-6 flex flex-col gap-3">

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-xl transition-all duration-200",
                isCollapsed
                  ? "justify-center h-11 w-11 mx-auto"
                  : "gap-4 px-4 h-11",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )
            }
          >
            <User size={20} />
            {!isCollapsed && (
              <span className="text-[14px] font-medium">Profile</span>
            )}
          </NavLink>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 text-white/40 hover:text-red-400 hover:bg-red-400/10",
              isCollapsed
                ? "justify-center h-11 w-11 mx-auto"
                : "gap-4 px-4 h-11"
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && (
              <span className="text-[14px] font-medium">Logout</span>
            )}
          </button>

        </div>

        {/* Welcome User */}

      </div>
    </aside>
  );
};

export default Sidebar;