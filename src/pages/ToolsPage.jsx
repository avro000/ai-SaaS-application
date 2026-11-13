import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import { 
  Code2, 
  FileText, 
  PenTool, 
  BookOpen, 
  Database,
  ArrowRight,
  Sparkles,
  Zap,
  Check
} from "lucide-react";

const tools = [
  {
    id: "code-reviewer",
    number: "01",
    title: "AI Code Reviewer",
    shortTitle: "Code Review",
    description: "Get instant, comprehensive code reviews with actionable suggestions. Supports 20+ programming languages including Python, JavaScript, TypeScript, Go, Rust, and more.",
    icon: Code2,
    stats: { value: "20+", label: "languages supported" },
    features: ["Syntax analysis", "Security scanning", "Performance tips", "Best practices"],
  },
  {
    id: "resume-optimizer",
    number: "02",
    title: "Resume Optimizer",
    shortTitle: "Resume",
    description: "Transform your resume with AI-powered suggestions. Get ATS-friendly formatting, keyword optimization, and tailored recommendations for your target role.",
    icon: FileText,
    stats: { value: "85%", label: "interview rate boost" },
    features: ["ATS optimization", "Keyword matching", "Format suggestions", "Role targeting"],
  },
  {
    id: "content-studio",
    number: "03",
    title: "Content Studio",
    shortTitle: "Content",
    description: "Generate blog posts, social media content, and marketing copy. Multiple tones and styles to match your brand voice perfectly.",
    icon: PenTool,
    stats: { value: "50+", label: "content templates" },
    features: ["Blog generation", "Social media", "Email copy", "Ad creative"],
  },
  {
    id: "smart-summarizer",
    number: "04",
    title: "Smart Summarizer",
    shortTitle: "Summarize",
    description: "Condense long documents, articles, and reports into clear, actionable summaries. Extract key insights and main points in one click.",
    icon: BookOpen,
    stats: { value: "10x", label: "faster reading" },
    features: ["Document analysis", "Key extraction", "Bullet points", "Executive summaries"],
  },
  {
    id: "sql-generator",
    number: "05",
    title: "SQL Generator",
    shortTitle: "SQL",
    description: "Convert natural language to SQL queries instantly. Works with PostgreSQL, MySQL, SQLite, SQL Server, and more databases.",
    icon: Database,
    stats: { value: "99%", label: "query accuracy" },
    features: ["Natural language", "Multi-dialect", "Query optimization", "Schema aware"],
  },
];

// Floating particles background
function ParticleField() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 50;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

function ToolCard({ tool, index, isVisible }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState(null);
  const Icon = tool.icon;

  const linkPath = tool.id === "code-reviewer" ? "/tools/code-reviewer" : 
                   tool.id === "resume-optimizer" ? "/tools/resume-optimizer" : 
                   tool.id === "content-studio" ? "/tools/content-studio" : 
                   tool.id === "smart-summarizer" ? "/tools/smart-summarizer" : 
                   tool.id === "sql-generator" ? "/tools/sql-generator" : "#";
  const isTargetBlank = tool.id === "code-reviewer" || tool.id === "resume-optimizer" || tool.id === "content-studio" || tool.id === "smart-summarizer" || tool.id === "sql-generator";

  return (
    <Link
      to={linkPath}
      target={isTargetBlank ? "_blank" : undefined}
      className={`group relative overflow-hidden p-8 lg:p-10 border transition-all duration-500 block cursor-pointer ${
        isHovered
          ? "border-foreground bg-foreground/[0.04] scale-[1.02]"
          : "border-foreground/10 hover:border-foreground/30"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos(null);
      }}
    >
      {/* Cursor-following halo */}
      {isHovered && mousePos && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Number tag - top right */}
      <span className={`absolute top-4 right-4 text-[10px] font-mono px-2 py-0.5 transition-colors ${
        isHovered
          ? "bg-foreground text-background"
          : "bg-foreground/10 text-muted-foreground"
      }`}>
        {tool.number}
      </span>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-10 h-10 mb-6 flex items-center justify-center transition-colors ${
          isHovered ? "text-white" : "text-foreground/60"
        }`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="font-medium text-xl mb-3">{tool.title}</h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {tool.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {tool.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className={`w-3 h-3 transition-colors ${isHovered ? "text-foreground/70" : "text-foreground/40"}`} />
              {feature}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-baseline gap-3 pt-4 border-t border-foreground/10">
          <span className={`text-3xl font-display transition-colors ${isHovered ? "text-foreground" : "text-foreground/80"}`}>{tool.stats.value}</span>
          <span className="text-sm text-muted-foreground">{tool.stats.label}</span>
        </div>
      </div>

      {/* Animated underline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/20 overflow-hidden">
        <div className={`h-full bg-foreground transition-all duration-500 ${
          isHovered ? "w-full" : "w-0"
        }`} />
      </div>
    </Link>
  );
}

export default function ToolsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleField />
      <Navigation />

      {/* Hero Section - compact to fit viewport */}
      <section className="relative pt-[100px] pb-4 lg:pb-6">
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute h-px bg-foreground/10 line-reveal"
              style={{
                top: `${12.5 * (i + 1)}%`,
                left: 0,
                right: 0,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute w-px bg-foreground/10 line-reveal"
              style={{
                left: `${8.33 * (i + 1)}%`,
                top: 0,
                bottom: 0,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Eyebrow */}
          <div
            className={`mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-white/50">
              <span className="w-8 h-px bg-white/20" />
              AI-Powered Tools
            </span>
          </div>

          {/* Main headline */}
          <div className="grid lg:grid-cols-12 gap-4 lg:gap-8 items-center mb-6">
            <div className="lg:col-span-6">
              <h1
                className={`text-5xl md:text-6xl lg:text-[96px] font-display leading-[0.92] tracking-tight text-white transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Five tools,
                <br />
                <span className="text-white/50">infinite possibilities.</span>
              </h1>
            </div>
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                className={`relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px] transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG4-i3Qpkjv82k6XZiqS5hUfOf8bs7Ufh5.png"
                  alt="AI-powered geometric structure"
                  className="w-full h-full object-contain"
                />
                {/* Subtle glow effect behind image */}
                <div 
                  className="absolute inset-0 -z-10 scale-125 blur-3xl opacity-30"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(255, 140, 100, 0.3) 0%, transparent 70%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div
            className={`flex flex-wrap gap-6 lg:gap-12 pt-4 lg:pt-6 pb-12 border-b border-white/[0.08] transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {[
              { icon: Sparkles, value: "5", label: "AI tools" },
              { icon: Zap, value: "<2s", label: "response time" },
              { icon: Check, value: "99.9%", label: "uptime" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <span className="text-2xl font-display text-white/90">{stat.value}</span>
                  <span className="block text-xs text-white/40 font-mono">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section ref={sectionRef} className="relative z-10 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Tool filter tabs */}
          <div
            className={`flex flex-wrap gap-3 py-6 transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => setActiveTab(null)}
              className={`px-4 py-2 text-sm font-mono rounded-sm border transition-all duration-300 cursor-pointer ${
                activeTab === null
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/50 border-white/[0.08] hover:border-white/20 hover:text-white/70"
              }`}
            >
              All Tools
            </button>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`px-4 py-2 text-sm font-mono rounded-sm border transition-all duration-300 cursor-pointer ${
                  activeTab === tool.id
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/50 border-white/[0.08] hover:border-white/20 hover:text-white/70"
                }`}
              >
                {tool.shortTitle}
              </button>
            ))}
          </div>

          {/* Tools grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools
              .filter((tool) => activeTab === null || tool.id === activeTab)
              .map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} isVisible={isVisible} />
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div
            className={`relative bg-white/[0.02] border border-white/[0.06] rounded-sm p-12 lg:p-16 text-center overflow-hidden transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Subtle radial glow */}
            <div 
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.03) 0%, transparent 60%)",
              }}
            />
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-display text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
                Join thousands of professionals using NexusAI to supercharge their workflow. Start free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-white text-black hover:bg-white/90 px-8 h-14 text-base font-medium transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a
                  href="/#pricing"
                  className="inline-flex items-center justify-center rounded-full px-8 h-14 text-base font-medium border border-white/[0.12] text-white/70 hover:bg-white/[0.04] hover:text-white hover:border-white/20 transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
