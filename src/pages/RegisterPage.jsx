import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { warningToast } from '../components/UI/CustomToast';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import DustParticles from '../components/DustParticles';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [otpState, setOtpState] = useState(false);
  const [otp, setOtp] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, verifyOtp, resendOtp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        toast.success('Welcome to NexusAI!');
        navigate(from, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google registration failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google registration failed'),
  });

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(pwd)) return 'Password must contain at least one digit';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      warningToast('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      warningToast('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      warningToast('Please enter a valid email address');
      return;
    }
    if (!password) {
      warningToast('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      warningToast('Passwords do not match');
      return;
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }
    
    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.requireOtp) {
        toast.success(res.message || 'OTP sent successfully!');
        setOtpState(true);
        setResendCooldown(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      warningToast('Please enter the verification code');
      return;
    }
    if (otp.length !== 6) {
      warningToast('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp.toUpperCase());
      toast.success('Account verified! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden font-sans">
      {/* ─── Left panel — Minimalist Tree Image ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <img 
            src="/images/IMG5.png" 
            alt="Background"
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
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
            Onboarding
          </span>
          <h1 className="text-5xl xl:text-[5rem] font-display leading-[0.9] tracking-tight text-white mb-6">
            <span className="block">Scale your</span>
            <span className="block text-white/40">workflow.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-md leading-relaxed font-light mb-12">
            Join the platform that unifies AI capabilities. Execute complex, multi-step tasks across a single, integrated environment.
          </p>

          {/* Benefits */}
          <div className={`space-y-4 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {[
              'Enterprise-grade security & isolation',
              'Unified interface for 5 distinct AI models',
              'Zero setup required. Instant access.',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 text-sm text-white/50 tracking-wide font-light">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 border border-white/20 rounded-sm">
                  <Check className="w-3 h-3 text-white" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── Right panel — Clean Form ─── */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-16 relative bg-[oklch(0.06_0.008_260)] scrollbar-thin">
        <div className="min-h-full flex flex-col justify-center py-8">
          <div className={`w-full max-w-[400px] mx-auto transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          <button onClick={() => navigate('/')} className="group inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors mb-8 uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to home
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <span className="font-display text-2xl tracking-tight text-white">NexusAI</span>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-display text-white tracking-tight mb-3">Create account.</h2>
            <p className="text-white/40">Initialize your workspace in seconds.</p>
          </div>

          {!otpState ? (
            <div>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                  placeholder="John Doe"
                />
              </div>

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
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-0 py-3 pr-10 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 special char"
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

              <div className="space-y-2 relative pt-2">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Initialize workspace
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
          </div>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
              <div className="mb-4">
                <p className="text-sm text-[#eca8d6] bg-[#eca8d6]/10 p-4 border border-[#eca8d6]/20 rounded-sm">
                  We've sent a 6-digit verification code to <b>{email}</b>. Please enter it below.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  className="w-full px-0 py-3 bg-transparent border-b border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="XXXXXX"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & Continue
                    <Check className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-white/40">
                    Resend code in <span className="text-[#eca8d6] font-mono">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await resendOtp(email);
                        toast.success(res.message || 'New OTP sent!');
                        setResendCooldown(60);
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed to resend OTP');
                      }
                    }}
                    className="text-sm text-[#eca8d6] hover:text-[#eca8d6]/80 transition-colors underline decoration-[#eca8d6]/30 underline-offset-4 cursor-pointer"
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-[#eca8d6] hover:text-[#eca8d6]/80 transition-colors ml-2 underline decoration-[#eca8d6]/30 underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
