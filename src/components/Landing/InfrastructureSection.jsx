import { useEffect, useState, useRef } from "react";

const regions = [
  { name: "Code Reviewer", nodes: 20, status: "operational" },
  { name: "Resume Optimizer", nodes: 15, status: "operational" },
  { name: "Content Studio", nodes: 18, status: "operational" },
  { name: "SQL Generator", nodes: 12, status: "operational" },
];

export default function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeRegion, setActiveRegion] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveRegion((prev) => (prev + 1) % regions.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="infra" ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-20">
          <span className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <span className="w-12 h-px bg-foreground/20" />Platform
          </span>
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-stretch">
            <div className={`w-48 lg:w-72 xl:w-80 shrink-0 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/world-3i68QNWJwmO7W19ztZWbevAwJQHzYL.png" alt="Global network sphere" className="w-full h-full object-contain object-center" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                Five tools,<br /><span className="text-muted-foreground">infinite power.</span>
              </h2>
              <p className={`mt-8 text-xl text-muted-foreground leading-relaxed max-w-lg transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`}>
                All tools powered by advanced AI models. Fast processing, accurate results, available 24/7.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 relative p-8 lg:p-12 border border-foreground/10 bg-foreground/[0.02] overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="absolute inset-0 opacity-70">
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                {[...Array(19)].map((_, i) => {
                  const x1 = 10 + (i % 5) * 20, y1 = 10 + Math.floor(i / 5) * 25;
                  const x2 = 10 + ((i + 1) % 5) * 20, y2 = 10 + Math.floor((i + 1) / 5) * 25;
                  return <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} className="connecting-line" style={{ animationDelay: `${i * 0.15}s` }} />;
                })}
              </svg>
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-[#eca8d6]" style={{ left: `${10 + (i % 5) * 20}%`, top: `${10 + Math.floor(i / 5) * 25}%`, animation: `pulse 2s ease-in-out ${i * 0.1}s infinite` }} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-8xl lg:text-[10rem] font-display leading-none">5</span>
                <span className="text-2xl text-muted-foreground">AI tools</span>
              </div>
              <p className="text-muted-foreground max-w-md">Code Review, Resume Optimizer, Content Studio, Smart Summarizer, and SQL Generator.</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`p-8 border border-foreground/10 bg-foreground/[0.02] transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="text-5xl lg:text-6xl font-display">99.9%</span>
              <span className="block text-sm text-muted-foreground mt-2">Uptime</span>
            </div>
            <div className={`p-8 border border-foreground/10 bg-foreground/[0.02] transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="text-5xl lg:text-6xl font-display">&lt;2s</span>
              <span className="block text-sm text-muted-foreground mt-2">Avg response time</span>
            </div>
          </div>
        </div>

        <div className={`mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          {regions.map((region, index) => (
            <div key={region.name} className={`p-6 border transition-all duration-300 cursor-default ${activeRegion === index ? "border-foreground/30 bg-foreground/[0.04]" : "border-foreground/10"}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full transition-colors ${activeRegion === index ? "bg-[#eca8d6]" : "bg-foreground/20"}`} />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{region.status}</span>
              </div>
              <span className="font-medium block mb-1">{region.name}</span>
              <span className="text-sm text-muted-foreground">{region.nodes}+ languages</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
