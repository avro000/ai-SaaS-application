import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
  { quote: "The Code Reviewer caught bugs our team missed. It's like having a senior developer on call 24/7.", author: "Priya Sharma", role: "Lead Developer", company: "TechFlow India", metric: { value: "60%", label: "Fewer bugs in production" } },
  { quote: "My resume went from zero callbacks to 5 interviews in a week. The optimizer knew exactly what recruiters want.", author: "Rahul Verma", role: "Software Engineer", company: "Career Seeker", metric: { value: "5x", label: "More interview calls" } },
  { quote: "Content Studio writes blog posts that sound like me. I just edit and publish. Saved hours every week.", author: "Anita Desai", role: "Content Manager", company: "Digital Buzz", metric: { value: "10hrs", label: "Saved weekly" } },
  { quote: "The SQL Generator is incredible. Complex queries that took me 30 minutes now take 30 seconds.", author: "Vikram Patel", role: "Data Analyst", company: "DataSync Labs", metric: { value: "60x", label: "Faster queries" } },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex((prev) => (prev + 1) % testimonials.length), 8000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index) => setActiveIndex(index);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const active = testimonials[activeIndex];

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 font-mono text-[10px] text-background/[0.02] leading-tight overflow-hidden whitespace-pre select-none">
        {Array.from({ length: 60 }, (_, row) => Array.from({ length: 100 }, (_, col) => { const seed = (row * 100 + col) * 9301 + 49297; return (seed % 233280) / 233280 > 0.7 ? '"' : ' '; }).join("")).join("\n")}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-20">
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-background/40 mb-4">
              <span className="w-12 h-px bg-background/20" />Testimonials
            </span>
            <h2 className={`text-4xl lg:text-5xl font-display transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Trusted by teams <span className="text-background/40">worldwide.</span>
            </h2>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={goPrev} className="p-4 border border-background/20 hover:bg-background/10 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <button onClick={goNext} className="p-4 border border-background/20 hover:bg-background/10 transition-colors"><ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7 relative">
            <span className="absolute -left-4 -top-8 text-[200px] font-display text-background/5 leading-none select-none">&ldquo;</span>
            <div className="relative">
              <blockquote key={activeIndex} className="text-3xl lg:text-4xl xl:text-5xl font-display leading-[1.2] tracking-tight animate-fadeSlideIn">{active.quote}</blockquote>
              <div className="mt-12 flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-background/10 flex items-center justify-center">
                  <span className="font-display text-xl">{active.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-lg font-medium">{active.author}</p>
                  <p className="text-background/60">{active.role}, {active.company}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center gap-6">
            <div key={`metric-${activeIndex}`} className="p-10 border border-background/20 bg-background/5 animate-fadeSlideIn">
              <span className="text-7xl lg:text-8xl font-display block mb-4">{active.metric.value}</span>
              <span className="text-lg text-background/60">{active.metric.label}</span>
            </div>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button key={idx} onClick={() => goTo(idx)} className="flex-1 h-1 bg-background/20 overflow-hidden">
                  <div className={`h-full bg-background transition-all duration-300 ${idx === activeIndex ? "w-full" : idx < activeIndex ? "w-full opacity-50" : "w-0"}`} style={idx === activeIndex ? { animation: "progress 8s linear forwards" } : {}} />
                </button>
              ))}
            </div>
            <div className="mt-4 pt-6 border-t border-background/10">
              <span className="text-xs font-mono text-background/30 uppercase tracking-widest block mb-4">Featured companies</span>
              <div className="flex flex-wrap gap-3">
                {testimonials.map((t, idx) => (
                  <button key={t.company} onClick={() => goTo(idx)} className={`px-4 py-2 text-sm border transition-all ${idx === activeIndex ? "border-background/40 text-background" : "border-background/10 text-background/40 hover:border-background/30"}`}>{t.company}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
