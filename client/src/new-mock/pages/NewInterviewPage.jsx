import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { interviewAPI, vapiAPI } from "../api";
import { useToast } from "../components/ui/Toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import {
  USER_CATEGORIES,
  INTERVIEW_TYPES,
  CATEGORY_TYPES,
  EXPERIENCE_LEVELS,
  TECH_STACK_OPTIONS,
  QUESTION_COUNTS,
} from "../utils/constants";
import { cn } from "../utils/helpers";
import { Check, Search, ChevronRight, ChevronLeft, Sparkles, UserCircle, CheckCircle2 } from "lucide-react";

const STEPS = ["Category", "Role", "Type & Level", "Skills", "Questions", "Review"];

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingQ, setGeneratingQ] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const [form, setForm] = useState({
    userCategory: "white-collar",
    role: "",
    type: "technical",
    level: "mid",
    language: "English",
    techstack: [],
    questionCount: 5,
    questions: [],
  });

  // Filter tech options based on search
  const filteredTech = TECH_STACK_OPTIONS.filter((t) =>
    t.toLowerCase().includes(techSearch.toLowerCase())
  );

  // When category changes, reset type if it's not compatible
  useEffect(() => {
    const allowedTypes = CATEGORY_TYPES[form.userCategory];
    if (!allowedTypes.includes(form.type)) {
      setForm((f) => ({ ...f, type: allowedTypes[0] }));
    }
  }, [form.userCategory]);

  const toggleTech = (tech) => {
    setForm((f) => ({
      ...f,
      techstack: f.techstack.includes(tech)
        ? f.techstack.filter((t) => t !== tech)
        : [...f.techstack, tech],
    }));
  };

  const generateQuestions = async () => {
    setGeneratingQ(true);
    try {
      const { data } = await vapiAPI.generateQuestions({
        userCategory: form.userCategory,
        role: form.role,
        type: form.type,
        level: form.level,
        techstack: form.techstack,
        amount: form.questionCount,
      });
      setForm((f) => ({ ...f, questions: data.questions }));
      toast({ title: "Questions generated!", type: "success" });
    } catch (err) {
      toast({ title: "Using default questions", description: err.response?.data?.message, type: "info" });
      const defaults = [
        `Tell me about your experience as a ${form.role}.`,
        "Describe a challenging situation you handled recently.",
        "How do you ensure quality in your work?",
        "What's your approach to teamwork?",
        "Where do you see yourself in 3 years?",
      ].slice(0, form.questionCount);
      setForm((f) => ({ ...f, questions: defaults }));
    } finally {
      setGeneratingQ(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await interviewAPI.create({
        userCategory: form.userCategory,
        role: form.role,
        type: form.type,
        level: form.level,
        language: form.language,
        techstack: form.techstack,
        questions: form.questions,
      });
      toast({ title: "Interview created!", type: "success" });
      navigate(`/interviews/${data.interview._id}`);
    } catch (err) {
      toast({ title: "Failed to create", description: err.response?.data?.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!form.userCategory;
    if (step === 1) return form.role.trim().length > 1;
    if (step === 4) return form.questions.length > 0;
    return true;
  };

  const next = () => {
    if (step === 4 && form.questions.length === 0) {
      generateQuestions();
      return;
    }

    let nextStep = step + 1;
    // Skip Skills (Step 3) for Blue Collar
    if (nextStep === 3 && form.userCategory === "blue-collar") {
      nextStep = 4;
    }

    if (nextStep < STEPS.length) setStep(nextStep);
  };

  const back = () => {
    let prevStep = step - 1;
    // Skip Skills (Step 3) for Blue Collar
    if (prevStep === 3 && form.userCategory === "blue-collar") {
      prevStep = 2;
    }
    if (prevStep >= 0) setStep(prevStep);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-20 px-2 sm:px-4 animate-fade-in">
      {/* Dynamic Header */}
      <div className="text-center space-y-2 md:space-y-3 pt-4 sm:pt-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Step {step + 1} of {STEPS.length}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
          {step === 0 ? "Select Your Path" :
           step === 1 ? "Define Your Role" :
           step === 2 ? "Configure Settings" :
           step === 3 ? "Select Expertise" :
           step === 4 ? "Question Selection" : "Ready to Launch"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto px-4">
          {STEPS[step]}: Tailor your AI interview experience for the best results.
        </p>
      </div>

      {/* Modern Stepper */}
      <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-4 max-w-full sm:max-w-lg mx-auto overflow-x-auto no-scrollbar scroll-px-4 pb-2 px-4 sm:px-0">
        {STEPS.map((label, i) => {
          if (i === 3 && form.userCategory === "blue-collar") return null;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} className="flex items-center gap-2 shrink-0">
               <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500",
                  isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30" :
                  isDone ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-white/5 text-muted-foreground border border-white/5"
                )}
              >
                {isDone ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-4 h-1 sm:w-6 rounded-full", isDone ? "bg-emerald-500/40" : "bg-white/5")} />
              )}
            </div>
          );
        })}
      </div>

      <Card className="p-6 sm:p-8 md:p-12 border-white/[0.05] bg-card/40 backdrop-blur-3xl rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-visible relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-indigo-500/10 rounded-[24px] sm:rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 -z-10" />

        <div className="min-h-[250px] sm:min-h-[300px]">
          {/* Step 0: Category */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
              {USER_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setForm({ ...form, userCategory: cat.value })}
                  className={cn(
                    "flex flex-col items-center text-center p-6 md:p-8 rounded-[24px] border-2 transition-all duration-300 relative overflow-hidden group/btn",
                    form.userCategory === cat.value 
                      ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                      : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 transition-all duration-500",
                    form.userCategory === cat.value ? "bg-primary text-white scale-110" : "bg-white/5 group-hover/btn:scale-110"
                  )}>
                    {cat.icon}
                  </div>
                  <h3 className={cn("text-base md:text-lg font-bold mb-2", form.userCategory === cat.value ? "text-primary" : "text-white")}>
                    {cat.label}
                  </h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                  
                  {form.userCategory === cat.value && (
                    <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-8 md:space-y-10 animate-fade-in max-w-xl mx-auto">
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Target Position</label>
                <div className="relative group">
                   <UserCircle className={cn(
                     "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 transition-colors",
                     form.role ? "text-primary" : "text-muted-foreground"
                   )} />
                   <input
                    type="text"
                    placeholder={form.userCategory === "blue-collar" ? "e.g. Electrician..." : "e.g. Fullstack Dev..."}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full h-14 md:h-16 pl-12 md:pl-14 pr-6 rounded-2xl bg-white/5 border-2 border-white/5 focus:border-primary/50 focus:bg-white/10 transition-all outline-none text-lg md:text-xl font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {(form.userCategory === "blue-collar" 
                    ? ["Forklift Operator", "Electrician", "Warehouse Assoc.", "Operations Lead", "Delivery Driver"]
                    : ["Frontend Dev", "Backend Dev", "Product Manager", "UX Designer", "Data Analyst"]
                  ).map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm({ ...form, role: r })}
                      className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 rounded-xl border-2 transition-all text-xs md:text-sm font-semibold",
                        form.role === r 
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                          : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-10 md:space-y-12 animate-fade-in max-w-2xl mx-auto">
               <div className="space-y-4 md:space-y-6">
                <h3 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Select Interview Focus</h3>
                <div className={cn("grid gap-3 md:gap-4", 
                  CATEGORY_TYPES[form.userCategory].length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                )}>
                  {INTERVIEW_TYPES.filter(t => CATEGORY_TYPES[form.userCategory].includes(t.value)).map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={cn(
                        "flex flex-col items-start p-4 md:p-6 rounded-[20px] md:rounded-[24px] border-2 transition-all relative group/type text-left",
                        form.type === t.value 
                          ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" 
                          : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl mb-3 md:mb-4 transition-all duration-300",
                        form.type === t.value ? "bg-primary text-white" : "bg-white/10 group-hover/type:bg-white/20"
                      )}>
                        {t.icon}
                      </div>
                      <span className={cn("text-sm md:text-base font-bold", form.type === t.value ? "text-primary" : "text-white")}>{t.label}</span>
                      <span className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2 leading-relaxed">{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h3 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Seniority Level</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setForm({ ...form, level: l.value })}
                      className={cn(
                        "flex flex-col items-center p-4 md:p-6 rounded-[20px] md:rounded-[24px] border-2 transition-all",
                        form.level === l.value 
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
                          : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <span className={cn("text-base md:text-lg font-bold", form.level === l.value ? "text-primary" : "text-white")}>{l.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">{l.years}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h3 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Communication Protocol</h3>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                   {["English", "Hinglish"].map((lang) => (
                     <button
                       key={lang}
                       onClick={() => setForm({ ...form, language: lang })}
                       className={cn(
                         "flex-1 px-8 py-3 md:py-4 rounded-2xl border-2 transition-all font-bold text-sm md:text-base",
                         form.language === lang 
                           ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                           : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/10"
                       )}
                     >
                       {lang} Protocol
                     </button>
                   ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 italic pl-1">
                  * **Hinglish** enables natural Indian vernacular flow (Mix of Hindi & English).
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Tech Stack */}
          {step === 3 && (
            <div className="space-y-6 md:space-y-8 animate-fade-in max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  placeholder="Search skills, tools..."
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  className="w-full h-12 md:h-14 pl-12 pr-6 rounded-2xl bg-white/5 border-2 border-white/5 focus:border-primary/50 focus:bg-white/10 transition-all outline-none text-base md:text-lg font-medium"
                />
              </div>

              <div className="space-y-3 md:space-y-4">
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Selected Expertise ({form.techstack.length})</p>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {form.techstack.length === 0 && <p className="text-[10px] md:text-sm text-muted-foreground/50 pl-1 italic">No skills selected yet...</p>}
                  {form.techstack.map((t) => (
                    <button 
                      key={t} 
                      onClick={() => toggleTech(t)} 
                      className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-primary text-primary-foreground text-xs md:text-sm font-bold shadow-lg shadow-primary/20 animate-in zoom-in duration-300"
                    >
                      {t} <Check className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 pt-4 border-t border-white/[0.05]">
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Available Skills</p>
                <div className="flex flex-wrap gap-2 max-h-48 md:max-h-60 overflow-y-auto pr-2 thin-scrollbar">
                  {filteredTech.filter((t) => !form.techstack.includes(t)).map((tech) => (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10 bg-white/[0.02] text-muted-foreground text-[10px] md:text-sm font-medium hover:border-primary/50 hover:text-white hover:bg-primary/5 transition-all"
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Questions */}
          {step === 4 && (
            <div className="space-y-8 md:space-y-10 animate-fade-in max-w-xl mx-auto">
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Number of Questions</h3>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {QUESTION_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm({ ...form, questionCount: n, questions: [] })}
                      className={cn(
                        "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[18px] sm:rounded-[24px] border-2 font-black text-xl md:text-2xl transition-all duration-300 flex items-center justify-center",
                        form.questionCount === n 
                          ? "border-primary bg-primary text-white shadow-xl shadow-primary/30 scale-110" 
                          : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {form.questions.length > 0 ? (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] md:text-sm font-bold text-primary flex items-center gap-1 md:gap-2 uppercase tracking-widest italic font-sans">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Question Bank Ready
                      </p>
                      <button onClick={() => { setForm((f) => ({ ...f, questions: [] })); generateQuestions(); }} className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                         Regenerate
                      </button>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      {form.questions.map((_, i) => (
                        <div key={i} className="flex gap-3 md:gap-4 p-4 md:p-5 bg-white/[0.03] rounded-2xl border border-white/[0.06] items-center">
                          <span className="text-primary font-black text-base md:text-lg shrink-0 w-4 md:w-6">{i + 1}</span>
                          <div className="flex-1 space-y-2 md:space-y-3 opacity-40">
                             <div className="h-1.5 md:h-2 bg-white/30 rounded-full w-3/4"></div>
                             <div className="h-1.5 md:h-2 bg-white/20 rounded-full w-1/2"></div>
                          </div>
                          <Badge variant="outline" className="text-[8px] md:text-[10px] text-muted-foreground border-white/10 uppercase tracking-widest hidden sm:flex">Classified</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={generateQuestions} 
                    loading={generatingQ} 
                    variant="primary" 
                    className="w-full h-16 md:h-20 rounded-[20px] md:rounded-[28px] text-lg md:text-xl font-black gap-3 md:gap-4 shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                    {generatingQ ? "Building AI..." : "AI Question Builder"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-8 md:space-y-10 animate-fade-in max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  ["Identity", USER_CATEGORIES.find(c => c.value === form.userCategory)?.label, "👤"],
                  ["Position", form.role, "💼"],
                  ["Session Track", INTERVIEW_TYPES.find(t => t.value === form.type)?.label, "🎯"],
                  ["Expertise Level", form.level, "🏆"],
                  ["Questions", `${form.questions.length} Scenario(s)`, "⚡"],
                ].map(([label, val, icon]) => (
                  <div key={label} className="p-4 md:p-6 bg-white/[0.03] rounded-[20px] md:rounded-[24px] border border-white/[0.06] flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg">{icon}</div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
                      <p className="font-bold text-white text-base md:text-lg capitalize truncate">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {form.techstack.length > 0 && (
                 <div className="p-6 md:p-8 bg-white/[0.03] rounded-[20px] md:rounded-[24px] border border-white/[0.06] space-y-3 md:space-y-4">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Core Skills Included 
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.techstack.map((t) => (
                      <Badge key={t} variant="secondary" className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl bg-primary/20 text-primary border-primary/20 text-[10px] md:text-sm font-bold uppercase tracking-tighter">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Progress Line */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary/30 transition-all duration-1000 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </Card>

      {/* Persistent Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 max-w-lg mx-auto px-4 md:px-0">
        <button 
          onClick={back} 
          disabled={step === 0} 
          className={cn(
            "flex items-center gap-2 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all w-full sm:w-auto justify-center sm:justify-start",
            step === 0 ? "opacity-0 pointer-events-none" : "text-muted-foreground hover:text-white"
          )}
        >
          <ChevronLeft className="w-5 h-5" /> Previous step
        </button>
        
        <div className="w-full sm:w-auto">
          {step < STEPS.length - 1 ? (
            <Button 
              onClick={next} 
              disabled={!canNext()} 
              loading={generatingQ}
              className="w-full sm:w-48 h-12 md:h-14 rounded-2xl shadow-xl shadow-primary/20 font-black tracking-widest gap-2 uppercase text-xs md:text-sm"
            >
              {step === 4 && form.questions.length === 0 ? "Generate" : "Continue"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreate} 
              loading={loading} 
              size="lg" 
              className="w-full sm:w-64 h-14 md:h-16 rounded-[20px] md:rounded-[24px] text-base md:text-lg font-black gap-3 shadow-2xl shadow-primary/40 transition-all hover:shadow-primary/60 hover:scale-[1.01] active:scale-[0.99] animate-pulse-slow"
            >
              🚀 Launch Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
