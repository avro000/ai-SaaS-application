import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  { icon: Shield, title: "Data never stored", description: "Your inputs are processed and discarded. We don't keep your data.", image: "/images/isolated.jpg" },
  { icon: Lock, title: "End-to-end encryption", description: "TLS 1.3 encryption for all data in transit.", image: "/images/encrypted.jpg" },
  { icon: Eye, title: "Privacy first", description: "Your data is never used to train our models.", image: "/images/audit.jpg" },
  { icon: FileCheck, title: "Compliance ready", description: "SOC 2 Type II certified. GDPR compliant.", image: "/images/permissions.jpg" },
];
const certifications = ["SOC 2", "ISO 27001", "HIPAA", "GDPR"];

export default function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature((prev) => (prev + 1) % securityFeatures.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" ref={sectionRef} className="relative py-32 lg:py-40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-20">
          <span className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <span className="w-12 h-px bg-foreground/20" />Security
          </span>
          <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Your data,<br /><span className="text-muted-foreground">your control.</span>
          </h2>
          <div className={`transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">We take security seriously. Your code, resumes, and documents are processed securely and never retained.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-7 relative p-8 lg:p-12 border border-foreground/10 min-h-[400px] overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Dynamic feature image with cross-fade — desktop only */}
            <div className="absolute inset-0 pointer-events-none items-center justify-end hidden lg:flex">
              {securityFeatures.map((feature, index) => (
                <img
                  key={feature.title}
                  src={feature.image}
                  alt={feature.title}
                  className="absolute h-3/4 w-3/4 object-contain object-right transition-opacity duration-500"
                  style={{ opacity: activeFeature === index ? 0.85 : 0 }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <span className="font-mono text-sm text-muted-foreground">Active protection</span>
              <div className="mt-8">
                <span className="text-7xl lg:text-8xl font-display">0</span>
                <span className="block text-muted-foreground mt-2">Security incidents this year</span>
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <span key={cert} className={`px-3 py-1 border border-foreground/10 text-xs font-mono text-muted-foreground transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${index * 100 + 300}ms` }}>{cert}</span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title}
                  className={`p-6 border transition-all duration-500 cursor-default ${activeFeature === index ? "border-foreground/30 bg-foreground/[0.04]" : "border-foreground/10"} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 flex items-center justify-center border transition-colors ${activeFeature === index ? "border-foreground bg-foreground text-background" : "border-foreground/20"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
