import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { warningToast } from '../components/ui/CustomToast';
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import DustParticles from '../components/DustParticles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpPassword, setFpPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [showFpPassword, setShowFpPassword] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        toast.success('Welcome back.');
        navigate(from, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google login failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      warningToast('Please enter your email address');
      return;
    }
    if (!password) {
      warningToast('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back.');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) {
      warningToast('Please enter your email address');
      return;
    }
    setFpLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: fpEmail });
      toast.success(res.data.message || 'Verification code sent!');
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request code');
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    if (fpOtp.length !== 6) {
      warningToast('Please enter a 6-digit code');
      return;
    }
    setForgotStep(3);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!fpPassword) {
      warningToast('Please enter a new password');
      return;
    }
    if (fpPassword !== fpConfirmPassword) {
      warningToast('Passwords do not match');
      return;
    }
    setFpLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { 
        email: fpEmail, 
        otp: fpOtp.toUpperCase(), 
        newPassword: fpPassword 
      });
      toast.success(res.data.message || 'Password reset successful!');
      setForgotMode(false);
      setForgotStep(1);
      setFpEmail('');
      setFpOtp('');
      setFpPassword('');
      setFpConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setFpLoading(false);
    }
  };

  const renderStandardLogin = () => (
    <>
      <div className="mb-12">
        <h2 className="text-4xl font-display text-white tracking-tight mb-3">Welcome back.</h2>
        <p className="text-white/40">Enter your credentials to access the platform.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
            placeholder="hello@example.com"
          />
        </div>

        <div className="space-y-2 relative">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Password</label>
            <button 
              type="button" 
              onClick={() => setForgotMode(true)}
              className="text-[10px] font-mono text-white/40 hover:text-white transition-colors uppercase tracking-wider"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-3 pr-10 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              Sign in to workspace
              <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-mono">
          <span className="bg-[oklch(0.06_0.008_260)] px-4 text-white/30">Or</span>
        </div>
      </div>

      <button
        onClick={() => googleLogin()}
        disabled={googleLoading || loading}
        className="w-full mt-8 py-4 bg-transparent border border-white/10 text-white font-medium tracking-wide hover:bg-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
      >
        {googleLoading ? (
          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </>
        )}
      </button>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-sm text-white/40">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#eca8d6] hover:text-[#eca8d6]/80 transition-colors ml-2 underline decoration-[#eca8d6]/30 underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </>
  );

  const renderForgotPassword = () => (
    <div className="animate-fade-in">
      <button 
        onClick={() => {
          setForgotMode(false);
          setForgotStep(1);
          setFpEmail('');
          setFpOtp('');
          setFpPassword('');
          setFpConfirmPassword('');
        }} 
        className="group inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors mb-8 uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to login
      </button>

      <div className="mb-10">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <KeyRound className="w-5 h-5 text-white/70" />
        </div>
        <h2 className="text-4xl font-display text-white tracking-tight mb-3">Reset Password</h2>
        <p className="text-white/40">
          {forgotStep === 1 && "Enter your email to receive a verification code."}
          {forgotStep === 2 && "Enter the 6-digit code sent to your email."}
          {forgotStep === 3 && "Create a new strong password."}
        </p>
      </div>

      {forgotStep === 1 && (
        <form onSubmit={handleForgotEmailSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Email address</label>
            <input
              type="email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
              placeholder="hello@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={fpLoading}
            className="w-full mt-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
          >
            {fpLoading ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Send Code"}
          </button>
        </form>
      )}

      {forgotStep === 2 && (
        <form onSubmit={handleForgotOtpSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Verification Code</label>
            <input
              type="text"
              value={fpOtp}
              onChange={(e) => setFpOtp(e.target.value)}
              maxLength={6}
              className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors uppercase tracking-[0.5em] text-lg font-mono text-center"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            Verify Code
          </button>
        </form>
      )}

      {forgotStep === 3 && (
        <form onSubmit={handleResetPasswordSubmit} noValidate className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-xs font-mono text-white/50 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showFpPassword ? 'text' : 'password'}
                value={fpPassword}
                onChange={(e) => setFpPassword(e.target.value)}
                className="w-full px-0 py-3 pr-10 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowFpPassword(!showFpPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                {showFpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-white/30 font-mono mt-2">Must be 8+ chars, 1 uppercase, 1 number, 1 special char.</p>
          </div>

          <div className="space-y-2 relative pt-2">
            <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showFpPassword ? 'text' : 'password'}
              value={fpConfirmPassword}
              onChange={(e) => setFpConfirmPassword(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={fpLoading}
            className="w-full mt-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
          >
            {fpLoading ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden font-sans">
      {/* ─── Left panel — Minimalist Hero Video ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/IMG1.png" 
            alt="Background"
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Dust Particles Overlay */}
        <DustParticles />

        {/* Minimal Grid Overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]">
          {[...Array(8)].map((_, i) => (
            <div key={`h-${i}`} className="absolute h-px bg-white" style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }} />
          ))}
          {[...Array(12)].map((_, i) => (
            <div key={`v-${i}`} className="absolute w-px bg-white" style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }} />
          ))}
        </div>

        {/* Top: Logo */}
        <div className={`relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-tight text-white">NexusAI</span>
          </div>
        </div>

        {/* Center: Typography */}
        <div className={`relative z-10 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 mb-8 tracking-widest uppercase">
            <span className="w-8 h-px bg-white/30" />
            Authentication
          </span>
          <h1 className="text-5xl xl:text-[5rem] font-display leading-[0.9] tracking-tight text-white mb-6">
            <span className="block">Your AI</span>
            <span className="block text-white/40">workspace.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-md leading-relaxed font-light">
            Access five powerful AI tools from a single, unified interface. Built for speed, designed for clarity.
          </p>
        </div>

        {/* Bottom: Tools List */}
        <div className={`relative z-10 flex flex-wrap gap-3 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {['Code', 'Resume', 'Content', 'Summary', 'SQL'].map((t, i) => (
            <span key={i} className="px-3 py-1.5 border border-[#eca8d6] text-xs font-mono text-[#eca8d6] uppercase tracking-widest bg-transparent">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Right panel — Clean Form ─── */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-16 relative bg-[oklch(0.06_0.008_260)] scrollbar-thin">
        <div className="min-h-full flex flex-col justify-center py-8">
          <div className={`w-full max-w-[400px] mx-auto transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {!forgotMode && (
            <button onClick={() => navigate('/')} className="group inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors mb-8 uppercase tracking-wider cursor-pointer">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to home
            </button>
          )}

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <span className="font-display text-2xl tracking-tight text-white">NexusAI</span>
          </div>

          {forgotMode ? renderForgotPassword() : renderStandardLogin()}

          </div>
        </div>
      </div>
    </div>
  );
}
