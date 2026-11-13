import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Zap } from "lucide-react";

const plans = [
  { name: "Free", description: "For trying out NexusAI tools", price: { monthly: 0, annual: 0 }, features: ["2 free generations per tool", "Basic output quality", "Community support", "Web access only", "Standard processing speed"], cta: "Start free", highlight: false },
  { name: "Pro", description: "For individuals and power users", price: { monthly: 499, annual: 399 }, features: ["Unlimited generations", "Premium output quality", "Priority support", "Download & export options", "Usage history & analytics", "Faster processing", "API access"], cta: "Start trial", highlight: true },
  { name: "Enterprise", description: "For teams and organizations", price: { monthly: null, annual: null }, features: ["Everything in Pro", "Team workspaces", "Admin dashboard", "SSO & SAML", "Dedicated support", "Custom integrations", "SLA guarantee", "Volume discounts"], cta: "Contact sales", highlight: false },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCta = (plan) => {
    if (plan.name === "Free") navigate("/register");
    else if (plan.name === "Pro") navigate("/register");
    else window.location.href = "mailto:hello@nexusai.com?subject=Enterprise Plan";
  };

  return (
    <section id="pricing" ref={sectionRef} className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
              <span className="w-12 h-px bg-foreground/30" />
              Pricing
            </span>
            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Pay for
              <br />
              <span className="text-stroke">results.</span>
            </h2>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <img
                src="/images/whale.png"
                alt="Organic whale"
                className="w-full h-full object-contain object-center"
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-0">
            {plans.map((plan, index) => (
              <div key={plan.name} className={`relative bg-background border transition-all duration-700 ${plan.highlight ? "border-foreground lg:-mx-2 lg:z-10 lg:scale-105" : "border-foreground/10 lg:first:-mr-2 lg:last:-ml-2"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`} style={{ transitionDelay: `${index * 100}ms` }}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest">
                      <Zap className="w-3 h-3" />Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8 lg:p-10">
                  <div className="mb-8 pb-8 border-b border-foreground/10">
                    <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-6xl font-display">{plan.price.monthly === 0 ? "Free" : `₹${isAnnual ? plan.price.annual : plan.price.monthly}`}</span>
                        {plan.price.monthly > 0 && <span className="text-muted-foreground text-sm">/month</span>}
                      </div>
                    ) : (
                      <span className="text-4xl font-display">Custom</span>
                    )}
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">{isAnnual ? "billed annually" : "billed monthly"}</p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-[#eca8d6] mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleCta(plan)} className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group cursor-pointer ${plan.highlight ? "bg-foreground text-background hover:bg-foreground/90" : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"}`}>
                    {plan.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {["No credit card required", "Cancel anytime", "Secure payments"].map((t) => (
              <span key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-[#eca8d6]" />{t}</span>
            ))}
          </div>
          <a href="#" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">Compare all features</a>
        </div>
      </div>
    </section>
  );
}
