import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeResume, saveResumeAnalysis } from "../services/resumeAnalyzerService";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { UploadCloud, Sparkles, FileText, CheckCircle, AlertCircle, Rocket, X, Briefcase, Target } from "lucide-react";
import FlowVisualizer from "../components/FlowVisualizer";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
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

// Extract keywords from JD text (words > 3 chars, no stopwords)
const STOPWORDS = new Set(["with", "and", "the", "for", "that", "have", "this", "will", "from", "they", "your", "are", "you", "our", "can", "all", "been", "has", "its", "more", "also", "into", "than", "their", "about", "which", "when", "who", "what", "how", "not", "but", "any", "each", "both", "such", "some", "must", "able", "work", "team", "role", "using", "strong", "good", "well", "experience", "skills", "knowledge", "ability", "required", "preferred"]);

const extractKeywordsFromJD = (text) => {
  if (!text) return [];
  return [...new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s\+\#\.]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOPWORDS.has(w))
  )].slice(0, 30);
};

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveState, setSaveState] = useState({ saving: false, saved: false, error: null });
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [step, setStep] = useState(1); // 1 = upload+JD, 2 = results
  const [analyzeError, setAnalyzeError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setAnalyzeError(null);

    try {
      const jobSkills = extractKeywordsFromJD(jobDescription);
      const response = await analyzeResume(selectedFile, jobDescription, jobSkills);

      // Use backend score if JD provided, else compute from skills
      let atsScore;
      if (jobSkills.length > 0 && response.score != null) {
        atsScore = Math.min(100, response.score);
      } else {
        const skillScore = Math.min((response.skills?.length || 0) * 5, 40);
        const suggestionPenalty = response.suggestions?.length > 800 ? 10 : 0;
        atsScore = Math.min(100, 60 + skillScore - suggestionPenalty);
      }

      // Keyword match analysis
      const jdKeywords = extractKeywordsFromJD(jobDescription);
      const resumeSkillsLower = (response.skills || []).map(s => s.toLowerCase());
      const matched = jdKeywords.filter(k => resumeSkillsLower.some(s => s.includes(k) || k.includes(s)));
      const missing = jdKeywords.filter(k => !resumeSkillsLower.some(s => s.includes(k) || k.includes(s)));
      const keywordMatchPct = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : null;

      setResult({ ...response, atsScore, matched, missing, keywordMatchPct, jobTitle, jobDescription });
      setSaveState({ saving: false, saved: false, error: null });

      if (response.skills?.length > 0) {
        localStorage.setItem("analyzedSkills", JSON.stringify(response.skills));
      }

      setStep(2);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setAnalyzeError(error?.response?.data?.error || error?.message || "Analysis failed. Make sure the resume analyzer service is running on port 5001.");
    }

    setLoading(false);
  };

  const handleSaveResult = async () => {
    if (!result) return;
    setSaveState({ saving: true, saved: false, error: null });
    try {
      await saveResumeAnalysis({
        fileName: selectedFile?.name,
        jobTitle: result.jobTitle,
        atsScore: result.atsScore,
        skills: result.skills,
        suggestions: result.suggestions,
        keywordMatchPct: result.keywordMatchPct,
        matched: result.matched,
        missing: result.missing,
      });
      setSaveState({ saving: false, saved: true, error: null });
    } catch (err) {
      setSaveState({ saving: false, saved: false, error: "Failed to save. Please try again." });
    }
  };

  const handleDiscardResult = () => {
    setResult(null);
    setSelectedFile(null);
    setJobTitle("");
    setJobDescription("");
    setStep(1);
    setSaveState({ saving: false, saved: false, error: null });
  };

  const scoreColor = result?.atsScore > 75 ? "#10b981" : result?.atsScore > 50 ? "#f59e0b" : "#f43f5e";
  const scoreTextColor = result?.atsScore > 75 ? "text-emerald-400" : result?.atsScore > 50 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#06060a] text-white flex flex-col items-center pb-24 relative">

      {/* SUCCESS TOAST */}
      {showModal && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:bottom-10 md:right-10 z-[100] flex items-center justify-center animate-in slide-in-from-bottom-12 md:slide-in-from-right-12 duration-500">
          <div className="w-full max-w-sm bg-[#0a101f] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/20 blur-[40px]" />
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
              <X size={16} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Rocket size={20} className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight text-white uppercase italic">Audit Complete</h3>
                <p className="text-xs text-white/30 font-medium">
                  ATS Score: <span className={cn("font-bold", scoreTextColor)}>{result?.atsScore}/100</span>
                  {result?.keywordMatchPct != null && <> · Keyword Match: <span className="text-indigo-400 font-bold">{result.keywordMatchPct}%</span></>}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setShowModal(false); navigate("/feed"); }}
                className="w-full py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                Explore Opportunities <Sparkles size={14} />
              </button>
              <button onClick={() => setShowModal(false)} className="w-full py-2 text-white/20 rounded-xl font-black text-[9px] uppercase tracking-widest hover:text-white transition-all">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1200px] flex flex-col items-center space-y-16 md:space-y-20 px-4 md:px-0">

        {/* HEADER */}
        <div className="text-center max-w-3xl space-y-4 pt-8 md:pt-12">
          <Badge variant="outline" className="mb-2">
            <Sparkles size={14} className="text-indigo-400 mr-1" /> AI Resume Core
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            AI Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">ATS Checker</span>
          </h1>
          <p className="text-white/40 text-base md:text-lg font-medium leading-relaxed px-2">
            Upload your resume, optionally paste a job description, and get a full ATS compatibility report with keyword gap analysis.
          </p>
        </div>

        {/* STEP 1 — UPLOAD + JD */}
        {step === 1 && !loading && (
          <div className="w-full max-w-3xl space-y-6">

            {/* File Upload */}
            <Card className="overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
              <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-6 relative z-10">
                <label htmlFor="resumeUpload" className="flex flex-col items-center space-y-5 cursor-pointer w-full group-hover:scale-[1.01] transition-transform duration-300">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                    <UploadCloud size={32} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-white text-black font-bold hover:bg-white/90 transition-colors shadow-xl text-sm">
                      {selectedFile ? "Change File" : "Select Resume File"}
                    </span>
                    <p className="text-white/30 text-xs font-medium">PDF, DOCX, TXT · Max 5MB</p>
                  </div>
                </label>
                <input type="file" id="resumeUpload" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt" />
                {selectedFile && (
                  <Badge variant="success"><FileText size={12} className="mr-1" /> {selectedFile.name}</Badge>
                )}
              </CardContent>
            </Card>

            {/* JD Section */}
            <Card className="bg-[#0a0a0f] border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Briefcase size={20} className="text-violet-400" /> Job Description
                  <span className="text-white/30 text-sm font-normal">(optional — improves accuracy)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                <input
                  type="text"
                  placeholder="Job Title (e.g. Frontend Developer)"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <textarea
                  placeholder="Paste the full job description here. Our AI will extract keywords and measure how well your resume matches..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
                {jobDescription && (
                  <p className="text-white/30 text-xs">
                    <span className="text-violet-400 font-semibold">{extractKeywordsFromJD(jobDescription).length}</span> keywords extracted from JD
                  </p>
                )}
              </CardContent>
            </Card>

            {analyzeError && (
              <div className="w-full p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                ❌ {analyzeError}
              </div>
            )}

            <Button
              disabled={!selectedFile}
              onClick={handleAnalyze}
              className="w-full h-14 text-base font-black uppercase tracking-widest"
            >
              <Sparkles size={18} className="mr-2" /> Analyze Resume
            </Button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6 py-20 text-indigo-400 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Sparkles size={32} className="animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-xl tracking-wide">Processing Resume</h3>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Running Neural ATS Audit...</p>
            </div>
          </div>
        )}

        {/* STEP 2 — RESULTS */}
        {result && !loading && step === 2 && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-12 duration-700">

            {/* SCORE HERO */}
            <Card className="overflow-hidden border-indigo-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 bg-gradient-to-br from-indigo-500/5 to-transparent relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
                <div className="space-y-3 max-w-lg relative z-10">
                  <Badge variant="default">OVERALL RATING</Badge>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    ATS Compatibility Score
                    {result.jobTitle && <span className="text-white/40 text-lg font-medium ml-2">— {result.jobTitle}</span>}
                  </h2>
                  <p className="text-white/40 leading-relaxed font-medium text-sm">
                    {result.atsScore > 75
                      ? "Excellent! Your resume is well-optimized for ATS systems."
                      : result.atsScore > 50
                      ? "Good foundation. A few targeted improvements will boost your score significantly."
                      : "Needs work. Follow the suggestions below to improve ATS compatibility."}
                  </p>
                </div>
                <div className="relative flex items-center justify-center flex-shrink-0 z-10">
                  <RadialBarChart width={180} height={180} innerRadius="70%" outerRadius="100%" data={[{ value: result.atsScore }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={20} fill={scoreColor} />
                  </RadialBarChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-5xl font-black tracking-tighter", scoreTextColor)}>{result.atsScore}</span>
                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest">/ 100</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* KEYWORD MATCH (only if JD provided) */}
            {result.keywordMatchPct != null && (
              <Card className="bg-[#0a0a0f] border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Target size={20} className="text-violet-400" /> Keyword Match Analysis
                    <span className={cn("ml-auto text-2xl font-black", result.keywordMatchPct > 60 ? "text-emerald-400" : result.keywordMatchPct > 35 ? "text-amber-400" : "text-rose-400")}>
                      {result.keywordMatchPct}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  {/* Match bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/30 font-medium">
                      <span>Keyword Coverage</span>
                      <span>{result.matched.length} / {result.matched.length + result.missing.length} keywords matched</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000", result.keywordMatchPct > 60 ? "bg-emerald-500" : result.keywordMatchPct > 35 ? "bg-amber-500" : "bg-rose-500")}
                        style={{ width: `${result.keywordMatchPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Matched */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={14} /> Matched Keywords
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.matched.length > 0
                          ? result.matched.map((k, i) => <Badge key={i} variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{k}</Badge>)
                          : <p className="text-white/20 text-sm">No matches found</p>}
                      </div>
                    </div>
                    {/* Missing */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={14} /> Missing Keywords
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.missing.length > 0
                          ? result.missing.map((k, i) => <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20">{k}</Badge>)
                          : <p className="text-white/20 text-sm">All keywords covered!</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* SKILLS */}
              <Card className="md:col-span-1 border-white/5 bg-[#0a0a0f]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-400" /> Extracted Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {result.skills?.length > 0
                      ? result.skills.map((skill, i) => <Badge key={i} variant="outline" className="bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors">{skill}</Badge>)
                      : <p className="text-white/30 text-sm">No specific technical skills detected.</p>}
                  </div>
                </CardContent>
              </Card>

              {/* SUGGESTIONS */}
              <Card className="md:col-span-2 border-white/5 bg-[#0a0a0f]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><AlertCircle size={20} className="text-rose-400" /> Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {cleanText(result.suggestions)
                      .split("\n\n")
                      .filter(Boolean)
                      .map((block, i) => {
                        const lines = block.split("\n");
                        const title = lines[0].replace(/^[\d\.\-\*]+\s*/, "");
                        const content = lines.slice(1);
                        return (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="w-1.5 h-auto bg-indigo-500 rounded-full flex-shrink-0" />
                            <div className="space-y-1 w-full">
                              <h3 className="font-bold text-base text-white/90">{title}</h3>
                              {content.length > 0 && (
                                <div className="text-white/40 text-sm space-y-1 font-medium leading-relaxed">
                                  {content.map((line, j) => <p key={j}>{line}</p>)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button variant="secondary" onClick={handleDiscardResult}>Analyze Another Resume</Button>
              <Button variant="primary" onClick={handleSaveResult} disabled={saveState.saving || saveState.saved}>
                {saveState.saving ? "Saving..." : saveState.saved ? "✓ Saved" : "Save Result"}
              </Button>
              <Button variant="outline" onClick={handleDiscardResult}>Discard</Button>
            </div>
            {saveState.error && <p className="text-center text-rose-400 text-sm">{saveState.error}</p>}
          </div>
        )}

        {/* PIPELINE OVERVIEW (initial state) */}
        {!result && !loading && step === 1 && (
          <div className="w-full max-w-3xl space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-[#0a0a0f] border-white/5 group hover:border-indigo-500/30">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle size={20} /></div>
                  <h3 className="text-lg font-bold text-white">Higher Chances</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Improve structure and keywords to pass strict ATS filters.</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0f] border-white/5 group hover:border-emerald-500/30">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Sparkles size={20} /></div>
                  <h3 className="text-lg font-bold text-white">Skill Extraction</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Automatically detect technical and soft skills from your resume.</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0a0a0f] border-white/5 group hover:border-violet-500/30">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Target size={20} /></div>
                  <h3 className="text-lg font-bold text-white">JD Matching</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Paste a job description to see exactly which keywords you're missing.</p>
                </CardContent>
              </Card>
            </div>
            <Card className="p-10 text-center space-y-6 bg-[#0a0a0f] border-white/5 hidden md:block">
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
