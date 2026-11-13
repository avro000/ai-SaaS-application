import { useEffect, useState, useRef } from "react";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import api from "../utils/api";
import {
  FileText,
  ArrowLeft,
  Upload,
  Eye,
  Target,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Hammer,
  Dna,
  GitBranch,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

// ─── Grid background ───
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

// ─── Inline Markdown Formatter ───
function FormattedText({ text, className = "" }) {
  if (!text || typeof text !== "string") return null;
  const lines = text.split(/\r?\n/);
  return (
    <span className={className}>
      {lines.map((line, lineIdx) => {
        const parts = line.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g);
        return (
          <span key={lineIdx} className={lineIdx > 0 ? "block mt-2" : "inline"}>
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
                return (
                  <strong key={i} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
                return (
                  <em key={i} className="italic text-foreground/90">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </span>
        );
      })}
    </span>
  );
}

// ─── Score Ring ───
function ScoreRing({ score, label, size = 80, color }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    color || (score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171");

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
            strokeWidth="3"
            className="text-foreground/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-display text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Keyword Analysis Section ───
function KeywordAnalysis({ keywords }) {
  const matchCount = keywords.filter((k) => k.status === "match").length;
  const matchPercent = Math.round((matchCount / keywords.length) * 100);

  const statusColor = (s) =>
    s === "match"
      ? "border-green-400/30 bg-green-400/10 text-green-400"
      : s === "weak"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
        : "border-red-400/30 bg-red-400/10 text-red-400";

  return (
    <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dna className="w-4 h-4 text-foreground/50" />
            <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
              JD Keyword Match
            </span>
          </div>
          <h3 className="text-2xl font-display text-foreground mb-2">
            Keyword Analysis
          </h3>
          <p className="text-sm text-foreground/50 max-w-md">
            How well your resume matches the key skills and requirements from the
            job description.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-display text-foreground">
            {matchPercent}%
          </div>
          <div className="text-xs font-mono text-foreground/40">MATCH RATE</div>
        </div>
      </div>

      {/* DNA bar visualization */}
      <div className="mb-6 p-4 bg-foreground/[0.02] border border-foreground/[0.06]">
        <div className="flex items-center gap-1 h-10">
          {keywords.map((k, i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-500 ${k.status === "match"
                  ? "bg-green-400"
                  : k.status === "weak"
                    ? "bg-amber-400"
                    : "bg-red-400/60"
                }`}
              style={{
                height: `${30 + (k.strength || 0.5) * 70}%`,
                opacity: 0.3 + (k.strength || 0.5) * 0.7,
              }}
              title={k.word}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-foreground/30">
          <span>
            {matchCount} MATCHED · {keywords.length - matchCount} GAPS
          </span>
          <span>{keywords.length} KEYWORDS ANALYZED</span>
        </div>
      </div>

      {/* Keyword chips */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {keywords.map((k, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 border ${statusColor(
              k.status
            )}`}
          >
            <span className="text-xs font-medium truncate mr-2">{k.word}</span>
            <span className="text-[9px] font-mono uppercase opacity-70 shrink-0">
              {k.status}
            </span>
          </div>
        ))}
      </div>

      {/* Missing keyword suggestions */}
      {keywords.filter((k) => k.status !== "match").length > 0 && (
        <div className="mt-6 border border-foreground/10 bg-foreground/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
            <span className="text-xs font-mono text-foreground/60 uppercase tracking-wider">
              How to Fix
            </span>
          </div>
          <div className="space-y-2 text-sm text-foreground/70">
            {keywords
              .filter((k) => k.status !== "match" && k.suggestion)
              .slice(0, 5)
              .map((k, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-green-400 font-mono text-xs mt-0.5 shrink-0">
                    +
                  </span>
                  <span>
                    <strong className="text-foreground/90">{k.word}:</strong>{" "}
                    <FormattedText text={k.suggestion} />
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bullet Forge Section ───
function BulletForge({ bullets }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bullet = bullets[activeIdx];

  const copyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!bullet) return null;

  return (
    <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hammer className="w-4 h-4 text-foreground/50" />
            <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
              Bullet Rewrite
            </span>
          </div>
          <h3 className="text-2xl font-display text-foreground mb-2">
            Bullet Forge
          </h3>
          <p className="text-sm text-foreground/50 max-w-md">
            Each bullet scored on action verb strength, quantification, and
            impact — then rewritten for maximum effect.
          </p>
        </div>
      </div>

      {/* Bullet selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {bullets.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${activeIdx === i
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-foreground/50 border-foreground/10 hover:border-foreground/30"
              }`}
          >
            Bullet {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4 items-stretch">
        {/* Original */}
        <div className="border border-red-400/20 bg-red-400/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-red-400/10 text-red-400 border border-red-400/20">
              ORIGINAL
            </span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            <FormattedText text={bullet.original} />
          </p>
          {bullet.issues && bullet.issues.length > 0 && (
            <div className="space-y-1.5">
              {bullet.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-red-400/80"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <FormattedText text={issue} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewritten */}
        <div className="border border-green-400/20 bg-green-400/[0.04] p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-green-400/10 text-green-400 border border-green-400/20">
              FORGED
            </span>
            <button
              onClick={() => copyBullet(bullet.rewritten, activeIdx)}
              className="text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer"
              title="Copy rewritten bullet"
            >
              {copiedIdx === activeIdx ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-4">
            <FormattedText text={bullet.rewritten} />
          </p>
          {bullet.scores && (
            <div className="space-y-2">
              {["action", "quantified", "impact"].map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-foreground/40 w-20 capitalize">
                    {key}
                  </span>
                  <div className="flex-1 h-1 bg-foreground/[0.06] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-green-400 transition-all duration-1000"
                      style={{ width: `${bullet.scores[key] || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-green-400 w-8 text-right">
                    {bullet.scores[key] || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Interview Question Predictor ───
function InterviewPredictor({ questions }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const riskColor = (r) =>
    r === "high"
      ? "border-red-400/30 bg-red-400/[0.06] text-red-400"
      : r === "medium"
        ? "border-amber-400/30 bg-amber-400/[0.06] text-amber-400"
        : "border-blue-400/30 bg-blue-400/[0.06] text-blue-400";

  return (
    <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-foreground/50" />
            <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
              Interview Prep
            </span>
          </div>
          <h3 className="text-2xl font-display text-foreground mb-2">
            Predicted Interview Questions
          </h3>
          <p className="text-sm text-foreground/50 max-w-md">
            Questions a recruiter is likely to ask based on gaps and weak spots
            in your resume.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div
            key={i}
            className="group border border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20 transition-colors"
          >
            <div
              className="flex items-start gap-4 p-4 cursor-pointer"
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            >
              <div className="text-xs font-mono text-foreground/30 w-6 shrink-0 pt-0.5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/90 mb-2 leading-relaxed">
                  &ldquo;<FormattedText text={q.question} />&rdquo;
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 border uppercase ${riskColor(
                      q.risk
                    )}`}
                  >
                    {q.risk} risk
                  </span>
                  <span className="text-[10px] font-mono text-foreground/40">
                    → <FormattedText text={q.targets} />
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-foreground/30">
                {expandedIdx === i ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>
            {expandedIdx === i && q.prepTip && (
              <div className="px-4 pb-4 pl-14">
                <div className="p-3 border border-green-400/20 bg-green-400/[0.04] text-sm text-foreground/70">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-mono text-green-400 uppercase">
                      Prep Tip
                    </span>
                  </div>
                  <FormattedText text={q.prepTip} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Career Narrative ───
function NarrativeCoherence({ narrative }) {
  const avgCoherence = Math.round(
    (narrative.reduce((s, n) => s + (n.coherence || 0), 0) / narrative.length) *
    100
  );

  return (
    <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-foreground/50" />
            <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
              Career Arc
            </span>
          </div>
          <h3 className="text-2xl font-display text-foreground mb-2">
            Career Narrative
          </h3>
          <p className="text-sm text-foreground/50 max-w-md">
            How well your career progression tells a coherent, compelling story.
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-display text-foreground">
            {avgCoherence}%
          </div>
          <div className="text-xs font-mono text-foreground/40">COHERENCE</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-3 left-0 right-0 h-px bg-foreground/10" />
        <div
          className="grid gap-2 relative"
          style={{
            gridTemplateColumns: `repeat(${narrative.length}, minmax(0, 1fr))`,
          }}
        >
          {narrative.map((n, i) => {
            const c = n.coherence || 0;
            const dotColor =
              c >= 0.85
                ? "bg-green-400"
                : c >= 0.6
                  ? "bg-amber-400"
                  : "bg-red-400";
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-3 h-3 rounded-full ${dotColor} relative z-10 ring-4 ring-background`}
                />
                <div className="text-[10px] font-mono text-foreground/40 mt-2">
                  {n.year}
                </div>
                <div className="text-xs text-foreground/80 mt-1 font-medium leading-tight">
                  {n.role}
                </div>
                <div
                  className={`text-[10px] mt-1.5 leading-tight ${c >= 0.85
                      ? "text-green-400"
                      : c >= 0.6
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                >
                  {n.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Improvements Section ───
function ImprovementsSection({ improvements }) {
  return (
    <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-foreground/50" />
        <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
          Improvements
        </span>
      </div>
      <h3 className="text-2xl font-display text-foreground mb-2">
        Section-by-Section Fixes
      </h3>
      <p className="text-sm text-foreground/50 mb-6 max-w-md">
        Specific changes to strengthen each section of your resume.
      </p>

      <div className="space-y-4">
        {improvements.map((imp, i) => (
          <div
            key={i}
            className="border border-foreground/10 bg-foreground/[0.02] p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-0.5 bg-foreground/10 text-foreground/60">
                {imp.section}
              </span>
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono text-red-400/70 uppercase mb-1">
                  Current
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  <FormattedText text={imp.current} />
                </p>
              </div>
              <div>
                <div className="text-[10px] font-mono text-green-400/70 uppercase mb-1">
                  Suggested
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <FormattedText text={imp.suggested} />
                </p>
              </div>
            </div>
            {imp.reason && (
              <p className="mt-2 text-xs text-foreground/40 italic">
                Why: <FormattedText text={imp.reason} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Strengths Section ───
function StrengthsSection({ strengths }) {
  return (
    <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-4 h-4 text-green-400/70" />
        <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
          What You're Doing Right
        </span>
      </div>
      <h3 className="text-2xl font-display text-foreground mb-6">Strengths</h3>
      <div className="space-y-3">
        {strengths.map((s, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-foreground/70">
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <span><FormattedText text={s} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function ResumeOptimizerPage() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const runAnalysis = async () => {
    // Validation
    if (!resumeFile) {
      toast.error("Please upload your resume file (PDF or DOCX).");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the target job description.");
      return;
    }
    if (!user) {
      toast.error("Please log in to analyze your resume.");
      return;
    }

    setAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);
      formData.append("model", selectedModel);

      const res = await api.post("/tools/resume-optimize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const output = res.data.output;
      setResults(output);

      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Analysis failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  // Compute derived stats
  const keywordMatchPercent = results?.keywords
    ? Math.round(
      (results.keywords.filter((k) => k.status === "match").length /
        results.keywords.length) *
      100
    )
    : 0;

  const narrativeCoherence = results?.narrative
    ? Math.round(
      (results.narrative.reduce((s, n) => s + (n.coherence || 0), 0) /
        results.narrative.length) *
      100
    )
    : 0;

  const bulletStrong = results?.bullets
    ? results.bullets.filter(
      (b) =>
        b.scores &&
        b.scores.action >= 70 &&
        b.scores.quantified >= 70 &&
        b.scores.impact >= 70
    ).length
    : 0;

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <GridBackground />
      <Navigation />

      {/* ─── Hero ─── */}
      <section className="relative pt-24 lg:pt-28 pb-8">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
          <Link
            to="/tools"
            className={`inline-flex items-center gap-2 text-sm font-mono text-foreground/50 hover:text-foreground transition-all duration-500 mb-8 ${isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
              }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div
              className={`transition-all duration-700 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
                }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-sm bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-foreground/70" />
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-foreground/10 text-foreground/60">
                  02
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-[0.95] tracking-tight text-foreground mb-4">
                Resume Optimizer
              </h1>
              <p className="text-lg text-foreground/50 max-w-xl">
                Paste your resume and target job description. AI analyzes keyword
                gaps, rewrites bullets, predicts interview questions, and maps
                your career narrative.
              </p>
            </div>

            <div
              className={`flex gap-8 transition-all duration-700 delay-200 ${isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
                }`}
            >
              {[
                { icon: Dna, label: "Keyword Match" },
                { icon: Hammer, label: "Bullet Forge" },
                { icon: MessageSquare, label: "Interview Prep" },
                { icon: GitBranch, label: "Career Arc" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1">
                  <f.icon className="w-5 h-5 text-foreground/40" />
                  <span className="text-[10px] font-mono text-foreground/40">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Input Section ─── */}
      <section className="relative pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div
            className={`grid lg:grid-cols-2 gap-6 transition-all duration-700 delay-300 ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
              }`}
          >
            {/* Resume input */}
            <div className="border border-foreground/10 bg-foreground/[0.02] flex flex-col">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
                <Upload className="w-4 h-4 text-foreground/50" />
                <span className="text-sm font-mono text-foreground/70">
                  Step 1 — Upload Resume (PDF/DOCX)
                </span>
              </div>
              <div
                className="flex-1 min-h-[280px] flex flex-col items-center justify-center p-5 cursor-pointer hover:bg-foreground/[0.04] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setResumeFile(file);
                  }}
                />
                <div className="w-16 h-16 rounded-full bg-foreground/[0.05] border border-foreground/10 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-foreground/40" />
                </div>
                {resumeFile ? (
                  <>
                    <p className="text-sm text-foreground/90 font-medium mb-1">{resumeFile.name}</p>
                    <p className="text-xs text-foreground/40 font-mono">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      className="mt-4 text-xs font-mono text-foreground/60 hover:text-foreground underline underline-offset-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-foreground/70 mb-2">Click to select a file</p>
                    <p className="text-xs text-foreground/40 font-mono">PDF, DOCX up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* JD input */}
            <div className="border border-foreground/10 bg-foreground/[0.02] flex flex-col">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
                <Target className="w-4 h-4 text-foreground/50" />
                <span className="text-sm font-mono text-foreground/70">
                  Step 2 — Paste Job Description
                </span>
                {jobDescription.trim() && (
                  <span className="ml-auto text-[10px] font-mono text-foreground/30">
                    {jobDescription.trim().split(/\s+/).length} words
                  </span>
                )}
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="flex-1 min-h-[280px] bg-transparent text-sm text-foreground/80 leading-relaxed p-5 resize-none focus:outline-none placeholder:text-foreground/25 scrollbar-thin"
              />
            </div>
          </div>

          {/* Run button and model selector */}
          <div
            className={`flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 transition-all duration-700 delay-400 ${isVisible ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-foreground/50">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/70 px-3 py-2 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/70 cursor-pointer h-14"
              >
                <option value="gemini">Gemini 2.5 Flash</option>
                <option value="mistral">mistral-medium-latest</option>
                <option value="qwen/qwen3.8-27b">Qwen 3.8 27B</option>
                <option value="openai/gpt-oss-120b">GPT OSS 120B</option>
              </select>
            </div>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="rounded-sm bg-foreground text-background hover:bg-foreground/90 h-14 px-10 text-sm font-mono flex items-center cursor-pointer disabled:opacity-50 transition-all"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-3" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Full Analysis
                </>
              )}
            </button>
          </div>

          {/* Not logged in hint */}
          {!user && (
            <p className="text-center text-xs text-foreground/30 mt-3 font-mono">
              <Link
                to="/login"
                className="text-foreground/50 hover:text-foreground underline underline-offset-2"
              >
                Log in
              </Link>{" "}
              to run analysis
            </p>
          )}
        </div>
      </section>

      {/* ─── Results ─── */}
      <section id="results" className="relative pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Loading state */}
          {analyzing && (
            <div className="border border-foreground/10 bg-foreground/[0.02] p-16 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-2 border-foreground/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-t-foreground border-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-2 border-foreground/5 rounded-full" />
                <div
                  className="absolute inset-3 border-2 border-t-foreground/50 border-transparent rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "0.8s",
                  }}
                />
              </div>
              <p className="text-foreground/60 font-mono text-sm mb-2">
                Analyzing your resume...
              </p>
              <p className="text-foreground/30 text-xs max-w-sm text-center">
                Running keyword match, bullet scoring, interview prediction, and
                career narrative analysis. This may take 10–20 seconds.
              </p>
            </div>
          )}

          {/* Empty state — no results yet */}
          {!analyzing && !results && (
            <div className="border border-dashed border-foreground/10 p-12 text-center">
              <Eye className="w-10 h-10 text-foreground/15 mx-auto mb-4" />
              <p className="text-sm text-foreground/40 font-mono">
                Paste your resume and job description above, then click
                &ldquo;Run Full Analysis&rdquo;
              </p>
              <p className="text-xs text-foreground/25 mt-2">
                AI will analyze keywords, rewrite bullets, predict interview
                questions, and evaluate your career narrative.
              </p>
            </div>
          )}

          {/* Results dashboard */}
          {results && !analyzing && (
            <div className="space-y-6">
              {/* Score strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center">
                  <ScoreRing
                    score={results.overallScore || 0}
                    label="Overall"
                    size={72}
                  />
                </div>
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center">
                  <ScoreRing
                    score={results.atsScore || 0}
                    label="ATS Score"
                    size={72}
                  />
                </div>
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center">
                  <ScoreRing
                    score={keywordMatchPercent}
                    label="Keyword Match"
                    size={72}
                  />
                </div>
                <div className="p-5 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center">
                  <ScoreRing
                    score={narrativeCoherence}
                    label="Narrative"
                    size={72}
                  />
                </div>
              </div>

              {/* Overall feedback */}
              {results.overallFeedback && (
                <div className="border border-foreground/10 bg-foreground/[0.02] p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-foreground/50" />
                    <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
                      AI Assessment
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    <FormattedText text={results.overallFeedback} />
                  </p>
                </div>
              )}

              {/* Strengths */}
              {results.strengths && results.strengths.length > 0 && (
                <StrengthsSection strengths={results.strengths} />
              )}

              {/* Keywords */}
              {results.keywords && results.keywords.length > 0 && (
                <KeywordAnalysis keywords={results.keywords} />
              )}

              {/* Bullets */}
              {results.bullets && results.bullets.length > 0 && (
                <BulletForge bullets={results.bullets} />
              )}

              {/* Interview Questions */}
              {results.interviewQuestions &&
                results.interviewQuestions.length > 0 && (
                  <InterviewPredictor questions={results.interviewQuestions} />
                )}

              {/* Career Narrative */}
              {results.narrative && results.narrative.length > 0 && (
                <NarrativeCoherence narrative={results.narrative} />
              )}

              {/* Improvements */}
              {results.improvements && results.improvements.length > 0 && (
                <ImprovementsSection improvements={results.improvements} />
              )}

              {/* Bullet summary */}
              {results.bullets && (
                <div className="p-4 border border-foreground/10 bg-foreground/[0.04] flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-foreground/60">
                    <strong className="text-foreground/90">
                      {bulletStrong}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-foreground/90">
                      {results.bullets.length}
                    </strong>{" "}
                    bullets are strong.{" "}
                    {bulletStrong < results.bullets.length
                      ? "Use the forged versions above to improve the rest."
                      : "Your bullets are in great shape!"}
                  </div>
                  <button
                    onClick={() => {
                      const allForged = results.bullets
                        .map((b) => b.rewritten)
                        .join("\n\n");
                      navigator.clipboard.writeText(allForged);
                      toast.success("All forged bullets copied!");
                    }}
                    className="text-xs font-mono text-foreground/50 hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy all forged bullets
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-display text-foreground mb-2">
                Ready to optimize more?
              </h2>
              <p className="text-foreground/50">
                Try our other AI tools — code review, content generation, and
                more.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-sm bg-foreground text-background hover:bg-foreground/90 h-12 px-6 font-medium transition-colors"
              >
                View All Tools
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
