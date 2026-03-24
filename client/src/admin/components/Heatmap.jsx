

// import { useState, useEffect } from "react";
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   ZoomableGroup,
// } from "react-simple-maps";
// import { X, Users, AlertTriangle, MapPin } from "lucide-react";

// const INDIA_TOPO_JSON =
//   "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States";

// export default function Heatmap({ stateData: propStateData = [] }) {
//   const [tooltip, setTooltip] = useState(null);
//   const [selectedState, setSelectedState] = useState(null);
//   const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
//   const [geoLoaded, setGeoLoaded] = useState(false);

//   // Create flexible state data map
//   const stateDataMap = {};
  
//   propStateData.forEach((s) => {
//     const stateInfo = {
//       state: s.state,
//       totalUsers: s.count,
//       gapLevel: s.count < 5 ? "Critical" : s.count < 15 ? "Moderate" : "Good",
//       gapColor: s.count < 5 ? "#ef4444" : s.count < 15 ? "#f59e0b" : "#10b981"
//     };
    
//     // Store with multiple variations for matching
//     const stateName = s.state.trim();
//     stateDataMap[stateName] = stateInfo;
//     stateDataMap[stateName.toLowerCase()] = stateInfo;
//     stateDataMap[stateName.toUpperCase()] = stateInfo;
//     stateDataMap[stateName.replace(/\s+/g, '')] = stateInfo;
//     stateDataMap[stateName.replace(/\s+/g, '').toLowerCase()] = stateInfo;
//   });

//   useEffect(() => {
//     console.log("📊 Heatmap received state data:", propStateData);
//     console.log("🗺️ State data map keys:", Object.keys(stateDataMap).slice(0, 10));
//   }, [propStateData]);

//   const getStateName = (geo) => {
//     // The GeoJSON uses 'st_nm' property (lowercase)
//     const geoProps = geo.properties;
//     return geoProps.st_nm || geoProps.ST_NM || geoProps.name || geoProps.NAME || geoProps.state || geoProps.STATE || null;
//   };

//   const getData = (geoName) => {
//     if (!geoName) return null;
    
//     // Try multiple matching strategies
//     return stateDataMap[geoName] || 
//            stateDataMap[geoName.toLowerCase()] ||
//            stateDataMap[geoName.toUpperCase()] ||
//            stateDataMap[geoName.replace(/\s+/g, '')] ||
//            stateDataMap[geoName.replace(/\s+/g, '').toLowerCase()];
//   };

//   const getColor = (geoName) => {
//     const data = getData(geoName);
//     if (!data) return "rgba(255,255,255,0.04)";

//     if (data.totalUsers < 5) return "rgba(239, 68, 68, 0.6)";
//     if (data.totalUsers < 15) return "rgba(245, 158, 11, 0.5)";
//     return "rgba(34, 197, 94, 0.5)";
//   };

//   const handleMouseEnter = (geo, evt) => {
//     const name = getStateName(geo);
//     const data = getData(name);
    
//     console.log(`🖱️ Hovering: "${name}" | Data found:`, data ? `✅ ${data.totalUsers} users` : "❌ No data");
    
//     setTooltip({ name, data });
//     setTooltipPos({ x: evt.clientX, y: evt.clientY });
//   };

//   return (
//     <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 relative">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-black text-white uppercase tracking-tight">
//             🗺️ India User Distribution Heatmap
//           </h3>
//           <p className="text-xs text-white/40 mt-1">
//             Hover over states to explore — Click for details
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1.5">
//             <div className="w-3 h-3 rounded-full bg-red-500" />
//             <span className="text-[10px] text-white/50 font-semibold">Critical (&lt;5)</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <div className="w-3 h-3 rounded-full bg-amber-500" />
//             <span className="text-[10px] text-white/50 font-semibold">Moderate (5-15)</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <div className="w-3 h-3 rounded-full bg-emerald-500" />
//             <span className="text-[10px] text-white/50 font-semibold">Good (&gt;15)</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <div className="w-3 h-3 rounded-full bg-white/10" />
//             <span className="text-[10px] text-white/50 font-semibold">No Data</span>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <div className="flex-1 relative" style={{ minHeight: 500 }}>
//           <ComposableMap
//             projection="geoMercator"
//             projectionConfig={{
//               scale: 1100,
//               center: [82, 22],
//             }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
//               <Geographies geography={INDIA_TOPO_JSON}>
//                 {({ geographies }) => {
//                   // Log GeoJSON properties once for debugging
//                   if (!geoLoaded && geographies.length > 0) {
//                     setGeoLoaded(true);
//                     const firstGeo = geographies[0];
//                     console.log("🗺️ GeoJSON first item properties:", firstGeo.properties);
//                     console.log("🗺️ All property keys:", Object.keys(firstGeo.properties));
                    
//                     const geoNames = geographies.map(g => getStateName(g));
//                     console.log("🗺️ GeoJSON state names:", geoNames);
//                   }
                  
//                   return geographies.map((geo) => {
//                     const name = getStateName(geo);
                    
//                     return (
//                       <Geography
//                         key={geo.rsmKey}
//                         geography={geo}
//                         fill={getColor(name)}
//                         stroke="rgba(255,255,255,0.12)"
//                         strokeWidth={0.5}
//                         style={{
//                           default: { outline: "none" },
//                           hover: {
//                             fill: "rgba(139, 92, 246, 0.6)",
//                             stroke: "rgba(139, 92, 246, 0.8)",
//                             strokeWidth: 1.5,
//                             outline: "none",
//                             cursor: "pointer",
//                           },
//                           pressed: { outline: "none" },
//                         }}
//                         onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
//                         onMouseLeave={() => setTooltip(null)}
//                         onClick={() => {
//                           const data = getData(name);
//                           setSelectedState({ name, data });
//                         }}
//                       />
//                     );
//                   });
//                 }}
//               </Geographies>
//             </ZoomableGroup>
//           </ComposableMap>

//           {tooltip && tooltip.name && (
//             <div
//               className="fixed z-50 pointer-events-none bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl min-w-[220px]"
//               style={{
//                 left: tooltipPos.x + 16,
//                 top: tooltipPos.y - 10,
//               }}
//             >
//               <p className="text-white font-bold text-sm mb-2">{tooltip.name}</p>
//               {tooltip.data ? (
//                 <div className="space-y-1.5 text-xs">
//                   <p className="text-white/60">
//                     Users: <span className="text-white font-bold">{tooltip.data.totalUsers}</span>
//                   </p>
//                   <p className="text-white/60">
//                     Status:{" "}
//                     <span className="font-bold" style={{ color: tooltip.data.gapColor }}>
//                       {tooltip.data.gapLevel}
//                     </span>
//                   </p>
//                 </div>
//               ) : (
//                 <p className="text-white/40 text-xs">No user data available</p>
//               )}
//             </div>
//           )}
//         </div>

//         {selectedState && selectedState.name && (
//           <div className="w-80 shrink-0 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 animate-in slide-in-from-right-5 space-y-5 relative">
//             <button
//               onClick={() => setSelectedState(null)}
//               className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
//             >
//               <X className="w-4 h-4" />
//             </button>

//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center">
//                 <MapPin className="w-5 h-5 text-violet-400" />
//               </div>
//               <div>
//                 <h4 className="text-white font-bold text-base">{selectedState.name}</h4>
//                 <p className="text-xs text-white/40">State Overview</p>
//               </div>
//             </div>

//             {selectedState.data ? (
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="bg-white/[0.04] rounded-2xl p-4 text-center">
//                   <Users className="w-5 h-5 text-violet-400 mx-auto mb-1" />
//                   <p className="text-2xl font-black text-white">{selectedState.data.totalUsers}</p>
//                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Users</p>
//                 </div>
//                 <div className="bg-white/[0.04] rounded-2xl p-4 text-center">
//                   <AlertTriangle className="w-5 h-5 mx-auto mb-1" style={{ color: selectedState.data.gapColor }} />
//                   <p className="text-2xl font-black" style={{ color: selectedState.data.gapColor }}>
//                     {selectedState.data.gapLevel}
//                   </p>
//                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Status</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-white/30 text-sm">No user data for this state yet.</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// client/src/admin/components/Heatmap.jsx
import { useState, useEffect, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { X, Users, AlertTriangle, MapPin } from "lucide-react";

const INDIA_TOPO_JSON =
  "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States";

export default function Heatmap({ stateData: propStateData = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [stateDataMap, setStateDataMap] = useState({});
  const geoLoggedRef = useRef(false);

  // Pre-calculate complete state data map on component mount or data change
  useEffect(() => {
    console.log("📊 Heatmap received state data:", propStateData);
    
    const dataMap = {};
    
    // Process ALL states from backend (including count: 0 states)
    propStateData.forEach((s) => {
      const stateInfo = {
        state: s.state,
        totalUsers: s.count,
        gapLevel: s.gapLevel || (s.count === 0 ? "No Data" : 
                                  s.count < 5 ? "Critical" : 
                                  s.count < 15 ? "Moderate" : "Good"),
        gapColor: s.gapColor || (s.count === 0 ? "#6b7280" :
                                 s.count < 5 ? "#ef4444" : 
                                 s.count < 15 ? "#f59e0b" : "#10b981")
      };
      
      // Store with multiple variations for flexible GeoJSON matching
      const stateName = s.state.trim();
      
      // Store exact name
      dataMap[stateName] = stateInfo;
      dataMap[stateName.toLowerCase()] = stateInfo;
      dataMap[stateName.toUpperCase()] = stateInfo;
      
      // Store without spaces
      dataMap[stateName.replace(/\s+/g, '')] = stateInfo;
      dataMap[stateName.replace(/\s+/g, '').toLowerCase()] = stateInfo;
      
      // Store shortened versions for GeoJSON matching
      // "Andaman and Nicobar Islands" → "Andaman and Nicobar"
      if (stateName.includes('Islands')) {
        const shortened = stateName.replace(' Islands', '');
        dataMap[shortened] = stateInfo;
        dataMap[shortened.toLowerCase()] = stateInfo;
      }
      
      // "Dadra and Nagar Haveli and Daman and Diu" → "Dadra and Nagar Haveli"
      if (stateName.includes('Dadra')) {
        dataMap['Dadra and Nagar Haveli'] = stateInfo;
        dataMap['dadra and nagar haveli'] = stateInfo;
      }
    });
    
    setStateDataMap(dataMap);
    console.log("🗺️ Complete state data map created with", Object.keys(dataMap).length, "entries");
    console.log("🗺️ Sample keys:", Object.keys(dataMap).slice(0, 10));
  }, [propStateData]);

  const getStateName = (geo) => {
    const geoProps = geo.properties;
    // ✅ FIXED: Use NAME_1 which is the actual property in this GeoJSON
    return geoProps.NAME_1 || geoProps.name || geoProps.state || geoProps.ST_NM || geoProps.st_nm || null;
  };

  const getData = (geoName) => {
    if (!geoName) return null;
    
    // Try multiple matching strategies
    const result = stateDataMap[geoName] || 
           stateDataMap[geoName.toLowerCase()] ||
           stateDataMap[geoName.toUpperCase()] ||
           stateDataMap[geoName.replace(/\s+/g, '')] ||
           stateDataMap[geoName.replace(/\s+/g, '').toLowerCase()];
    
    if (!result) {
      console.log(`⚠️ No match found for: "${geoName}"`);
    }
    
    return result;
  };

  const getColor = (geoName) => {
    const data = getData(geoName);
    if (!data) return "rgba(255,255,255,0.04)"; // Fallback for unmatched states

    // Use pre-calculated colors from backend
    if (data.totalUsers === 0) return "rgba(107, 114, 128, 0.3)"; // Gray for no data
    if (data.totalUsers < 5) return "rgba(239, 68, 68, 0.6)"; // Red - Critical
    if (data.totalUsers < 15) return "rgba(245, 158, 11, 0.5)"; // Orange - Moderate
    return "rgba(34, 197, 94, 0.5)"; // Green - Good
  };

  const handleMouseEnter = (geo, evt) => {
    const name = getStateName(geo);
    const data = getData(name);
    
    console.log(`🖱️ Hovering: "${name}" | Data:`, data ? `✅ ${data.totalUsers} users (${data.gapLevel})` : "❌ No data");
    
    setTooltip({ name, data });
    setTooltipPos({ x: evt.clientX, y: evt.clientY });
  };

  const logGeoData = (geographies) => {
    if (!geoLoggedRef.current && geographies.length > 0) {
      geoLoggedRef.current = true;
      const firstGeo = geographies[0];
      console.log("🗺️ GeoJSON first item properties:", firstGeo.properties);
      console.log("🗺️ All property keys:", Object.keys(firstGeo.properties));
      
      const geoNames = geographies.map(g => getStateName(g));
      console.log("🗺️ GeoJSON state names:", geoNames);
      
      // Log first 5 state names for debugging
      console.log("🗺️ First 5 states from GeoJSON:", geoNames.slice(0, 5));
    }
  };

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            🗺️ India User Distribution Heatmap
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Hover over states to explore — Click for details
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] text-white/50 font-semibold">Critical (&lt;5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] text-white/50 font-semibold">Moderate (5-15)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-white/50 font-semibold">Good (&gt;15)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-[10px] text-white/50 font-semibold">No Data</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 relative" style={{ minHeight: 500 }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1100,
              center: [82, 22],
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
              <Geographies geography={INDIA_TOPO_JSON}>
                {({ geographies }) => {
                  logGeoData(geographies);
                  
                  return geographies.map((geo) => {
                    const name = getStateName(geo);
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getColor(name)}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: "rgba(139, 92, 246, 0.6)",
                            stroke: "rgba(139, 92, 246, 0.8)",
                            strokeWidth: 1.5,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                          const data = getData(name);
                          setSelectedState({ name, data });
                        }}
                      />
                    );
                  });
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {tooltip && tooltip.name && (
            <div
              className="fixed z-50 pointer-events-none bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-2xl min-w-[220px]"
              style={{
                left: tooltipPos.x + 16,
                top: tooltipPos.y - 10,
              }}
            >
              <p className="text-white font-bold text-sm mb-2">{tooltip.name}</p>
              {tooltip.data ? (
                <div className="space-y-1.5 text-xs">
                  <p className="text-white/60">
                    Users: <span className="text-white font-bold">{tooltip.data.totalUsers}</span>
                  </p>
                  <p className="text-white/60">
                    Status:{" "}
                    <span className="font-bold" style={{ color: tooltip.data.gapColor }}>
                      {tooltip.data.gapLevel}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-white/40 text-xs">No user data available</p>
              )}
            </div>
          )}
        </div>

        {selectedState && selectedState.name && (
          <div className="w-80 shrink-0 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 animate-in slide-in-from-right-5 space-y-5 relative">
            <button
              onClick={() => setSelectedState(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">{selectedState.name}</h4>
                <p className="text-xs text-white/40">State Overview</p>
              </div>
            </div>

            {selectedState.data ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.04] rounded-2xl p-4 text-center">
                  <Users className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{selectedState.data.totalUsers}</p>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Users</p>
                </div>
                <div className="bg-white/[0.04] rounded-2xl p-4 text-center">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-1" style={{ color: selectedState.data.gapColor }} />
                  <p className="text-2xl font-black" style={{ color: selectedState.data.gapColor }}>
                    {selectedState.data.gapLevel}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Status</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm">No user data for this state yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}