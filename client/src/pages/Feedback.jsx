import React, { useState } from 'react';
import { Send, Star, Sparkles, MessageSquare, AlertCircle, Heart, CheckCircle2 } from 'lucide-react';
import { cn } from '../services/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import axios from 'axios';

const FeedbackActionCard = ({ title, description, icon: Icon, colorClass, borderClass }) => (
  <Card className={cn(
    "group transition-all duration-300 cursor-pointer overflow-hidden",
    borderClass
  )}>
    <CardContent className="p-6 flex flex-col items-center text-center md:items-start md:text-left h-full">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border", colorClass)}>
        <Icon size={24} />
      </div>
      <h3 className="text-white font-bold mb-3 text-lg tracking-tight">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed font-medium">{description}</p>
    </CardContent>
  </Card>
);

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/persistence/feedback`,
        {
          rating,
          message,
          category: 'general',
          page: 'feedback',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsSubmitted(true);
      setMessage('');
      setRating(0);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-12 px-6 pb-24 relative animate-in fade-in duration-700 bg-[#06060a] min-h-[calc(100vh-100px)]">
      
      {/* Immersive Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full -z-10" />

      {/* Header Section */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center mb-16">
        <Badge variant="outline" className="mb-6">
          <MessageSquare size={14} className="text-indigo-400 mr-2" />
          Community Interface
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
          Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 italic">Insights</span>
        </h1>
        <p className="text-lg text-white/40 max-w-xl leading-relaxed font-medium">
          Help us refine the SkillRise AI experience. Every piece of feedback directly influences our neural development path.
        </p>
      </div>

      {/* Submission Status Overlay */}
      {isSubmitted && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Feedback Transmitted</span>
          </div>
        </div>
      )}

      {/* Main Page Content Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col">
          <Card className="p-8 md:p-12 shadow-2xl h-full flex flex-col border-indigo-500/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <form onSubmit={handleSubmit} className="space-y-12 flex-1 flex flex-col relative z-10">
              
              {/* Star Rating Interaction */}
              <div className="flex flex-col items-center space-y-6">
                <span className="text-xs font-black text-white/30 uppercase tracking-widest">Experience Rating</span>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button 
                      key={num}
                      type="button"
                      onMouseEnter={() => setHoveredRating(num)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(num)}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-inner",
                        (hoveredRating || rating) >= num 
                          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-110" 
                          : "bg-white/5 border-white/10 text-white/20 hover:text-white/40 hover:bg-white/10"
                      )}
                    >
                      <Star size={24} fill={(hoveredRating || rating) >= num ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-4">
                <label className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">Detail Narrative</label>
                <div className="relative group">
                  <textarea 
                    required
                    rows="6"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Express your technical findings or feature suggestions..."
                    className="w-full bg-[#12121a] border border-white/10 rounded-3xl p-6 text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.02] focus:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition-all resize-none text-base leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={submitting || !message.trim()}
                  className="w-full py-6 rounded-3xl uppercase tracking-widest text-xs gap-3 group disabled:opacity-60"
                >
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {submitting ? 'Submitting...' : 'Transmit Module'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Secondary Cards */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          <FeedbackActionCard 
            title="Technical Bug" 
            description="Report anomalies in our AI processing modules."
            icon={AlertCircle}
            colorClass="bg-red-500/10 text-red-400 border-red-500/20"
            borderClass="hover:border-red-500/30"
          />
          <FeedbackActionCard 
            title="Feature Request" 
            description="Influence the technical roadmap with your vision."
            icon={Sparkles}
            colorClass="bg-amber-500/10 text-amber-400 border-amber-500/20"
            borderClass="hover:border-amber-500/30"
          />
          <FeedbackActionCard 
            title="Community Project" 
            description="Collaborative initiatives and open-source contributions."
            icon={Heart}
            colorClass="bg-pink-500/10 text-pink-400 border-pink-500/20"
            borderClass="hover:border-pink-500/30"
          />
          
          {/* Subtle Help Text */}
          <Card className="mt-auto bg-indigo-500/5 border-indigo-500/20">
             <CardContent className="p-6 flex items-start gap-4">
               <div className="shrink-0 text-indigo-400 mt-1"><Sparkles size={16} /></div>
               <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-widest">
                 Our average response cycle for technical queries is <span className="text-white font-bold">24 hours</span>.
               </p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
