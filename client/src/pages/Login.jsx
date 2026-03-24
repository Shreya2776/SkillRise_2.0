/**
 * Login Page — Dark futuristic design matching the landing page
 * Features: Email/password login, Google OAuth, forgot password link
 */
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import API from "../services/authService";
import ParticleField from "../components/landing/ParticleField";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "ngo") {
        window.location.href = "/ngo";
      } else {
        window.location.href = "/dashboard";
      }
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/login", form);
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // Role-based redirection
      if (user.role === "admin") {
        window.location.href = "/admin";
      } else if (user.role === "ngo") {
        window.location.href = "/ngo";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06060a] flex items-center justify-center px-6 py-12">
      {/* Background effects */}
      <ParticleField />
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Rise</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 sm:p-12 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-white/30 font-medium">Sign in to continue your career journey</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-5 py-4 mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
            >
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-14 pr-5 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder-white/20 font-medium focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-14 pr-14 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder-white/20 font-medium focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-violet-400/70 hover:text-violet-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 py-4.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs font-bold text-white/15 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={() => window.location.href = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/auth") + "/google"}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white/70 font-bold hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Register Link */}
          <p className="text-center mt-10 text-sm text-white/25 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}