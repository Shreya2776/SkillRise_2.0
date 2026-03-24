
// import { useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import StatsCard from "../components/StatsCard";
// import Heatmap from "../components/Heatmap";
// import SkillChart from "../components/SkillChart";
// import Insights from "../components/Insights";
// import TrendingSkills from "../components/TrendingSkills";
// import UserGrowthChart from "../components/UserGrowthChart";
// import { getAdminStats } from "../../services/adminApi";

// export default function Dashboard() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const fetchStats = async () => {
//     try {
//       console.log("🔄 Fetching admin stats...");
//       const response = await getAdminStats();
//       if (response.success) {
//         console.log("✅ Stats received:", response.data);
//         setStats(response.data);
//         setLastUpdated(new Date(response.data.lastUpdated));
//       }
//     } catch (error) {
//       console.error("❌ Failed to fetch stats:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats();

//     // WebSocket for real-time updates
//     const socket = io("http://localhost:8000");

//     socket.on("connect", () => {
//       console.log("🔌 Connected to real-time updates");
//     });

//     socket.on("stats-update", () => {
//       console.log("📊 Stats updated - refreshing...");
//       fetchStats();
//     });

//     // Auto-refresh every 30 seconds
//     const interval = setInterval(fetchStats, 30000);

//     return () => {
//       socket.disconnect();
//       clearInterval(interval);
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-white text-xl">Loading dashboard...</div>
//       </div>
//     );
//   }

//   if (!stats) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-red-500 text-xl">Failed to load dashboard data</div>
//       </div>
//     );
//   }

//   const topSkill = stats.topSkills?.[0];

//   return (
//     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       {/* Page Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-black text-white tracking-tight">
//             Admin Dashboard
//           </h1>
//           <p className="text-sm text-white/40 mt-1 font-medium">
//             Real-time overview of SkillRise across India
//           </p>
//         </div>
//         <div className="text-right">
//           <div className="flex items-center gap-2 text-green-400 text-sm">
//             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//             Live
//           </div>
//           {lastUpdated && (
//             <p className="text-xs text-white/30 mt-1">
//               Updated: {lastUpdated.toLocaleTimeString()}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Stats Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         <StatsCard
//           type="users"
//           label="Total Users"
//           value={stats.totalUsers}
//           sub={`+${stats.recentUsers} this week`}
//         />
//         <StatsCard
//           type="ngos"
//           label="Registered NGOs"
//           value={stats.totalNgos}
//           sub="Partner organizations"
//         />
//         <StatsCard
//           type="states"
//           label="Active States"
//           value={stats.activeStates}
//           sub="With user presence"
//         />
//         <StatsCard
//           type="skill"
//           label="Top Demand Skill"
//           value={topSkill?.skill || "—"}
//           sub={`${topSkill?.percentage || 0}% of users`}
//         />
//       </div>

//       {/* India Heatmap */}
//       <Heatmap stateData={stats.stateAnalytics || []} />

//       {/* User Growth Chart */}
//       <UserGrowthChart userGrowth={stats.userGrowth || []} />

//       {/* Charts + Side panels */}
//       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//         <div className="xl:col-span-8">
//           <SkillChart skillsData={stats.topSkills || []} />
//         </div>
//         <div className="xl:col-span-4 space-y-8">
//           <TrendingSkills skills={stats.topSkills || []} />
//         </div>
//       </div>

//       {/* Insights */}
//       <Insights stats={stats} />
//     </div>
//   );
// }


// client/src/admin/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import StatsCard from "../components/StatsCard";
import Heatmap from "../components/Heatmap";
import SkillChart from "../components/SkillChart";
import TrendingSkills from "../components/TrendingSkills";
import AIInsights from "../components/AIInsights";
import PolicyRecommender from "../components/PolicyRecommender";
import UserGrowthChart from "../components/UserGrowthChart";
import { getAdminStats } from "../../services/adminApi";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      console.log("🔄 Fetching admin stats...");
      const response = await getAdminStats();
      if (response.success) {
        console.log("✅ Stats received:", response.data);
        setStats(response.data);
        setLastUpdated(new Date(response.data.lastUpdated));
      }
    } catch (error) {
      console.error("❌ Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // WebSocket for real-time updates
    const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api/auth", "") : "http://localhost:8000");

    socket.on("connect", () => {
      console.log("🔌 Connected to real-time updates");
    });

    socket.on("stats-update", () => {
      console.log("📊 Stats updated - refreshing...");
      fetchStats();
    });

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-xl">Failed to load dashboard data</div>
      </div>
    );
  }

  const topSkill = stats.topSkills?.[0];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-white/40 mt-1 font-medium">
            Real-time overview of SkillRise across India
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live
          </div>
          {lastUpdated && (
            <p className="text-xs text-white/30 mt-1">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          type="users"
          label="Total Users"
          value={stats.totalUsers}
          sub={`+${stats.recentUsers} this week`}
        />
        <StatsCard
          type="ngos"
          label="Registered NGOs"
          value={stats.totalNgos}
          sub="Partner organizations"
        />
        <StatsCard
          type="states"
          label="Active States"
          value={stats.activeStates}
          sub="With user presence"
        />
        <StatsCard
          type="skill"
          label="Top Demand Skill"
          value={topSkill?.skill || "—"}
          sub={`${topSkill?.percentage || 0}% of users`}
        />
      </div>

      {/* India Heatmap */}
      <Heatmap stateData={stats.stateAnalytics || []} />

      {/* User Growth Chart */}
      <UserGrowthChart userGrowth={stats.userGrowth || []} />

      {/* Skills and Trending */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <SkillChart skillsData={stats.topSkills || []} />
        </div>
        <div className="xl:col-span-4">
          <TrendingSkills skills={stats.topSkills || []} />
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights insights={stats.aiInsights || []} />

      {/* Policy Recommendations */}
      <PolicyRecommender recommendations={stats.policyRecommendations || []} />
    </div>
  );
}
