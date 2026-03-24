import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Loader2, Volume2, ShieldCheck, Cpu, AlertTriangle } from "lucide-react";
import { cn } from "../utils/helpers";
import { interviewAPI } from "../api";
import { useToast } from "./ui/Toast";
import Button from "./ui/Button";
import Vapi from "@vapi-ai/web";

const CALL_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  ACTIVE: "active",
  ENDING: "ending",
  FINISHED: "finished",
};

export default function VoiceAgent({ interview, onFinished }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState(CALL_STATUS.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const timerRef = useRef(null);
  const transcriptRef = useRef([]);
  const isFetchingNextQ = useRef(false);
  const silenceTimeout = useRef(null);
  const vapiRef = useRef(null);
  const demoQuestionIndex = useRef(0);

  // Timer Setup
  useEffect(() => {
    if (status === CALL_STATUS.ACTIVE) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleEndInterview = useCallback(async (finalTranscript) => {
    setStatus(CALL_STATUS.ENDING);
    clearInterval(timerRef.current);
    try {
      await interviewAPI.update(interview._id, {
        transcript: finalTranscript,
        duration: timer,
        status: "completed",
      });

      toast({ title: "Analyzing…", description: "Generating your feedback card.", type: "info" });
      await interviewAPI.generateFeedback(interview._id);

      setStatus(CALL_STATUS.FINISHED);
      toast({ title: "Interview complete", type: "success" });

      if (onFinished) onFinished();
      else navigate(`/interviews/${interview._id}/feedback`);
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving session", description: err.message, type: "error" });
      setStatus(CALL_STATUS.ACTIVE);
    }
  }, [interview?._id, timer, navigate, onFinished, toast]);

  // Cross-browser speech synthesizer
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopInterview = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    } else {
      handleEndInterview(transcriptRef.current);
    }
  }, [handleEndInterview]);

  const askNextQuestion = useCallback(async (currentTranscript) => {
    if (isFetchingNextQ.current) return;
    isFetchingNextQ.current = true;
    
    if (isDemoMode) {
      // Demo Logic: Sequential questions from the planned list
      setTimeout(() => {
        demoQuestionIndex.current += 1;
        const nextQ = interview.questions[demoQuestionIndex.current] ;
        
        if (!nextQ) {
          speakText("Thank you for your time. This concludes our interview session. We will get back to you soon.");
          setTimeout(() => stopInterview(), 4000);
        } else {
          const entry = { role: "assistant", content: nextQ };
          transcriptRef.current = [...transcriptRef.current, entry];
          setTranscript([...transcriptRef.current]);
          speakText(nextQ);
        }
        isFetchingNextQ.current = false;
      }, 1000);
      return;
    }

    // Real AI Logic (Gemini)
    try {
      const { data } = await interviewAPI.generateNextQuestion(interview._id, currentTranscript);
      const nextQ = data.nextQuestion;

      if (nextQ === "END_INTERVIEW") {
        vapiRef.current?.say("This concludes our interview. Thank you and have a great day!");
        setTimeout(() => stopInterview(), 3000);
        return;
      }

      const assistantEntry = { role: "assistant", content: nextQ };
      transcriptRef.current = [...transcriptRef.current, assistantEntry];
      setTranscript([...transcriptRef.current]);
      vapiRef.current?.say(nextQ);
    } catch (err) {
      console.error("Gemini Failure:", err);
      // Panic to Demo Mode if Gemini fails during live session
      setIsDemoMode(true);
      toast({ title: "AI Sync Issues", description: "Interviewer shifted to safe mode.", type: "warning" });
    } finally {
      isFetchingNextQ.current = false;
    }
  }, [interview._id, interview.questions, isDemoMode, stopInterview, toast]);

  const getVapiToken = async () => {
    const API_BASE = import.meta.env.VITE_MOCK_API_URL || "http://localhost:5050/api";
    const res = await fetch(`${API_BASE}/vapi/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!res.ok) throw new Error("Vapi Authentication Failed");
    const data = await res.json();
    return data.token;
  };

  const startInterview = useCallback(async () => {
    setStatus(CALL_STATUS.CONNECTING);
    try {
      const isHindi = interview.language?.toLowerCase() === "hindi" || interview.language?.toLowerCase() === "hinglish";
      const sessionGreeting = isHindi
          ? `नमस्ते। मैं जैमिनी हूँ। चलिए आपका ${interview.role} का इंटरव्यू शुरू करते हैं। पहला सवाल: ${interview.questions[0] || "अपने बारे में बताइए।"}`
          : `Hello. I am Gemini. Let's start the ${interview.role} interview. First topic: ${interview.questions[0] || "Introduction"}`;

      // 1. Try Real AI Token
      let token;
      try {
        console.log("📡 Attempting Real AI Handshake...");
        token = await getVapiToken();
      } catch (tokenErr) {
        console.warn("⚠️ REAL AI INITIALIZATION FAILED:", tokenErr.message);
        throw new Error("Handshake failed. Pivoting to Demo Mode.");
      }

      vapiRef.current = new Vapi(token);
      
      vapiRef.current.on("call-start", () => {
        setStatus(CALL_STATUS.ACTIVE);
        const firstEntry = { role: "assistant", content: sessionGreeting };
        transcriptRef.current = [firstEntry];
        setTranscript([firstEntry]);
      });

      vapiRef.current.on("speech-start", () => setIsSpeaking(true));
      vapiRef.current.on("speech-end", () => setIsSpeaking(false));
      
      vapiRef.current.on("message", (msg) => {
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          const entry = { role: msg.role, content: msg.transcript };
          const lastMsg = transcriptRef.current[transcriptRef.current.length - 1];
          if (lastMsg && lastMsg.content === msg.transcript && lastMsg.role === msg.role) return;

          transcriptRef.current = [...transcriptRef.current, entry];
          setTranscript([...transcriptRef.current]);

          if (msg.role === "user") {
            if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
            silenceTimeout.current = setTimeout(() => askNextQuestion(transcriptRef.current), 2500);
          }
        }
      });

      vapiRef.current.on("call-end", () => handleEndInterview(transcriptRef.current));

      await vapiRef.current.start({
        model: { 
          provider: "openai", 
          model: "gpt-3.5-turbo", 
          messages: [{ role: "system", content: "You are an AI interviewer." }]
        },
        voice: { 
          provider: "elevenlabs", 
          voiceId: "2zRM7PkgwBPiau2jvVXc",
          model: "eleven_multilingual_v2"
        },
        firstMessage: sessionGreeting
      });

    } catch (err) {
      console.log("%c🛠️ EMERGENCY DEMO MODE ACTIVATED", "color: #f59e0b; font-weight: bold;");
      setIsDemoMode(true);
      setStatus(CALL_STATUS.ACTIVE);
      
      const greeting = `[DEMO MODE] Hello! I'm your interviewer. Vapi is currently unavailable, so I'll lead you through our standard questions. Let's start with: ${interview.questions[0] || "Can you tell me about yourself?"}`;
      
      const entry = { role: "assistant", content: greeting };
      transcriptRef.current = [entry];
      setTranscript([entry]);
      speakText(greeting);

      toast({ 
        title: "Secure Bridge Active", 
        description: "Vapi keys are unconfigured. Switching to Browser-Voice Mode.", 
        type: "info" 
      });
    }
  }, [interview, toast, handleEndInterview, askNextQuestion]);

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Identity Badges */}
      <div className="flex items-center gap-4">
        {isDemoMode ? (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Standard Mode (Vapi Offline)
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            Real AI Orchestration
          </div>
        )}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest">
          <Cpu className="w-3 h-3" />
          Powered by Gemini 2.0
        </div>
      </div>

      {/* Pulsing Core */}
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "absolute w-64 h-64 rounded-full transition-all duration-1000 blur-3xl",
          isSpeaking ? "bg-primary/20 scale-125" : "bg-transparent scale-100"
        )} />
        
        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-2xl z-10",
          status === CALL_STATUS.ACTIVE && (isSpeaking ? "bg-primary border-primary scale-110 glow-primary" : "bg-secondary border-border")
        )}>
          {status === CALL_STATUS.IDLE && <Mic className="w-12 h-12 text-muted-foreground" />}
          {status === CALL_STATUS.CONNECTING && <Loader2 className="w-12 h-12 text-primary animate-spin" />}
          {status === CALL_STATUS.ACTIVE && (isSpeaking ? <Volume2 className="w-12 h-12 text-white" /> : <Mic className={cn("w-12 h-12", isMuted ? "text-destructive" : "text-foreground")} />)}
        </div>
      </div>

      {/* Start/Stop Controls */}
      <div className="text-center w-full max-w-md">
        {status === CALL_STATUS.IDLE && (
          <Button size="lg" onClick={startInterview} className="px-10 py-8 rounded-full glow-primary hover:scale-105 active:scale-95 transition-all w-full">
            Begin Interview Session
          </Button>
        )}
        
        {status === CALL_STATUS.ACTIVE && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsMuted(!isMuted)} className={cn("w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all", isMuted ? "bg-destructive/10 border-destructive text-destructive" : "bg-secondary border-border")}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={stopInterview} className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all">
                <PhoneOff className="w-8 h-8" />
              </button>
            </div>
            <p className="font-mono text-muted-foreground">{formatTimer(timer)}</p>
          </div>
        )}
      </div>

      {/* Interview Feed */}
      {transcript.length > 0 && (
        <div className="w-full max-h-96 overflow-y-auto space-y-4 glass-dark rounded-[2.5rem] p-8 border border-white/5 scrollbar-hide">
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.3em] mb-4 text-center">Live Transcription {isDemoMode && "(Browser Fallback)"}</p>
          {transcript.map((entry, i) => (
            <div key={i} className={cn("flex", entry.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm transiton-all duration-300", entry.role === "user" ? "bg-primary/20 text-foreground border border-primary/30 rounded-br-none" : "bg-white/5 text-foreground border border-white/10 rounded-tl-none")}>
                <p className="text-[10px] font-bold mb-2 opacity-50 uppercase tracking-widest text-primary">
                  {entry.role === "user" ? "Candidate Response" : isDemoMode ? "Mock Interviewer" : "Gemini AI"}
                </p>
                <p className="leading-relaxed">{entry.content}</p>
              </div>
            </div>
          ))}
          {isDemoMode && status === CALL_STATUS.ACTIVE && (
             <div className="flex justify-center pt-4">
                <Button variant="outline" size="sm" onClick={() => {
                   const answer = "I have several years of experience in this field and I am looking for a new challenge.";
                   const entry = { role: "user", content: answer };
                   transcriptRef.current = [...transcriptRef.current, entry];
                   setTranscript([...transcriptRef.current]);
                   askNextQuestion(transcriptRef.current);
                }}>Simulate Answer</Button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
