// // client/src/admin/components/UserGrowthChart.jsx
// import { useMemo } from "react";
// import { TrendingUp, Calendar } from "lucide-react";

// export default function UserGrowthChart({ userGrowth = [] }) {
//   // Fill in missing days with 0 count for complete 30-day view
//   const completeData = useMemo(() => {
//     if (!userGrowth || userGrowth.length === 0) {
//       // Generate last 30 days with 0 count
//       const data = [];
//       for (let i = 29; i >= 0; i--) {
//         const date = new Date();
//         date.setDate(date.getDate() - i);
//         data.push({
//           _id: date.toISOString().split('T')[0],
//           date: date,
//           count: 0
//         });
//       }
//       return data;
//     }

//     // Create a map of existing data
//     const dataMap = {};
//     userGrowth.forEach(day => {
//       dataMap[day._id] = day.count;
//     });

//     // Fill in all 30 days
//     const data = [];
//     for (let i = 29; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateStr = date.toISOString().split('T')[0];
//       data.push({
//         _id: dateStr,
//         date: date,
//         count: dataMap[dateStr] || 0
//       });
//     }

//     return data;
//   }, [userGrowth]);

//   const maxCount = useMemo(() => {
//     const max = Math.max(...completeData.map(d => d.count));
//     return max > 0 ? max : 10; // Minimum scale of 10
//   }, [completeData]);

//   const totalGrowth = useMemo(() => {
//     return completeData.reduce((sum, day) => sum + day.count, 0);
//   }, [completeData]);

//   const avgDaily = useMemo(() => {
//     return (totalGrowth / 30).toFixed(1);
//   }, [totalGrowth]);

//   return (
//     <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
//             <TrendingUp className="w-5 h-5 text-blue-400" />
//             User Growth (Last 30 Days)
//           </h3>
//           <p className="text-xs text-white/40 mt-1">
//             Daily new user registrations
//           </p>
//         </div>
//         <div className="flex gap-6">
//           <div className="text-right">
//             <p className="text-2xl font-black text-white">{totalGrowth}</p>
//             <p className="text-xs text-white/40">Total New Users</p>
//           </div>
//           <div className="text-right">
//             <p className="text-2xl font-black text-blue-400">{avgDaily}</p>
//             <p className="text-xs text-white/40">Avg per Day</p>
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="relative h-64 flex items-end gap-1 bg-white/[0.02] rounded-2xl p-4">
//         {completeData.map((day, i) => {
//           const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
//           const isToday = i === completeData.length - 1;
          
//           return (
//             <div
//               key={i}
//               className="flex-1 flex flex-col items-center group relative"
//             >
//               {/* Bar */}
//               <div
//                 className={`w-full rounded-t transition-all duration-300 ${
//                   isToday 
//                     ? 'bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse' 
//                     : 'bg-gradient-to-t from-blue-500/60 to-purple-500/60 hover:from-blue-500 hover:to-purple-500'
//                 }`}
//                 style={{
//                   height: `${heightPercent}%`,
//                   minHeight: day.count > 0 ? "8px" : "2px"
//                 }}
//               />
              
//               {/* Date label - show every 5 days */}
//               {i % 5 === 0 && (
//                 <span className="text-[10px] text-white/40 mt-2 font-medium">
//                   {day.date.getDate()}/{day.date.getMonth() + 1}
//                 </span>
//               )}

//               {/* Tooltip on hover */}
//               <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
//                 <div className="bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
//                   <p className="text-white font-bold text-xs">{day.count} users</p>
//                   <p className="text-white/60 text-[10px]">
//                     {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Legend */}
//       <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/40">
//         <div className="flex items-center gap-2">
//           <Calendar className="w-3 h-3" />
//           <span>Hover over bars for details</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse" />
//           <span>Today</span>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useMemo } from "react";
import { TrendingUp, Calendar } from "lucide-react";

export default function UserGrowthChart({ userGrowth = [], currentRange = 30, onRangeChange }) {
  const [selectedRange, setSelectedRange] = useState(currentRange);

  // Fill in missing days with 0 count for complete view
  const completeData = useMemo(() => {
    if (!userGrowth || userGrowth.length === 0) {
      // Generate days with 0 count
      const data = [];
      for (let i = selectedRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          _id: date.toISOString().split('T')[0],
          date: date,
          count: 0
        });
      }
      return data;
    }

    // Create a map of existing data
    const dataMap = {};
    userGrowth.forEach(day => {
      dataMap[day._id] = day.count;
    });

    // Fill in all days
    const data = [];
    for (let i = selectedRange - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data.push({
        _id: dateStr,
        date: date,
        count: dataMap[dateStr] || 0
      });
    }

    return data;
  }, [userGrowth, selectedRange]);

  // Calculate max count for dynamic scaling
  const maxCount = useMemo(() => {
    const max = Math.max(...completeData.map(d => d.count));
    return max > 0 ? max : 10; // Minimum scale of 10
  }, [completeData]);

  const totalGrowth = useMemo(() => {
    return completeData.reduce((sum, day) => sum + day.count, 0);
  }, [completeData]);

  const avgDaily = useMemo(() => {
    return (totalGrowth / selectedRange).toFixed(1);
  }, [totalGrowth, selectedRange]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    if (onRangeChange) {
      onRangeChange(range);
    }
  };

  // Determine label frequency based on range
  const labelFrequency = selectedRange === 7 ? 1 : selectedRange === 30 ? 5 : 15;

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            User Growth (Last {selectedRange} Days)
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Daily new user registrations
          </p>
        </div>
        <div className="flex gap-6 items-center">
          {/* Time Range Buttons */}
          <div className="flex gap-2 bg-white/[0.03] rounded-xl p-1">
            <button
              onClick={() => handleRangeChange(7)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRange === 7
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => handleRangeChange(30)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRange === 30
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => handleRangeChange(90)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedRange === 90
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              90D
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-2xl font-black text-white">{totalGrowth}</p>
              <p className="text-xs text-white/40">Total New Users</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-400">{avgDaily}</p>
              <p className="text-xs text-white/40">Avg per Day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Y-Axis Labels + Chart */}
      <div className="flex gap-4">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between h-64 py-4 text-right">
          <span className="text-[10px] text-white/40 font-mono">{maxCount}</span>
          <span className="text-[10px] text-white/40 font-mono">{Math.floor(maxCount * 0.75)}</span>
          <span className="text-[10px] text-white/40 font-mono">{Math.floor(maxCount * 0.5)}</span>
          <span className="text-[10px] text-white/40 font-mono">{Math.floor(maxCount * 0.25)}</span>
          <span className="text-[10px] text-white/40 font-mono">0</span>
        </div>

        {/* Chart */}
        <div className="flex-1 relative h-64 flex items-end gap-1 bg-white/[0.02] rounded-2xl p-4 border-l border-white/[0.06]">
          {completeData.map((day, i) => {
            // Dynamic height calculation based on max value
            const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const isToday = i === completeData.length - 1;
            
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isToday 
                      ? 'bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse' 
                      : 'bg-gradient-to-t from-blue-500/60 to-purple-500/60 hover:from-blue-500 hover:to-purple-500'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    minHeight: day.count > 0 ? "8px" : "2px"
                  }}
                />
                
                {/* Date label - show based on range */}
                {i % labelFrequency === 0 && (
                  <span className="text-[10px] text-white/40 mt-2 font-medium">
                    {day.date.getDate()}/{day.date.getMonth() + 1}
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                  <div className="bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                    <p className="text-white font-bold text-xs">{day.count} users</p>
                    <p className="text-white/60 text-[10px]">
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-white/40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>Hover over bars for details</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-purple-500 animate-pulse" />
            <span>Today</span>
          </div>
        </div>
        <div className="text-white/30 font-mono">
          Max: {maxCount} users
        </div>
      </div>
    </div>
  );
}
