import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import toast from "react-hot-toast";
import { warningToast } from "../components/UI/CustomToast";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  FileText,
  Upload,
  Clock,
  Zap,
  Layers,
  ListChecks,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  FileCode,
  TrendingDown,
  Tag,
  CheckCircle2,
  Eye,
  RefreshCw,
  FileDown
} from "lucide-react";

// ─── Supported LLM Models ───
const supportedModels = [
  { id: "gemini", name: "Gemini 2.5 Flash", provider: "Google", desc: "Fast & highly accurate" },
  { id: "mistral", name: "Mistral AI", provider: "Mistral", desc: "Specialized analysis" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", provider: "Groq", desc: "Precise technical synthesis" },
  { id: "openai/gpt-oss-120b", name: "GPT OSS 120B", provider: "Groq", desc: "Deep comprehensive reasoning" },
  { id: "openai/gpt-oss-20b", name: "GPT OSS 20B", provider: "Groq", desc: "Ultra-fast lightweight reasoning" },
];

// ─── Summary Formats ───
const summaryFormats = [
  { id: "executive", label: "Executive Brief", icon: Layers, desc: "High-level strategic briefing" },
  { id: "bullet-points", label: "Key Bullet Points", icon: ListChecks, desc: "Fast scannable bullet list" },
  { id: "key-insights", label: "Insights & Actions", icon: Sparkles, desc: "Strategic findings and next steps" },
  { id: "comprehensive", label: "Comprehensive TL;DR", icon: FileText, desc: "Multi-layered detailed breakdown" },
];

// ─── Summary Lengths ───
const summaryLengths = [
  { id: "short", label: "Quick (~1-2m)" },
  { id: "medium", label: "Standard (~3-4m)" },
  { id: "detailed", label: "Detailed (~5+m)" },
];

// ─── Sample Texts for Testing ───
const sampleArticles = [
  {
    title: "Quantum Computing & Clean Energy Breakthrough",
    text: `Recent advancements at the intersection of quantum computing and materials science have led to a breakthrough in room-temperature catalyst discovery for synthetic fuel production. Researchers at the Global Institute of Molecular Engineering simulated over 40 million chemical compound interactions in under 72 hours—a task that previously would have required nearly 18 years on conventional supercomputers.

The newly identified catalyst, a cobalt-nickel-molybdenum alloy nano-cluster, demonstrates a 400% increase in electrochemical conversion efficiency when converting captured ambient carbon dioxide and water vapor into aviation-grade hydrocarbons. Crucially, the process operates at standard atmospheric pressure and 24 degrees Celsius, eliminating the energy-intensive thermal compressors that previously rendered synthetic jet fuels economically unfeasible.

Commercial implications are immediate. The aviation sector currently accounts for approximately 2.5% of global carbon emissions, with heavy long-haul aircraft constrained by battery weight limitations. Industry consortia have already committed $850 million to pilot modular production hubs across three continents by Q4 2027. Preliminary life-cycle analyses indicate a net-negative carbon footprint when integrated directly with localized solar-thermal arrays, achieving an estimated per-barrel parity with fossil kerosene within 36 months of scaled manufacturing.

However, supply-chain vulnerabilities around cobalt mining and high-precision nanomaterial synthesis remain significant hurdles. Policy experts recommend immediate sovereign stockpiling agreements alongside accelerated research into non-toxic iron-based analogues.`
  },
  {
    title: "Quarterly Enterprise SaaS & AI Adoption Report",
    text: `The Q3 Enterprise Software Sentiment and AI Deployment Index highlights a decisive shift from speculative generative AI experimentation toward production integration and quantifiable ROI. Surveying 1,400 Chief Technology Officers across North America and Europe, the study indicates that 68% of enterprise organizations now maintain at least three customer-facing or internal workflow AI agents in continuous production, representing a 210% increase year-over-year.

Budgetary allocations reflect this evolution. While aggregate IT expenditures grew by an average of 4.2%, spending specifically reserved for specialized LLM orchestration, vector databases, and automated agent middleware expanded by 34.6%. Interestingly, organizations noted significant cost consolidation: 52% of respondents migrated away from single-vendor proprietary frontier models in favor of lightweight, task-specific open-weight models self-hosted on edge or private cloud clusters, citing reduced latency and data sovereignty compliance.

Key operational metrics include an average 38% reduction in Tier-1 customer support resolution times, a 24% acceleration in developer pull-request review cycles, and an estimated $3.2 million annual overhead savings per 10,000 employees. Nonetheless, security and governance remain paramount concerns. Over 74% of surveyed security leaders reported experiencing at least one automated prompt-injection attempt or accidental sensitive credential leakage in sandbox environments over the past six months, prompting stringent demands for real-time audit logs and zero-trust proxy gateways.`
  }
];

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      {[...Array(20)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground to-transparent"
          style={{ top: `${5 * (i + 1)}%` }}
        />
      ))}
      {[...Array(16)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground to-transparent"
          style={{ left: `${6.25 * (i + 1)}%` }}
        />
      ))}
    </div>
  );
}

// ─── Time Saved Circular Metric ───
function SavingsMeter({ percent = 85, size = 100 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-foreground/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#4ade80"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-display font-semibold text-foreground">{percent}%</span>
          <span className="text-[9px] font-mono text-emerald-400">FASTER</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider">Reading Time Saved</span>
    </div>
  );
}

// Helper to safely extract string content from any object/primitive
function safeString(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (typeof val.content === "string") return val.content;
    if (typeof val.text === "string") return val.text;
    if (typeof val.summary === "string") return val.summary;
    if (Array.isArray(val)) return val.map(safeString).join("\n\n");
    return JSON.stringify(val);
  }
  return String(val);
}

export default function SmartSummarizerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState("text"); // 'text' | 'file'
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [selectedFormat, setSelectedFormat] = useState("executive");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Calculate live word count & reading time
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const displaySummary = safeString(results?.summary || results?.rawText || "");

  // Speech synthesis toggle
  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!displaySummary) return;
      const utterance = new SpeechSynthesisUtterance(displaySummary);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopySummary = () => {
    if (!displaySummary) return;
    navigator.clipboard.writeText(displaySummary);
    setCopiedSummary(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyAll = () => {
    if (!results) return;
    let fullReport = `# Executive Summary\n\n${displaySummary}\n\n`;
    if (results.keyPoints?.length) {
      fullReport += `## Key Takeaways\n${results.keyPoints.map((k) => `- [${k.importance?.toUpperCase() || 'INFO'}] ${k.point}`).join("\n")}\n\n`;
    }
    if (results.actionItems?.length) {
      fullReport += `## Action Items\n${results.actionItems.map((a) => `- [${a.priority?.toUpperCase() || 'NORMAL'}] ${a.action}`).join("\n")}\n\n`;
    }
    if (results.topics?.length) {
      fullReport += `## Key Topics\n${results.topics.join(", ")}\n`;
    }

    navigator.clipboard.writeText(fullReport);
    setCopiedAll(true);
    toast.success("Complete report copied to clipboard!");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    if (!results) return;
    let content = `========================================================\n`;
    content += `NEXUSAI SMART SUMMARY REPORT\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `AI Model: ${supportedModels.find(m => m.id === selectedModel)?.name || selectedModel}\n`;
    content += `Format: ${selectedFormat} | Length: ${selectedLength}\n`;
    content += `========================================================\n\n`;
    content += `EXECUTIVE SUMMARY:\n${displaySummary}\n\n`;

    if (results.keyPoints?.length) {
      content += `--------------------------------------------------------\n`;
      content += `KEY TAKEAWAYS:\n`;
      results.keyPoints.forEach((kp, i) => {
        content += `${i + 1}. [${kp.importance?.toUpperCase() || 'INFO'}] ${kp.point}\n`;
      });
      content += `\n`;
    }

    if (results.actionItems?.length) {
      content += `--------------------------------------------------------\n`;
      content += `ACTIONABLE NEXT STEPS:\n`;
      results.actionItems.forEach((ai, i) => {
        content += `[ ] (${ai.priority?.toUpperCase() || 'NORMAL'}) ${ai.action}\n`;
      });
      content += `\n`;
    }

    if (results.topics?.length) {
      content += `TOPICS: ${results.topics.join(', ')}\n`;
    }
    if (results.sentiment) {
      content += `SENTIMENT: ${results.sentiment}\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smart-summary-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Summary report downloaded!");
  };

  const handleSummarize = async () => {
    if (!user) {
      warningToast("Please sign in to use Smart Summarizer");
      navigate("/login");
      return;
    }

    if (inputMode === "text" && (!text || text.trim().length < 20)) {
      warningToast("Please enter at least a few sentences (minimum 20 characters) to summarize.");
      return;
    }

    if (inputMode === "file" && !selectedFile) {
      warningToast("Please select a document file (PDF, DOCX, or TXT).");
      return;
    }

    setIsSummarizing(true);
    setResults(null);
    setError(null);

    try {
      let res;
      if (inputMode === "file") {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("model", selectedModel);
        formData.append("format", selectedFormat);
        formData.append("length", selectedLength);

        res = await api.post("/tools/summarize", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/tools/summarize", {
          text: text.trim(),
          model: selectedModel,
          format: selectedFormat,
          length: selectedLength,
        });
      }

      setResults(res.data.output);
      toast.success("Document summarized successfully!");

      // Scroll smoothly to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate summary. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const loadSample = (sample) => {
    setInputMode("text");
    setText(sample.text);
    toast.success(`Loaded sample: "${sample.title}"`);
  };

  const importanceBadge = {
    high: "bg-red-400/10 text-red-400 border-red-400/20",
    medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    low: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  };

  const priorityBadge = {
    high: "bg-red-400/10 text-red-400 border-red-400/20",
    medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    low: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground/20 selection:text-foreground relative">
      <GridBackground />
      <Navigation />

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-8 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Back link */}
          <Link
            to="/tools"
            className={`inline-flex items-center gap-2 text-sm font-mono text-foreground/50 hover:text-foreground transition-all duration-500 mb-8 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-sm bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-foreground/70" />
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-foreground/10 text-foreground/60">04</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-[0.95] tracking-tight text-foreground mb-4">
                Smart Summarizer
              </h1>
              <p className="text-lg text-foreground/50 max-w-xl">
                Condense long documents, articles, and reports into clear, actionable summaries. Extract key insights and main points in one click.
              </p>
            </div>

            {/* Feature pill highlights */}
            <div className={`flex flex-wrap sm:flex-nowrap gap-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {[
                { icon: FileText, label: "Document Analysis" },
                { icon: Sparkles, label: "Key Extraction" },
                { icon: ListChecks, label: "Bullet Points" },
                { icon: Layers, label: "Executive Summaries" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded border border-foreground/[0.06] bg-foreground/[0.02]">
                  <f.icon className="w-4 h-4 text-foreground/50" />
                  <span className="text-[10px] font-mono text-foreground/50">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Input Workspace ─── */}
      <section className="relative pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            
            {/* Control & Input Card */}
            <div className="border border-foreground/10 bg-foreground/[0.02] flex flex-col">
              
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02] gap-4">
                
                {/* Input Mode Selector */}
                <div className="flex items-center gap-1 bg-[#0a0a0b] p-1 border border-foreground/10 rounded-sm">
                  <button
                    onClick={() => setInputMode("text")}
                    className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors flex items-center gap-2 ${
                      inputMode === "text"
                        ? "bg-foreground text-background font-semibold"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    Paste Text
                  </button>
                  <button
                    onClick={() => setInputMode("file")}
                    className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors flex items-center gap-2 ${
                      inputMode === "file"
                        ? "bg-foreground text-background font-semibold"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                </div>

                {/* Configurations (Model, Format, Length) */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Model Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-foreground/40 hidden sm:inline">Model:</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="text-xs font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/80 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/80 cursor-pointer"
                    >
                      {supportedModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Format Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-foreground/40 hidden sm:inline">Format:</span>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="text-xs font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/80 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/80 cursor-pointer"
                    >
                      {summaryFormats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Length Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-foreground/40 hidden sm:inline">Length:</span>
                    <select
                      value={selectedLength}
                      onChange={(e) => setSelectedLength(e.target.value)}
                      className="text-xs font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/80 px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/80 cursor-pointer"
                    >
                      {summaryLengths.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-5">
                {inputMode === "text" ? (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste article text, research report, meeting minutes, essay, or raw document content here to summarize..."
                        rows={12}
                        className="w-full bg-[#0a0a0b]/60 border border-foreground/10 p-4 text-sm font-sans text-foreground/90 placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 rounded-sm resize-y leading-relaxed font-normal"
                      />
                      {text && (
                        <button
                          onClick={() => setText("")}
                          className="absolute top-3 right-3 p-1.5 text-foreground/30 hover:text-foreground/80 bg-[#0a0a0b] border border-foreground/10 rounded transition-colors"
                          title="Clear text"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Meta Counters & Sample Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-4 text-xs font-mono text-foreground/40">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {wordCount.toLocaleString()} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ~{estimatedReadMinutes} min read
                        </span>
                      </div>

                      {/* Sample Loader */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-foreground/30">Try a sample:</span>
                        {sampleArticles.map((sample, idx) => (
                          <button
                            key={sample.title}
                            onClick={() => loadSample(sample)}
                            className="text-xs font-mono px-2 py-1 bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-foreground/10 text-foreground/60 hover:text-foreground rounded-sm transition-colors"
                          >
                            Sample {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* File Upload Dropzone */
                  <div className="min-h-[260px] flex flex-col items-center justify-center border-2 border-dashed border-foreground/10 hover:border-foreground/20 rounded-sm p-8 text-center transition-colors bg-foreground/[0.01]">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                    />

                    <div className="w-16 h-16 rounded-full bg-foreground/[0.04] border border-foreground/10 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-foreground/50" />
                    </div>

                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs font-mono text-foreground/40">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.name.split('.').pop()?.toUpperCase()}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="mt-2 text-xs font-mono text-red-400 hover:text-red-300 underline underline-offset-4"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-foreground/80 mb-1">
                          Drag and drop your document here, or{" "}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80 cursor-pointer"
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-xs font-mono text-foreground/40 mt-1">
                          Supports PDF, DOCX, DOC, and TXT (up to 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Bar Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-foreground/10 bg-foreground/[0.02]">
                <div className="text-xs font-mono text-foreground/40 hidden sm:block">
                  ⚡ 10x faster reading • Key takeaways • Instant export
                </div>

                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing || (inputMode === "text" && !text.trim()) || (inputMode === "file" && !selectedFile)}
                  className="ml-auto rounded-sm bg-foreground text-background hover:bg-foreground/90 h-11 px-7 text-sm font-mono flex items-center cursor-pointer disabled:opacity-40 transition-all font-semibold"
                >
                  {isSummarizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-3" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Results Dashboard Section ─── */}
      <section id="results" className="relative pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* Loading Indicator */}
          {isSummarizing && (
            <div className="border border-foreground/10 bg-foreground/[0.02] p-16 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-2 border-foreground/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-t-foreground border-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-2 border-foreground/5 rounded-full" />
                <div
                  className="absolute inset-3 border-2 border-t-foreground/50 border-transparent rounded-full animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                />
              </div>
              <p className="text-foreground/80 font-mono text-sm mb-2 font-medium">Extracting key insights with AI...</p>
              <p className="text-foreground/40 text-xs max-w-sm text-center">
                Processing document structure, synthesizing main findings, and preparing your executive briefing.
              </p>
            </div>
          )}

          {/* Empty Prompt State */}
          {!isSummarizing && !results && (
            <div className="border border-dashed border-foreground/10 p-14 text-center">
              <BookOpen className="w-10 h-10 text-foreground/15 mx-auto mb-4" />
              <p className="text-sm text-foreground/40 font-mono">
                Paste your content or upload a document above and click &ldquo;Generate Summary&rdquo;
              </p>
              <p className="text-xs text-foreground/25 mt-2 max-w-md mx-auto">
                NexusAI will condense your document into an executive briefing, extract actionable takeaways, and quantify time saved.
              </p>
            </div>
          )}

          {/* Populated Results View */}
          {results && !isSummarizing && (
            <div className="space-y-6">

              {/* 1. Header Metrics Card */}
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
                
                {/* Time Saved Meter */}
                <div className="p-6 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center justify-center">
                  <SavingsMeter percent={results.timeSavedPercent || 85} size={110} />
                </div>

                {/* Metrics Summary Strip */}
                <div className="border border-foreground/10 bg-foreground/[0.02] p-6 flex flex-col justify-between">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-mono text-foreground/40 uppercase block mb-1">Original Reading</span>
                      <span className="text-lg font-display text-foreground font-semibold">{results.readingTimeOriginal || "~5 min"}</span>
                      <span className="text-[11px] font-mono text-foreground/40 block mt-0.5">({results.wordCountOriginal || wordCount || "—"} words)</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-foreground/40 uppercase block mb-1">Summary Reading</span>
                      <span className="text-lg font-display text-emerald-400 font-semibold">{results.readingTimeSummary || "~45 sec"}</span>
                      <span className="text-[11px] font-mono text-foreground/40 block mt-0.5">
                        ({results.wordCountSummary || (displaySummary ? displaySummary.trim().split(/\s+/).length : "—")} words)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-foreground/40 uppercase block mb-1">Tone / Sentiment</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-foreground/[0.06] border border-foreground/10 text-foreground/80 capitalize mt-0.5">
                        <Tag className="w-3 h-3 text-foreground/50" />
                        {results.sentiment || "Neutral"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-foreground/40 uppercase block mb-1">AI Model Used</span>
                      <span className="text-xs font-mono text-foreground/80 block mt-1">
                        {supportedModels.find(m => m.id === selectedModel)?.name || selectedModel}
                      </span>
                    </div>
                  </div>

                  {/* Topics Tags */}
                  {results.topics && Array.isArray(results.topics) && results.topics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-foreground/10">
                      <span className="text-xs font-mono text-foreground/40 mr-1">Main Themes:</span>
                      {results.topics.map((t, idx) => (
                        <span key={idx} className="text-xs font-mono px-2.5 py-1 bg-foreground/[0.04] border border-foreground/10 text-foreground/70 rounded-sm">
                          #{safeString(t)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Executive Summary Card */}
              <div className="border border-foreground/10 bg-foreground/[0.02]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 bg-foreground/[0.02]">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-mono font-medium text-foreground">
                      Executive Summary
                    </h3>
                  </div>

                  {/* Tool Actions (Audio, Copy, Download) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSpeech}
                      className={`text-xs font-mono px-3 py-1.5 border rounded-sm flex items-center gap-1.5 transition-colors ${
                        isSpeaking
                          ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/30"
                          : "bg-foreground/[0.04] text-foreground/70 border-foreground/10 hover:text-foreground"
                      }`}
                      title={isSpeaking ? "Stop voice" : "Read aloud"}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
                    </button>

                    <button
                      onClick={handleCopySummary}
                      className="text-xs font-mono px-3 py-1.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-foreground/10 rounded-sm flex items-center gap-1.5 transition-colors"
                      title="Copy summary text"
                    >
                      {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copiedSummary ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="text-xs font-mono px-3 py-1.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-foreground/10 rounded-sm flex items-center gap-1.5 transition-colors"
                      title="Download report as .txt"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="text-base sm:text-lg leading-relaxed text-foreground/90 font-sans border-l-2 border-emerald-400/60 pl-6 py-1 whitespace-pre-line">
                    {displaySummary || "No summary text generated."}
                  </div>
                </div>
              </div>

              {/* 3. Key Takeaways & Action Items 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Key Points */}
                <div className="border border-foreground/10 bg-foreground/[0.02]">
                  <div className="flex items-center gap-2.5 px-6 py-4 border-b border-foreground/10 bg-foreground/[0.02]">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-mono font-medium text-foreground">
                      Key Takeaways & Insights ({results.keyPoints?.length || 0})
                    </h3>
                  </div>

                  <div className="p-6 space-y-3">
                    {results.keyPoints && Array.isArray(results.keyPoints) && results.keyPoints.length > 0 ? (
                      results.keyPoints.map((item, index) => {
                        const pointText = safeString(typeof item === "object" ? (item.point || item.text || item.content || item) : item);
                        const importance = typeof item === "object" && typeof item.importance === "string" ? item.importance.toLowerCase() : "medium";
                        return (
                          <div
                            key={index}
                            className="p-3.5 border border-foreground/10 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors rounded-sm flex items-start gap-3"
                          >
                            <span className="w-5 h-5 rounded-full bg-foreground/[0.06] text-foreground/60 text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-foreground/85 leading-relaxed">{pointText}</p>
                              <span className={`inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 border rounded-sm ${importanceBadge[importance] || importanceBadge.low}`}>
                                {importance} Importance
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs font-mono text-foreground/40">No specific points generated.</p>
                    )}
                  </div>
                </div>

                {/* Action Items */}
                <div className="border border-foreground/10 bg-foreground/[0.02]">
                  <div className="flex items-center gap-2.5 px-6 py-4 border-b border-foreground/10 bg-foreground/[0.02]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-mono font-medium text-foreground">
                      Actionable Takeaways ({results.actionItems?.length || 0})
                    </h3>
                  </div>

                  <div className="p-6 space-y-3">
                    {results.actionItems && Array.isArray(results.actionItems) && results.actionItems.length > 0 ? (
                      results.actionItems.map((action, index) => {
                        const actionText = safeString(typeof action === "object" ? (action.action || action.text || action.content || action) : action);
                        const priority = typeof action === "object" && typeof action.priority === "string" ? action.priority.toLowerCase() : "medium";
                        return (
                          <div
                            key={index}
                            className="p-3.5 border border-foreground/10 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors rounded-sm flex items-start gap-3"
                          >
                            <div className="w-4 h-4 rounded border border-foreground/30 flex items-center justify-center shrink-0 mt-1 text-emerald-400">
                              <Check className="w-3 h-3" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground/85 leading-relaxed">{actionText}</p>
                              <span className={`inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 border rounded-sm ${priorityBadge[priority] || priorityBadge.low}`}>
                                Priority: {priority}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs font-mono text-foreground/40">No specific action items detected.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 border border-foreground/10 bg-foreground/[0.02]">
                <div className="text-xs font-mono text-foreground/50">
                  Ready to share or archive this summary?
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyAll}
                    className="text-xs font-mono px-4 py-2 border border-foreground/20 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground rounded-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAll ? "Report Copied" : "Copy Full Report"}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="text-xs font-mono px-4 py-2 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Download (.txt)
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      <FooterSection />
    </div>
  );
}
