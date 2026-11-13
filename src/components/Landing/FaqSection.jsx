import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "What AI tools are included in NexusAI?", answer: "NexusAI includes 5 powerful AI tools: Code Reviewer (supports 20+ programming languages), Resume Optimizer (ATS-friendly formatting), Content Studio (blog posts, social media, marketing copy), Smart Summarizer (documents, articles, reports), and SQL Generator (PostgreSQL, MySQL, SQLite)." },
  { question: "How does the free tier work?", answer: "The free tier gives you 2 generations per tool with no credit card required. This lets you try all 5 tools and see the quality of results before upgrading. Free users get standard processing speed and basic output quality." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI, net banking, and popular wallets. All payments are processed securely through Razorpay. Enterprise customers can also pay via invoice." },
  { question: "Can I cancel my subscription anytime?", answer: "Yes, you can cancel your Pro subscription at any time from your dashboard. You'll continue to have access until the end of your billing period. No questions asked, no hidden fees." },
  { question: "Is my data secure?", answer: "Absolutely. We don't store your input data after processing. All transmissions are encrypted with TLS 1.3, and we're SOC 2 Type II compliant. Your code, resumes, and documents are never used to train our models." },
  { question: "Do you offer refunds?", answer: "Yes, we offer a 7-day money-back guarantee for Pro subscriptions. If you're not satisfied, contact us within 7 days of purchase for a full refund. Enterprise contracts have custom terms." },
];

export default function FaqSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className={`absolute bottom-0 right-0 w-[55%] h-[85%] pointer-events-none transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2813%29-OQ2DiR3ElVsUg8kTvTL1kC5A3Q6maM.png" alt="" aria-hidden="true" className="w-full h-full object-cover object-left-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className={`mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />FAQ
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]">
            Questions?<br /><span className="text-muted-foreground">We have answers.</span>
          </h2>
        </div>

        <div className={`max-w-[55%] transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`border border-foreground/10 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${index * 50 + 200}ms` }}>
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left hover:bg-foreground/5 transition-colors">
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-48" : "max-h-0"}`}>
                  <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
