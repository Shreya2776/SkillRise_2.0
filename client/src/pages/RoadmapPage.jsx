// import { useState } from "react";
// import { useRoadmap } from "../hooks/useRoadmap";
// import Roadmap from "../components/Roadmap/RoadmapContainer";

// export default function RoadmapPage() {
//   const { roadmap, generate, update, careerSwitchGenerate, error, loading } = useRoadmap();
//   const [showUpdateForm, setShowUpdateForm] = useState(false);
//   const [pdfFile, setPdfFile] = useState(null);
//   const [targetRole, setTargetRole] = useState("");
//   const [duration, setDuration] = useState("");

//   const handleGenerate = async () => {
//     // Create a simple profile from user input or defaults
//     const profile = {
//       name: "User",
//       targetRole: targetRole || "Software Developer",
//       duration: duration || "6 months",
//       resume: "Looking to advance my career in tech",
//       skills: ["Programming", "Problem Solving"],
//       experience: "Beginner to Intermediate"
//     };

//     try {
//       await generate({ profile });
//     } catch (error) {
//       console.error("Generation failed:", error);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!pdfFile || !targetRole || !duration) {
//       alert("Please provide PDF, target role, and duration");
//       return;
//     }

//     const saved = JSON.parse(localStorage.getItem("progress")) || {};
//     const formData = new FormData();
//     formData.append("resume", pdfFile);
//     formData.append("targetRole", targetRole);
//     formData.append("duration", duration);
//     formData.append("completedSteps", JSON.stringify(Object.keys(saved).filter((k) => saved[k])));

//     try {
//       await update(formData);
//       setShowUpdateForm(false);
//     } catch (error) {
//       console.error("Update failed:", error);
//     }
//   };

//   const handleCareerSwitch = async () => {
//     if (!pdfFile || !targetRole || !duration) {
//       alert("Please provide PDF, target role, and duration");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("resume", pdfFile);
//     formData.append("targetRole", targetRole);
//     formData.append("duration", duration);

//     try {
//       await careerSwitchGenerate(formData);
//       setShowUpdateForm(false);
//     } catch (error) {
//       console.error("Career switch generation failed:", error);
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="mb-6 space-y-4">
//         {/* Quick Generate Section */}
//         <div className="border border-blue-600 rounded p-4 space-y-4">
//           <h3 className="text-lg font-semibold">Quick Generate Roadmap</h3>
          
//           <div>
//             <label className="block mb-2 text-sm font-medium">Target Role (Optional)</label>
//             <input
//               type="text"
//               value={targetRole}
//               onChange={(e) => setTargetRole(e.target.value)}
//               placeholder="e.g., Frontend Developer (default: Software Developer)"
//               className="block w-full border rounded px-3 py-2"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label className="block mb-2 text-sm font-medium">Duration (Optional)</label>
//             <input
//               type="text"
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//               placeholder="e.g., 6 months (default: 6 months)"
//               className="block w-full border rounded px-3 py-2"
//               disabled={loading}
//             />
//           </div>
//           <div className="flex gap-4"></div>
//           <button
//             onClick={handleGenerate}
//             disabled={loading}
//             className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? "⏳ Generating..." : "Generate Roadmap"}
//           </button>

//         </div>

//         {/* Update Section */}
//         <div className="flex gap-4">
//           <button
//             onClick={() => setShowUpdateForm(!showUpdateForm)}
//             disabled={loading}
//             className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
//           >
//             {showUpdateForm ? "Cancel Update" : "Update Roadmap with Resume"}
//           </button>
//         </div>

//         {showUpdateForm && (
//           <div className="border border-gray-600 rounded p-4 space-y-4">
//             <h3 className="text-lg font-semibold">Update Roadmap with Resume</h3>
            
//             <div>
//               <label className="block mb-2 text-sm font-medium">Upload Resume (PDF)</label>
//               <input
//                 type="file"
//                 accept=".pdf"
//                 onChange={(e) => setPdfFile(e.target.files[0])}
//                 className="block w-full text-sm border rounded px-3 py-2"
//                 disabled={loading}
//               />
//             </div>

//             <div>
//               <label className="block mb-2 text-sm font-medium">Target Role</label>
//               <input
//                 type="text"
//                 value={targetRole}
//                 onChange={(e) => setTargetRole(e.target.value)}
//                 placeholder="e.g., Frontend Developer"
//                 className="block w-full border rounded px-3 py-2"
//                 disabled={loading}
//               />
//             </div>

//             <div>
//               <label className="block mb-2 text-sm font-medium">Duration</label>
//               <input
//                 type="text"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 placeholder="e.g., 6 months"
//                 className="block w-full border rounded px-3 py-2"
//                 disabled={loading}
//               />
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={handleUpdate}
//                 disabled={loading}
//                 className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
//               >
//                 Submit Update
//               </button>

//               <button
//                 onClick={handleCareerSwitch}
//                 disabled={loading}
//                 className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
//               >
//                 Career Switch Mode
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {loading && (
//         <div className="bg-blue-900/30 border border-blue-500 text-blue-200 px-4 py-3 rounded mb-4">
//           <div className="flex items-center gap-3">
//             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
//             <span>Waiting for AI response... This may take a moment.</span>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
//           <p className="font-semibold mb-1">❌ Error:</p>
//           <p className="text-sm">{error}</p>
//         </div>
//       )}

//       {roadmap && roadmap.length > 0 && <Roadmap data={roadmap} />}
      
//       {!loading && !error && (!roadmap || roadmap.length === 0) && (
//         <div className="text-gray-400 text-center py-8">
//           Click "Generate Roadmap" to start
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { useRoadmap } from "../hooks/useRoadmap";
import Roadmap from "../components/Roadmap/RoadmapContainer";

export default function RoadmapPage() {
  const { roadmap, generate, update, careerSwitchGenerate, saveCurrentRoadmap, error, loading, clearRoadmap } = useRoadmap();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [duration, setDuration] = useState("");

  const handleGenerate = async () => {
    // Create a simple profile from user input or defaults
    const profile = {
      name: "User",
      targetRole: targetRole || "Software Developer",
      duration: duration || "6 months",
      resume: "Looking to advance my career in tech",
      skills: ["Programming", "Problem Solving"],
      experience: "Beginner to Intermediate"
    };

    try {
      await generate({ profile });
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  const handleUpdate = async () => {
    if (!pdfFile || !targetRole || !duration) {
      alert("Please provide PDF, target role, and duration");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("progress")) || {};
    const formData = new FormData();
    formData.append("resume", pdfFile);
    formData.append("targetRole", targetRole);
    formData.append("duration", duration);
    formData.append("completedSteps", JSON.stringify(Object.keys(saved).filter((k) => saved[k])));

    try {
      await update(formData);
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleCareerSwitch = async () => {
    if (!pdfFile || !targetRole || !duration) {
      alert("Please provide PDF, target role, and duration");
      return;
    }

    const formData = new FormData();
    formData.append("resume", pdfFile);
    formData.append("targetRole", targetRole);
    formData.append("duration", duration);

    try {
      await careerSwitchGenerate(formData);
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Career switch generation failed:", error);
    }
  };

  const [saveStatus, setSaveStatus] = useState("");

  const handleSaveRoadmap = async () => {
    setSaveStatus("saving");
    try {
      await saveCurrentRoadmap();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Save roadmap failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        {/* Quick Generate Section */}
        <div className="border border-blue-600 rounded p-4 space-y-4">
          <h3 className="text-lg font-semibold">Quick Generate Roadmap</h3>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Target Role (Optional)</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Frontend Developer (default: Software Developer)"
              className="block w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Duration (Optional)</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 6 months (default: 6 months)"
              className="block w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Generating..." : "Generate Roadmap"}
            </button>

            {roadmap && roadmap.length > 0 && (
              <button
                onClick={clearRoadmap}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              >
                Clear Roadmap
              </button>
            )}
          </div>
        </div>

        {/* Update Section */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
          >
            {showUpdateForm ? "Cancel Update" : "Update Roadmap with Resume"}
          </button>
        </div>

        {showUpdateForm && (
          <div className="border border-gray-600 rounded p-4 space-y-4">
            <h3 className="text-lg font-semibold">Update Roadmap with Resume</h3>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Upload Resume (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="block w-full text-sm border rounded px-3 py-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Frontend Developer"
                className="block w-full border rounded px-3 py-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 6 months"
                className="block w-full border rounded px-3 py-2"
                disabled={loading}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Submit Update
              </button>

              <button
                onClick={handleCareerSwitch}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
              >
                Career Switch Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-blue-900/30 border border-blue-500 text-blue-200 px-4 py-3 rounded mb-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span>Waiting for AI response... This may take a moment.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          <p className="font-semibold mb-1">❌ Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {roadmap && roadmap.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <button
              onClick={handleSaveRoadmap}
              disabled={saveStatus === "saving"}
              className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
            >
              {saveStatus === "saving" ? "Saving..." : "Save Roadmap"}
            </button>
            <button
              onClick={clearRoadmap}
              className="px-4 py-2 bg-slate-700 text-white rounded"
            >
              Discard
            </button>
            {saveStatus === "saved" && <span className="text-emerald-400 text-sm">✅ Saved successfully!</span>}
            {saveStatus === "error" && <span className="text-red-400 text-sm">❌ Save failed. Are you logged in?</span>}
          </div>
          <Roadmap data={roadmap} />
        </div>
      )}
      
      {!loading && !error && (!roadmap || roadmap.length === 0) && (
        <div className="text-gray-400 text-center py-8">
          Click "Generate Roadmap" to start
        </div>
      )}
    </div>
  );
}
