import { useEffect, useRef, useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import toast from "react-hot-toast";
import { warningToast } from "../components/ui/CustomToast";
import {
  Code2,
  ArrowLeft,
  Play,
  Copy,
  Check,
  Sparkles,
  Shield,
  Zap,
  Lightbulb,
  FileCode,
  ChevronRight,
  Bug,
  AlertTriangle,
  BookOpen,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Supported Languages ───
const supportedLanguages = [
  { name: "JavaScript", keywords: ["const ", "let ", "var ", "function ", "=>", "console.log", "document.", "require(", "module.exports"] },
  { name: "TypeScript", keywords: ["interface ", ": string", ": number", ": boolean", "as ", "type ", "<T>", "readonly "] },
  { name: "Python", keywords: ["def ", "import ", "from ", "print(", "elif ", "self.", "__init__", "lambda ", "class ", "True", "False", "None"] },
  { name: "Go", keywords: ["func ", "package ", "fmt.", "go ", "chan ", "defer ", "goroutine", ":=", "import ("] },
  { name: "Rust", keywords: ["fn ", "let mut ", "impl ", "pub ", "use ", "mod ", "match ", "enum ", "struct ", "println!", "&self"] },
  { name: "Java", keywords: ["public class", "public static void main", "System.out", "private ", "protected ", "extends ", "implements ", "@Override"] },
  { name: "C++", keywords: ["#include", "std::", "cout", "cin", "nullptr", "vector<", "int main(", "template<", "namespace "] },
  { name: "C#", keywords: ["using System", "namespace ", "Console.Write", "public class", "static void Main", "var ", "async Task", "string[]"] },
  { name: "Ruby", keywords: ["def ", "end", "puts ", "require ", "attr_accessor", "class ", "do |", ".each", "nil", "elsif"] },
  { name: "PHP", keywords: ["<?php", "$", "echo ", "function ", "->", "::", "array(", "public function", "namespace "] },
  { name: "Swift", keywords: ["func ", "let ", "var ", "guard ", "import ", "struct ", "class ", "protocol ", "enum ", "print("] },
  { name: "Kotlin", keywords: ["fun ", "val ", "var ", "class ", "object ", "when ", "companion object", "println(", "suspend "] },
];

// ─── Language detection heuristic ───
function detectLanguage(code) {
  if (!code || code.trim().length < 10) return null;
  const scores = supportedLanguages.map((lang) => {
    let score = 0;
    for (const kw of lang.keywords) {
      if (code.includes(kw)) score++;
    }
    return { name: lang.name, score };
  });
  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score >= 2) return scores[0].name;
  return null;
}

// ─── Code Preprocessing & Validation ───
function preprocessCode(code) {
  if (!code) return "";

  const lines = code.split("\n");
  const validLines = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Skip common comment formats (full line comments)
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("*/") ||
      trimmed.startsWith("<!--") ||
      trimmed.startsWith("--") ||
      trimmed.startsWith('"""') ||
      trimmed.startsWith("'''")
    ) {
      continue;
    }

    // Keep the original line to preserve indentation
    validLines.push(line);
  }

  return validLines.join("\n");
}

function isValidCode(code) {
  // A simple heuristic: real code typically contains programming symbols
  const symbolMatch = code.match(/[{}[\]()=;+\-*/:.<>]/g);
  const symbolCount = symbolMatch ? symbolMatch.length : 0;

  // If the text has very few symbols relative to its length, it's likely just English prose
  if (code.length > 30 && symbolCount < 2) {
    return false;
  }

  return true;
}
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

// ─── Score Ring ───
function ScoreRing({ score, maxScore = 10, label, size = 80 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = (score / maxScore) * 100;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? "#4ade80" : pct >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-foreground/10" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-display text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Severity helpers ───
const severityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: Bug, label: "Critical" },
  warning: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: AlertTriangle, label: "Warning" },
  info: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: Lightbulb, label: "Info" },
};

const categoryConfig = {
  performance: { color: "text-amber-400", icon: Zap },
  readability: { color: "text-blue-400", icon: BookOpen },
  security: { color: "text-red-400", icon: Shield },
  "best-practice": { color: "text-green-400", icon: Lightbulb },
};

const priorityBadge = {
  high: "bg-red-400/10 text-red-400 border-red-400/20",
  medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  low: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

export default function CodeReviewerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [isReviewing, setIsReviewing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedRefactored, setCopiedRefactored] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);
  const [expandedBugs, setExpandedBugs] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-detect language on code change
  useEffect(() => {
    const detected = detectLanguage(code);
    setDetectedLang(detected);
  }, [code]);

  const langMismatch = detectedLang && detectedLang !== selectedLanguage;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRefactored = () => {
    if (results?.refactoredCode) {
      navigator.clipboard.writeText(results.refactoredCode);
      setCopiedRefactored(true);
      setTimeout(() => setCopiedRefactored(false), 2000);
    }
  };

  const toggleBug = (idx) => {
    setExpandedBugs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ─── Submit handler ───
  const handleReview = async () => {
    // Validation
    if (!code.trim()) {
      warningToast("Please paste your code before reviewing.");
      return;
    }

    // Preprocess: remove comments and empty lines
    const cleanedCode = preprocessCode(code);

    if (cleanedCode.trim().length < 15) {
      warningToast("Please provide a more substantial code snippet (at least 15 characters of valid code).");
      return;
    }

    if (!isValidCode(cleanedCode)) {
      warningToast("The input does not look like valid code. Please provide actual source code, not plain text.");
      return;
    }

    if (!user) {
      toast.error("Please log in to use the AI Code Reviewer.");
      navigate("/login", { state: { from: "/code-review" } });
      return;
    }

    // Language mismatch warning (non-blocking)
    if (langMismatch) {
      toast(`Heads up: your code looks like ${detectedLang}, but you selected ${selectedLanguage}. Proceeding anyway.`, { icon: "⚠️", duration: 4000 });
    }

    setIsReviewing(true);
    setResults(null);
    setError(null);

    try {
      // Send the cleaned code (without comments/empty lines) to the API
      const res = await api.post("/tools/code-review", {
        code: cleanedCode,
        language: selectedLanguage,
        model: selectedModel,
      });
      setResults(res.data.output);

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const msg = err.response?.data?.message || "Code review failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsReviewing(false);
    }
  };

  // ─── Derived stats ───
  const bugCounts = results?.bugs
    ? {
      critical: results.bugs.filter((b) => b.severity === "critical").length,
      warning: results.bugs.filter((b) => b.severity === "warning").length,
      info: results.bugs.filter((b) => b.severity === "info").length,
    }
    : { critical: 0, warning: 0, info: 0 };
  const totalBugs = bugCounts.critical + bugCounts.warning + bugCounts.info;

  const lineCount = code ? code.split("\n").length : 0;
  const charCount = code.length;

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <GridBackground />
      <Navigation />

      {/* ─── Hero ─── */}
      <section className="relative pt-24 lg:pt-28 pb-8">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
          <Link
            to="/tools"
            className={`inline-flex items-center gap-2 text-sm font-mono text-foreground/50 hover:text-foreground transition-all duration-500 mb-8 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-sm bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                  <Code2 className="w-7 h-7 text-foreground/70" />
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-foreground/10 text-foreground/60">01</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-[0.95] tracking-tight text-foreground mb-4">
                AI Code Reviewer
              </h1>
              <p className="text-lg text-foreground/50 max-w-xl">
                Paste your code and get an instant, comprehensive AI review — bugs, security issues, performance tips, and a refactored version.
              </p>
            </div>

            <div className={`flex gap-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {[
                { icon: Shield, label: "Security" },
                { icon: Bug, label: "Bug Detection" },
                { icon: Zap, label: "Performance" },
                { icon: Lightbulb, label: "Best Practices" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1">
                  <f.icon className="w-5 h-5 text-foreground/40" />
                  <span className="text-[10px] font-mono text-foreground/40">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Input Section ─── */}
      <section className="relative pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Code Input Panel */}
            <div className="border border-foreground/10 bg-foreground/[0.02] flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
                <div className="flex items-center gap-3">
                  <FileCode className="w-4 h-4 text-foreground/50" />
                  <span className="text-sm font-mono text-foreground/70">Step 1 — Paste Your Code</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Model selector */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-xs font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/70 px-2 py-1 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/70 cursor-pointer"
                  >
                    <option value="gemini">Gemini 2.5 Flash</option>
                    <option value="mistral">codestral-latest</option>
                    <option value="qwen/qwen3.8-27b">Qwen 3.8 27B</option>
                    <option value="openai/gpt-oss-120b">GPT OSS 120B</option>
                  </select>

                  {/* Language auto-detect badge */}
                  {detectedLang && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 border ${langMismatch ? "bg-amber-400/10 text-amber-400 border-amber-400/20" : "bg-green-400/10 text-green-400 border-green-400/20"}`}>
                      {langMismatch ? `Detected: ${detectedLang}` : `✓ ${detectedLang}`}
                    </span>
                  )}
                  {/* Language selector */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-xs font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/70 px-2 py-1 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/70 cursor-pointer"
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.name} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                  {/* Stats */}
                  <span className="text-[10px] font-mono text-foreground/30 hidden sm:inline">
                    {lineCount} lines · {charCount} chars
                  </span>
                  {/* Copy */}
                  <button onClick={handleCopyCode} className="p-1.5 text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer" title="Copy code">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="relative overflow-hidden">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-foreground/[0.02] border-r border-foreground/5 flex flex-col py-4 text-right pr-3 overflow-hidden pointer-events-none z-10">
                  {(code || " ").split("\n").map((_, i) => (
                    <span key={i} className="text-xs font-mono text-foreground/20 leading-6">{i + 1}</span>
                  ))}
                </div>

                <div className="pl-12">
                  <CodeEditor
                    value={code}
                    language={(detectedLang || selectedLanguage || "javascript").toLowerCase()}
                    placeholder="Paste your code here..."
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (results) setResults(null);
                    }}
                    padding={16}
                    style={{
                      fontSize: 14,
                      backgroundColor: "transparent",
                      minHeight: "350px",
                      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
                    }}
                    className="w-full font-mono text-foreground/80 leading-6 focus:outline-none overflow-y-auto scrollbar-thin"
                  />
                </div>
              </div>

              {/* Review Button */}
              <div className="px-5 py-4 border-t border-foreground/10 bg-foreground/[0.02] flex items-center justify-between gap-4">
                {!user && (
                  <p className="text-xs text-foreground/30 font-mono">
                    <Link to="/login" state={{ from: "/code-review" }} className="text-foreground/50 hover:text-foreground underline underline-offset-2">
                      Log in
                    </Link>{" "}
                    to run reviews
                  </p>
                )}
                <button
                  onClick={handleReview}
                  disabled={isReviewing || !code.trim()}
                  className="ml-auto rounded-sm bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-sm font-mono flex items-center cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isReviewing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-3" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Review Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Results ─── */}
      <section id="results" className="relative pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Loading state */}
          {isReviewing && (
            <div className="border border-foreground/10 bg-foreground/[0.02] p-16 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-2 border-foreground/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-t-foreground border-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-2 border-foreground/5 rounded-full" />
                <div className="absolute inset-3 border-2 border-t-foreground/50 border-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
              </div>
              <p className="text-foreground/60 font-mono text-sm mb-2">Reviewing your code...</p>
              <p className="text-foreground/30 text-xs max-w-sm text-center">
                Scanning for bugs, security vulnerabilities, performance issues, and style improvements. This may take 10–20 seconds.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isReviewing && !results && (
            <div className="border border-dashed border-foreground/10 p-12 text-center">
              <Eye className="w-10 h-10 text-foreground/15 mx-auto mb-4" />
              <p className="text-sm text-foreground/40 font-mono">
                Paste your code above and click &ldquo;Review Code&rdquo;
              </p>
              <p className="text-xs text-foreground/25 mt-2">
                AI will analyze bugs, security issues, performance, and best practices — then provide a refactored version.
              </p>
            </div>
          )}

          {/* Results dashboard */}
          {results && !isReviewing && (
            <div className="space-y-6">
              {/* ─── Score + Severity Summary ─── */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                {/* Score ring */}
                <div className="p-6 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center justify-center">
                  <ScoreRing score={results.overallScore || results.qualityScore || results.score || 0} maxScore={10} label="Quality Score" size={100} />
                </div>

                {/* Severity summary bar + summary text */}
                <div className="border border-foreground/10 bg-foreground/[0.02] p-6">
                  {/* Severity bar */}
                  <div className="flex items-center gap-2 mb-4">
                    <Bug className="w-4 h-4 text-foreground/50" />
                    <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">Issue Breakdown</span>
                    <span className="ml-auto text-xs font-mono text-foreground/40">{totalBugs} total</span>
                  </div>

                  {totalBugs > 0 ? (
                    <div className="flex h-3 rounded-sm overflow-hidden mb-4 bg-foreground/5">
                      {bugCounts.critical > 0 && (
                        <div className="bg-red-400 transition-all duration-700" style={{ width: `${(bugCounts.critical / totalBugs) * 100}%` }} title={`${bugCounts.critical} Critical`} />
                      )}
                      {bugCounts.warning > 0 && (
                        <div className="bg-amber-400 transition-all duration-700" style={{ width: `${(bugCounts.warning / totalBugs) * 100}%` }} title={`${bugCounts.warning} Warning`} />
                      )}
                      {bugCounts.info > 0 && (
                        <div className="bg-blue-400 transition-all duration-700" style={{ width: `${(bugCounts.info / totalBugs) * 100}%` }} title={`${bugCounts.info} Info`} />
                      )}
                    </div>
                  ) : (
                    <div className="flex h-3 rounded-sm overflow-hidden mb-4 bg-green-400/20">
                      <div className="bg-green-400 w-full" />
                    </div>
                  )}

                  <div className="flex gap-4 mb-5">
                    {Object.entries(bugCounts).map(([sev, count]) => (
                      <div key={sev} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-sm ${sev === "critical" ? "bg-red-400" : sev === "warning" ? "bg-amber-400" : "bg-blue-400"}`} />
                        <span className="text-xs font-mono text-foreground/50 capitalize">{sev}: {count}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Summary */}
                  {results.summary && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-foreground/50" />
                        <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">AI Assessment</span>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{results.summary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Bugs / Issues ─── */}
              {results.bugs && results.bugs.length > 0 && (
                <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Bug className="w-4 h-4 text-foreground/50" />
                    <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">Issues Found</span>
                    <span className="ml-auto text-xs font-mono px-2 py-0.5 bg-foreground/5 text-foreground/40 border border-foreground/10">
                      {results.bugs.length} issues
                    </span>
                  </div>

                  <div className="space-y-3">
                    {results.bugs.map((bug, i) => {
                      const sev = severityConfig[bug.severity] || severityConfig.info;
                      const isExpanded = expandedBugs[i];
                      const SevIcon = sev.icon;
                      return (
                        <div key={i} className={`border ${sev.border} ${sev.bg} transition-all duration-300`}>
                          <button
                            onClick={() => toggleBug(i)}
                            className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
                          >
                            <SevIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${sev.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-medium text-sm ${sev.color}`}>{sev.label}</span>
                                {bug.line && <span className="text-xs font-mono text-foreground/40">Line {bug.line}</span>}
                              </div>
                              <p className={`text-sm mt-1 leading-relaxed ${sev.color} opacity-80`}>{bug.description}</p>
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-foreground/30" /> : <ChevronDown className="w-4 h-4 text-foreground/30" />}
                            </div>
                          </button>
                          {isExpanded && bug.fix && (
                            <div className="px-4 pb-4 pt-0 ml-8">
                              <div className="p-3 bg-green-400/5 border border-green-400/10">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Lightbulb className="w-3.5 h-3.5 text-green-400" />
                                  <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Fix</span>
                                </div>
                                <p className="text-sm text-foreground/70 leading-relaxed">{bug.fix}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── Suggestions ─── */}
              {results.suggestions && results.suggestions.length > 0 && (
                <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="w-full flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-foreground/50" />
                      <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">Improvement Suggestions</span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-foreground/5 text-foreground/40 border border-foreground/10">
                        {results.suggestions.length}
                      </span>
                    </div>
                    {showSuggestions ? <ChevronUp className="w-4 h-4 text-foreground/30" /> : <ChevronDown className="w-4 h-4 text-foreground/30" />}
                  </button>

                  {showSuggestions && (
                    <div className="mt-6 space-y-3">
                      {results.suggestions.map((sug, i) => {
                        const cat = categoryConfig[sug.category] || categoryConfig["best-practice"];
                        const CatIcon = cat.icon;
                        const pBadge = priorityBadge[sug.priority] || priorityBadge.low;
                        return (
                          <div key={i} className="flex items-start gap-3 p-4 border border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/10 transition-colors">
                            <CatIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cat.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-mono uppercase tracking-wider ${cat.color}`}>{sug.category}</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${pBadge} uppercase`}>{sug.priority}</span>
                              </div>
                              <p className="text-sm text-foreground/70 leading-relaxed">{sug.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Refactored Code ─── */}
              {results.refactoredCode && (
                <div className="border border-foreground/10 bg-foreground/[0.02]">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-mono text-green-400">Refactored Code</span>
                    </div>
                    <button
                      onClick={handleCopyRefactored}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-foreground/50 hover:text-foreground border border-foreground/10 hover:border-foreground/20 transition-colors cursor-pointer"
                    >
                      {copiedRefactored ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedRefactored ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <CodeEditor
                      value={results.refactoredCode}
                      language={(detectedLang || selectedLanguage || "javascript").toLowerCase()}
                      disabled={true}
                      padding={20}
                      style={{
                        fontSize: 14,
                        backgroundColor: "transparent",
                        fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
                      }}
                      className="w-full font-mono text-foreground/80 leading-relaxed outline-none overflow-x-auto"
                    />
                  </div>
                </div>
              )}

              {/* ─── Summary footer ─── */}
              <div className="p-4 border border-foreground/10 bg-foreground/[0.04] flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-foreground/60">
                  <strong className="text-foreground/90">{results.bugs?.length || 0}</strong> issues found ·{" "}
                  <strong className="text-foreground/90">{results.suggestions?.length || 0}</strong> suggestions ·{" "}
                  <strong className="text-foreground/90">Score {results.overallScore || results.qualityScore || results.score || 0}/10</strong>
                </div>
                <button
                  onClick={() => {
                    setResults(null);
                    setCode("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-mono text-foreground/50 hover:text-foreground underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Review another snippet →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative pb-20 lg:pb-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className={`grid md:grid-cols-4 gap-4 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { icon: Shield, title: "Security Scanning", desc: "Detect vulnerabilities and unsafe patterns" },
              { icon: Zap, title: "Performance Tips", desc: "Optimize for speed and efficiency" },
              { icon: Lightbulb, title: "Best Practices", desc: "Follow industry coding standards" },
              { icon: Code2, title: "12 Languages", desc: "Support for all major languages" },
            ].map((feature) => (
              <div key={feature.title} className="p-6 border border-foreground/10 bg-foreground/[0.02] hover:border-foreground/20 transition-all duration-300 group">
                <feature.icon className="w-6 h-6 text-foreground/40 group-hover:text-foreground/60 transition-colors mb-4" />
                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-foreground/40">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
