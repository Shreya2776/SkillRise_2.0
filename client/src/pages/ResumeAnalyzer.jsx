// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { analyzeResume } from "../services/resumeAnalyzerService";
// import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
// import {
//   UploadCloud,
//   Sparkles,
//   FileText,
//   CheckCircle,
//   AlertCircle,
//   Rocket,
//   X,
// } from "lucide-react";
// import FlowVisualizer from "../components/FlowVisualizer";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "../components/ui/Card";
// import { Button } from "../components/ui/Button";
// import { Badge } from "../components/ui/Badge";
// import { cn } from "../services/utils";

// const cleanText = (text) => {
//   if (!text) return "";
//   return text
//     .replace(/\*\*/g, "")
//     .replace(/```/g, "")
//     .replace(/^\s*-\s*/gm, "• ")
//     .replace(/\n{2,}/g, "\n\n");
// };

// const ResumeAnalyzer = () => {
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [error, setError] = useState(null);

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setSelectedFile(file);
//     setResult(null);
//     setError(null);
//   };

//   const runAnalysis = async () => {
//     if (!selectedFile) {
//       setError("Please select a resume file before starting analysis.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await analyzeResume(selectedFile);

//       const skillScore = Math.min((response.skills?.length || 0) * 5, 40);
//       const suggestionPenalty = response.suggestions?.length > 800 ? 10 : 0;
//       const atsScore = Math.min(100, 60 + skillScore - suggestionPenalty);

//       setResult({
//         ...response,
//         atsScore,
//       });

//       if (response.skills && response.skills.length > 0) {
//         localStorage.setItem("analyzedSkills", JSON.stringify(response.skills));
//       }

//       setShowModal(true);
//     } catch (error) {
//       console.error(error);
//       setError("Resume analysis failed. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[calc(100vh-100px)] bg-[#06060a] text-white flex flex-col items-center pb-24 relative">
//       {/* SUCCESS TOAST NOTIFICATION */}
//       {showModal && (
//         <div className="fixed bottom-6 right-6 left-6 md:left-auto md:bottom-10 md:right-10 z-[100] flex items-center justify-center p-0 animate-in slide-in-from-bottom-12 md:slide-in-from-right-12 duration-500">
//           <div className="w-full max-w-sm bg-[#0a101f] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
//             <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/20 blur-[40px]" />

//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
//             >
//               <X size={16} />
//             </button>

//             <div className="flex items-center gap-4 md:gap-5">
//               <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
//                 <Rocket size={20} className="animate-bounce md:w-6 md:h-6" />
//               </div>

//               <div className="space-y-1">
//                 <h3 className="text-lg md:text-xl font-black tracking-tight text-white uppercase italic">
//                   Audit Complete
//                 </h3>
//                 <p className="text-[10px] md:text-xs text-white/30 font-medium leading-relaxed">
//                   Your skills have been extracted.
//                 </p>
//               </div>
//             </div>

//             <div className="w-full pt-1 space-y-2">
//               <Link
//                 to="/recommendations"
//                 className="w-full py-3 md:py-3.5 bg-white text-black rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
//               >
//                 View Recommendations
//                 <Sparkles size={14} />
//               </Link>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-full py-2 text-white/20 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:text-white transition-all"
//               >
//                 Dismiss
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="w-full max-w-[1200px] flex flex-col items-center space-y-16 md:space-y-24 px-4 md:px-0">
//         {/* HEADER */}
//         <div className="text-center max-w-3xl space-y-4 md:space-y-6 pt-8 md:pt-12">
//           <Badge variant="outline" className="mb-2 md:mb-4">
//             <Sparkles size={14} className="text-indigo-400 mr-1" /> AI Resume
//             Core
//           </Badge>
//           <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
//             AI Powered{" "}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
//               ATS Checker
//             </span>
//           </h1>
//           <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed px-2">
//             Upload your resume and our AI will analyze it against modern
//             Applicant Tracking Systems to measure compatibility, extract skills,
//             and provide professional suggestions.
//           </p>
//         </div>

//         {/* UPLOAD CARD */}
//         <div className="w-full flex justify-center px-2">
//           <Card className="w-full max-w-2xl overflow-hidden relative group">
//             <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
//             <CardContent className="p-8 md:p-16 flex flex-col items-center text-center space-y-6 md:space-y-8 relative z-10">
//               <label
//                 htmlFor="resumeUpload"
//                 className="flex flex-col items-center space-y-6 md:space-y-8 cursor-pointer w-full group-hover:scale-[1.02] transition-transform duration-300"
//               >
//                 <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
//                   <UploadCloud size={32} md:size={48} strokeWidth={1.5} />
//                 </div>

//                 <div className="space-y-2">
//                   <span className="inline-flex items-center justify-center h-10 md:h-12 px-6 md:px-8 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors shadow-xl text-sm md:text-base">
//                     Select Resume File
//                   </span>
//                   <p className="text-white/30 text-[10px] md:text-sm font-medium mt-2 md:mt-4">
//                     Supported: PDF, DOCX, TXT (Max 5MB)
//                   </p>
//                 </div>
//               </label>

//               <input
//                 type="file"
//                 id="resumeUpload"
//                 className="hidden"
//                 onChange={handleFileSelect}
//                 accept=".pdf,.doc,.docx,.txt"
//               />

//               {selectedFile && !loading && !result && (
//                 <div className="flex flex-col items-center gap-4 mt-4 md:mt-6 w-full">
//                   <Badge
//                     variant="success"
//                     className="w-full max-w-sm justify-center"
//                   >
//                     <FileText size={12} /> {selectedFile.name}
//                   </Badge>
//                   <Button onClick={runAnalysis} className="w-full max-w-sm">
//                     Analyze Resume
//                   </Button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {error && !loading && (
//           <div className="w-full max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-100 text-sm font-medium">
//             {error}
//           </div>
//         )}

//         {/* LOADING STATE */}
//         {loading && (
//           <div className="flex flex-col items-center justify-center space-y-6 py-20 text-indigo-400 animate-in fade-in zoom-in duration-500">
//             <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
//               <Sparkles size={32} className="animate-spin duration-3000" />
//             </div>
//             <div className="text-center space-y-2">
//               <h3 className="text-white font-bold text-xl tracking-wide">
//                 Processing Resume
//               </h3>
//               <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
//                 Running Neural ATS Audit...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* RESULTS SECTION */}
//         {result && !loading && (
//           <div className="w-full space-y-8 animate-in slide-in-from-bottom-12 duration-700">
//             {/* SCORE HERO CARD */}
//             <Card className="overflow-hidden border-indigo-500/30">
//               <div className="flex flex-col md:flex-row items-center justify-between p-12 gap-12 bg-gradient-to-br from-indigo-500/5 to-transparent relative">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

//                 <div className="space-y-4 max-w-lg relative z-10">
//                   <Badge variant="default">OVERALL RATING</Badge>
//                   <h2 className="text-3xl font-black text-white tracking-tight">
//                     ATS Compatibility Score
//                   </h2>
//                   <p className="text-white/40 leading-relaxed font-medium">
//                     This score measures how well your resume matches modern ATS
//                     parsing algorithms. Aim for 80+ for optimal visibility.
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-8 relative z-10">
//                   <div className="relative flex items-center justify-center">
//                     <RadialBarChart
//                       width={200}
//                       height={200}
//                       innerRadius="70%"
//                       outerRadius="100%"
//                       data={[{ value: result.atsScore }]}
//                       startAngle={90}
//                       endAngle={-270}
//                     >
//                       <PolarAngleAxis
//                         type="number"
//                         domain={[0, 100]}
//                         tick={false}
//                       />
//                       <RadialBar
//                         dataKey="value"
//                         cornerRadius={20}
//                         fill={
//                           result.atsScore > 75
//                             ? "#10b981"
//                             : result.atsScore > 50
//                               ? "#f59e0b"
//                               : "#f43f5e"
//                         }
//                       />
//                     </RadialBarChart>
//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <span
//                         className={cn(
//                           "text-6xl font-black tracking-tighter",
//                           result.atsScore > 75
//                             ? "text-emerald-400"
//                             : result.atsScore > 50
//                               ? "text-amber-400"
//                               : "text-rose-400",
//                         )}
//                       >
//                         {result.atsScore}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Card>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {/* SKILLS DETECTED */}
//               <Card className="md:col-span-1 border-white/5 bg-[#0a0a0f]">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-3">
//                     <CheckCircle size={20} className="text-emerald-400" />{" "}
//                     Extracted Skills
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex flex-wrap gap-2 pt-4">
//                     {result.skills?.length > 0 ? (
//                       result.skills.map((skill, index) => (
//                         <Badge
//                           key={index}
//                           variant="outline"
//                           className="bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
//                         >
//                           {skill}
//                         </Badge>
//                       ))
//                     ) : (
//                       <p className="text-white/30 text-sm">
//                         No specific technical skills detected.
//                       </p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* ACTIONABLE SUGGESTIONS */}
//               <Card className="md:col-span-2 border-white/5 bg-[#0a0a0f]">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-3">
//                     <AlertCircle size={20} className="text-rose-400" />{" "}
//                     Improvement Suggestions
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6 pt-4">
//                     {cleanText(result.suggestions)
//                       .split("\n\n")
//                       .filter(Boolean)
//                       .map((block, index) => {
//                         const lines = block.split("\n");
//                         const title = lines[0].replace(/^[\d\.\-\*]+\s*/, "");
//                         const content = lines.slice(1);
//                         return (
//                           <div
//                             key={index}
//                             className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
//                           >
//                             <div className="w-1.5 h-auto bg-indigo-500 rounded-full flex-shrink-0" />
//                             <div className="space-y-2 w-full">
//                               <h3 className="font-bold text-lg text-white/90">
//                                 {title}
//                               </h3>
//                               {content.length > 0 ? (
//                                 <div className="text-white/40 text-sm space-y-1 font-medium leading-relaxed">
//                                   {content.map((line, i) => (
//                                     <p key={i}>{line}</p>
//                                   ))}
//                                 </div>
//                               ) : (
//                                 <p className="text-white/40 text-sm font-medium leading-relaxed">
//                                   {title}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="flex justify-center pt-8">
//               <Button variant="secondary" onClick={() => setResult(null)}>
//                 Analyze Another Resume
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* PIPELINE OVERVIEW (SHOWN INITIALLY) */}
//         {!result && !loading && (
//           <div className="w-full space-y-12">
//             <div className="grid md:grid-cols-3 gap-8">
//               <Card className="bg-[#0a0a0f] border-white/5 group hover:border-indigo-500/30">
//                 <CardContent className="p-8 space-y-4">
//                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
//                     <CheckCircle size={24} />
//                   </div>
//                   <h3 className="text-xl font-bold text-white">
//                     Higher Chances
//                   </h3>
//                   <p className="text-white/40 text-sm font-medium leading-relaxed">
//                     Improve structure and keywords to multiply your chances of
//                     passing strict ATS filters.
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card className="bg-[#0a0a0f] border-white/5 group hover:border-emerald-500/30">
//                 <CardContent className="p-8 space-y-4">
//                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
//                     <Sparkles size={24} />
//                   </div>
//                   <h3 className="text-xl font-bold text-white">
//                     Skill Extraction
//                   </h3>
//                   <p className="text-white/40 text-sm font-medium leading-relaxed">
//                     Automatically detect technical and soft skills to ensure
//                     nothing important is left behind.
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card className="bg-[#0a0a0f] border-white/5 group hover:border-violet-500/30">
//                 <CardContent className="p-8 space-y-4">
//                   <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
//                     <AlertCircle size={24} />
//                   </div>
//                   <h3 className="text-xl font-bold text-white">
//                     AI Suggestions
//                   </h3>
//                   <p className="text-white/40 text-sm font-medium leading-relaxed">
//                     Receive personalized action items from our fine-tuned
//                     language model.
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>

//             <Card className="p-12 text-center space-y-8 bg-[#0a0a0f] border-white/5 hidden md:block">
//               <Badge variant="outline">SYSTEM ARCHITECTURE</Badge>
//               <FlowVisualizer />
//             </Card>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResumeAnalyzer;



import React, { useState } from "react";
import { Link } from "react-router-dom";
import { analyzeResume } from "../services/resumeAnalyzerService";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import {
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle,
  AlertCircle,
  Rocket,
  X,
} from "lucide-react";
import FlowVisualizer from "../components/FlowVisualizer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { cn } from "../services/utils";

const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")
    .replace(/```/g, "")
    .replace(/^\s*-\s*/gm, "• ")
    .replace(/\n{2,}/g, "\n\n");
};

const ResumeAnalyzer = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobKeywords, setJobKeywords] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const parseKeywords = () => {
    return jobKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setError("Please select a resume file before starting analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeResume(selectedFile, {
        jobTitle,
        jobDescription,
        jobSkills: parseKeywords(),
        experienceYears: Number(experienceYears || 0),
      });

      setResult(response);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setError("Resume analysis failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#06060a] text-white flex flex-col items-center pb-24 relative">
      {showModal && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:bottom-10 md:right-10 z-[100] flex items-center justify-center p-0 animate-in slide-in-from-bottom-12 md:slide-in-from-right-12 duration-500">
          <div className="w-full max-w-sm bg-[#0a101f] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/20 blur-[40px]" />

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Rocket size={20} className="animate-bounce md:w-6 md:h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-black tracking-tight text-white uppercase italic">
                  Audit Complete
                </h3>
                <p className="text-[10px] md:text-xs text-white/30 font-medium leading-relaxed">
                  Your resume has been analyzed.
                </p>
              </div>
            </div>

            <div className="w-full pt-1 space-y-2">
              <Link
                to="/recommendations"
                className="w-full py-3 md:py-3.5 bg-white text-black rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                View Recommendations
                <Sparkles size={14} />
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-white/20 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:text-white transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1200px] flex flex-col items-center space-y-16 md:space-y-24 px-4 md:px-0">
        <div className="text-center max-w-3xl space-y-4 md:space-y-6 pt-8 md:pt-12">
          <Badge variant="outline" className="mb-2 md:mb-4">
            <Sparkles size={14} className="text-indigo-400 mr-1" /> AI Resume
            Core
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            AI Powered{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              ATS Checker
            </span>
          </h1>
          <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed px-2">
            Upload your resume and our AI will analyze it against modern
            Applicant Tracking Systems.
          </p>
        </div>

        <Card className="w-full max-w-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-8 md:p-16 flex flex-col items-center text-center space-y-6 md:space-y-8 relative z-10">
            <div className="w-full grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col text-left text-sm text-white/50">
                  <span className="mb-2 text-white">Job Title</span>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. QA Engineer"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                  />
                </label>

                <label className="flex flex-col text-left text-sm text-white/50">
                  <span className="mb-2 text-white">Years of Experience</span>
                  <input
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g. 4"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                  />
                </label>
              </div>

              <label className="flex flex-col text-left text-sm text-white/50">
                <span className="mb-2 text-white">Job Description</span>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here"
                  rows={4}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
              </label>

              <label className="flex flex-col text-left text-sm text-white/50">
                <span className="mb-2 text-white">Job Keywords</span>
                <input
                  type="text"
                  value={jobKeywords}
                  onChange={(e) => setJobKeywords(e.target.value)}
                  placeholder="Enter keywords separated by commas"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
              </label>
            </div>

            <label
              htmlFor="resumeUpload"
              className="flex flex-col items-center space-y-6 md:space-y-8 cursor-pointer w-full group-hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <UploadCloud size={32} md:size={48} strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center justify-center h-10 md:h-12 px-6 md:px-8 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors shadow-xl text-sm md:text-base">
                  Select Resume File
                </span>
                <p className="text-white/30 text-[10px] md:text-sm font-medium mt-2 md:mt-4">
                  Supported: PDF, DOCX, TXT (Max 5MB)
                </p>
              </div>
            </label>

            <input
              type="file"
              id="resumeUpload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
            />

            {selectedFile && !loading && !result && (
              <div className="flex flex-col items-center gap-4 mt-4 md:mt-6 w-full">
                <Badge
                  variant="success"
                  className="w-full max-w-sm justify-center"
                >
                  <FileText size={12} /> {selectedFile.name}
                </Badge>
                <Button onClick={runAnalysis} className="w-full max-w-sm">
                  Analyze Resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && !loading && (
          <div className="w-full max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-100 text-sm font-medium">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6 py-20 text-indigo-400 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Sparkles size={32} className="animate-spin duration-3000" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-xl tracking-wide">
                Processing Resume
              </h3>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
                Running Neural ATS Audit...
              </p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-12 duration-700">
            <Card className="overflow-hidden border-indigo-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between p-12 gap-12 bg-gradient-to-br from-indigo-500/5 to-transparent relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                <div className="space-y-4 max-w-lg relative z-10">
                  <Badge variant="default">OVERALL RATING</Badge>
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    ATS Compatibility Score
                  </h2>
                  <p className="text-white/40 leading-relaxed font-medium">
                    This score measures how well your resume matches the target
                    job.
                  </p>
                </div>
                <div className="flex items-center gap-8 relative z-10">
                  <div className="relative flex items-center justify-center">
                    <RadialBarChart
                      width={200}
                      height={200}
                      innerRadius="70%"
                      outerRadius="100%"
                      data={[{ value: result.atsScore }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        tick={false}
                      />
                      <RadialBar
                        dataKey="value"
                        cornerRadius={20}
                        fill={
                          result.atsScore > 75
                            ? "#10b981"
                            : result.atsScore > 50
                            ? "#f59e0b"
                            : "#f43f5e"
                        }
                      />
                    </RadialBarChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className={cn(
                          "text-6xl font-black tracking-tighter",
                          result.atsScore > 75
                            ? "text-emerald-400"
                            : result.atsScore > 50
                            ? "text-amber-400"
                            : "text-rose-400",
                        )}
                      >
                        {result.atsScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-1 border-white/5 bg-[#0a0a0f]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-400" />{" "}
                    Extracted Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {result.skills?.length > 0 ? (
                      result.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-white/30 text-sm">
                        No specific technical skills detected.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-white/5 bg-[#0a0a0f]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-rose-400" />{" "}
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 pt-4">
                    {cleanText(result.suggestions)
                      .split("\n\n")
                      .filter(Boolean)
                      .map((block, index) => {
                        const lines = block.split("\n");
                        const title = lines[0].replace(/^[\d\.\-\*]+\s*/, "");
                        const content = lines.slice(1);
                        return (
                          <div
                            key={index}
                            className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                          >
                            <div className="w-1.5 h-auto bg-indigo-500 rounded-full flex-shrink-0" />
                            <div className="space-y-2 w-full">
                              <h3 className="font-bold text-lg text-white/90">
                                {title}
                              </h3>
                              {content.length > 0 ? (
                                <div className="text-white/40 text-sm space-y-1 font-medium leading-relaxed">
                                  {content.map((line, i) => (
                                    <p key={i}>{line}</p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-white/40 text-sm font-medium leading-relaxed">
                                  {title}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-8">
              <Button variant="secondary" onClick={() => setResult(null)}>
                Analyze Another Resume
              </Button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="w-full space-y-12">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-[#0a0a0f] border-white/5 group hover:border-indigo-500/30">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Higher Chances
                  </h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">
                    Improve structure and keywords to multiply your chances of
                    passing strict ATS filters.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0f] border-white/5 group hover:border-emerald-500/30">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Skill Extraction
                  </h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">
                    Automatically detect technical and soft skills to ensure
                    nothing important is left behind.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0f] border-white/5 group hover:border-violet-500/30">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    AI Suggestions
                  </h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">
                    Receive personalized action items from our fine-tuned
                    language model.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="p-12 text-center space-y-8 bg-[#0a0a0f] border-white/5 hidden md:block">
              <Badge variant="outline">SYSTEM ARCHITECTURE</Badge>
              <FlowVisualizer />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;