import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  Send,
  Loader2,
  Camera,
  FileText,
  HelpCircle,
  ShieldAlert,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import toast from "react-hot-toast";

const ALL_TOOLS = [
  // Content Studio
  { group: "Content Studio — Creative & Visual", name: "Text to Image" },
  { group: "Content Studio — Creative & Visual", name: "Logo & Icon Maker" },
  { group: "Content Studio — Creative & Visual", name: "Background Remover" },
  { group: "Content Studio — Creative & Visual", name: "Upscaler" },
  { group: "Content Studio — Creative & Visual", name: "Photo Restore" },
  // Content Studio — Writing
  { group: "Content Studio — Writing & Copy", name: "Social & Ad Copy" },
  { group: "Content Studio — Writing & Copy", name: "Email Composer" },
  { group: "Content Studio — Writing & Copy", name: "Script Writer" },
  { group: "Content Studio — Writing & Copy", name: "Rewriter & Paraphraser" },
  { group: "Content Studio — Writing & Copy", name: "Translator" },
  // Content Studio — Audio
  { group: "Content Studio — Audio & Voice", name: "Voiceover (TTS)" },
  { group: "Content Studio — Audio & Voice", name: "Music Generator" },
  { group: "Content Studio — Audio & Voice", name: "Transcription" },
  // Standalone Tools
  { group: "NexusAI Flagship Tools", name: "Code Reviewer" },
  { group: "NexusAI Flagship Tools", name: "Resume Optimizer" },
  { group: "NexusAI Flagship Tools", name: "Smart Summarizer" },
  { group: "NexusAI Flagship Tools", name: "SQL Generator" },
  // General Platform
  { group: "Platform & Account", name: "Authentication / Login" },
  { group: "Platform & Account", name: "History & Saved Outputs" },
  { group: "Platform & Account", name: "UI & Layout / Theme" },
  { group: "Platform & Account", name: "Other / General" },
];

const ISSUE_CATEGORIES = [
  "Model / Generation Error",
  "Rate Limit / Cooldown",
  "Incorrect / Poor Quality Output",
  "UI / Formatting Glitch",
  "File Upload / Processing Failure",
  "Performance / High Latency",
  "Crash / Unresponsive",
  "Feature Request / Suggestion",
  "Other"
];

const SEVERITIES = [
  { level: "Low", desc: "Minor cosmetic issue or small enhancement", color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
  { level: "Medium", desc: "Feature works partially or workaround exists", color: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10" },
  { level: "High", desc: "Tool fails or yields unusable output", color: "border-orange-500/40 text-orange-400 bg-orange-500/10" },
  { level: "Critical / Blocker", desc: "Complete failure, crash, or data loss", color: "border-red-500/40 text-red-400 bg-red-500/10" }
];

export default function ReportIssuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [reporterName, setReporterName] = useState(user?.name || "");
  const [reporterEmail, setReporterEmail] = useState(user?.email || "");
  const [toolName, setToolName] = useState("Text to Image");
  const [category, setCategory] = useState("Model / Generation Error");
  const [severity, setSeverity] = useState("Medium");
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [description, setDescription] = useState("");
  const [promptOrInput, setPromptOrInput] = useState("");

  // Screenshot State
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Environment Meta
  const [browserInfo, setBrowserInfo] = useState("");
  const [osInfo, setOsInfo] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Update reporter info if user loads asynchronously
  useEffect(() => {
    if (user) {
      if (!reporterName) setReporterName(user.name || "");
      if (!reporterEmail) setReporterEmail(user.email || "");
    }
  }, [user]);

  // Auto-detect OS & Browser details
  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome/")) browser = "Google Chrome";
    else if (ua.includes("Safari/")) browser = "Apple Safari";

    let os = "Unknown OS";
    if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    setBrowserInfo(`${browser} (${window.innerWidth}x${window.innerHeight})`);
    setOsInfo(os);
  }, []);

  // Listen for clipboard Paste events to directly capture screenshots
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageSelected(file);
            toast.success("Screenshot pasted from clipboard!");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleImageSelected = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPEG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10 MB.");
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelected(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reporterName.trim()) {
      toast.error("Please provide your name.");
      return;
    }
    if (!reporterEmail.trim() || !reporterEmail.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please summarize the issue.");
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      toast.error("Please provide a bit more detail (at least 15 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("reporterName", reporterName.trim());
      formData.append("reporterEmail", reporterEmail.trim().toLowerCase());
      formData.append("toolName", toolName);
      formData.append("category", category);
      formData.append("severity", severity);
      formData.append("title", title.trim());
      formData.append("errorMessage", errorMessage.trim());
      formData.append("description", description.trim());
      formData.append("promptOrInput", promptOrInput.trim());
      formData.append("browserInfo", browserInfo);
      formData.append("osInfo", osInfo);
      formData.append("currentUrl", window.location.href);

      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const token = localStorage.getItem("token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers,
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit report.");
      }

      setSubmittedTicket(data.ticketId);
      toast.success("Issue report dispatched to dev team!");
    } catch (err) {
      console.error("Report submission failed:", err);
      toast.error(err.message || "Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-[#eca8d6] selection:text-background">
      <Navigation />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-xs font-mono text-foreground/50 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Tools
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-foreground/10 pb-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Developer Direct Line
                </span>
                <span className="text-xs font-mono text-foreground/40">• Direct Email Dispatch</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-foreground">
                Report a Tool Issue
              </h1>
              <p className="text-sm text-foreground/60 mt-1.5 max-w-2xl leading-relaxed">
                Found a bug, rate-limit cooldown, format error, or unexpected output? Report it directly to our engineering team with full context and screenshots.
              </p>
            </div>
          </div>
        </div>

        {/* Submission Confirmation Card */}
        {submittedTicket ? (
          <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-sm p-8 text-center sm:text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2 justify-center sm:justify-start">
                  <h2 className="text-xl font-display font-semibold text-foreground">Report Received & Dispatched</h2>
                  <span className="px-2.5 py-0.5 font-mono text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xs">
                    Ticket #{submittedTicket}
                  </span>
                </div>
                <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
                  Thank you for helping us make NexusAI better. A detailed incident alert has been sent directly to the development team at <strong className="text-foreground font-mono">avpodder000@gmail.com</strong> with your system context, tool state, and screenshot.
                </p>
                <p className="text-xs font-mono text-foreground/50 mb-6">
                  A receipt confirmation has also been sent to <span className="text-foreground/80">{reporterEmail}</span>.
                </p>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setTitle("");
                      setErrorMessage("");
                      setDescription("");
                      setPromptOrInput("");
                      handleRemoveScreenshot();
                    }}
                    className="px-4 py-2 text-xs font-mono bg-foreground/10 hover:bg-foreground/15 text-foreground border border-foreground/15 rounded-xs transition-colors cursor-pointer"
                  >
                    Submit Another Report
                  </button>
                  <Link
                    to="/tools"
                    className="px-4 py-2 text-xs font-mono bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xs transition-colors"
                  >
                    Return to Tools
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Reporter Identity */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-foreground/10 pb-3">
                <FileText className="w-4 h-4 text-foreground/50" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-foreground/70 font-semibold">
                  1. Reporter Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-foreground/70 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-3.5 py-2.5 text-sm bg-foreground/5 border border-foreground/15 rounded-xs text-foreground placeholder:text-foreground/30 focus:outline-hidden focus:border-[#eca8d6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-foreground/70 mb-1.5">
                    Your Email (for updates) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="e.g. alex@company.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-foreground/5 border border-foreground/15 rounded-xs text-foreground placeholder:text-foreground/30 focus:outline-hidden focus:border-[#eca8d6] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Auto-detected metadata pill */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-foreground/40">
                <Info className="w-3.5 h-3.5" />
                <span>Auto-detected:</span>
                <span className="px-2 py-0.5 bg-foreground/5 rounded-xs border border-foreground/10 text-foreground/60">{osInfo}</span>
                <span className="px-2 py-0.5 bg-foreground/5 rounded-xs border border-foreground/10 text-foreground/60">{browserInfo}</span>
              </div>
            </div>

            {/* 2. Tool & Issue Scope */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 rounded-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-foreground/10 pb-3">
                <AlertCircle className="w-4 h-4 text-amber-400/80" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-foreground/70 font-semibold">
                  2. Tool & Issue Scope
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tool Selection */}
                <div>
                  <label className="block text-xs font-mono text-foreground/70 mb-1.5">
                    Affected Tool <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0c0e12] border border-foreground/15 rounded-xs text-foreground focus:outline-hidden focus:border-[#eca8d6] transition-colors cursor-pointer"
                  >
                    {Array.from(new Set(ALL_TOOLS.map((t) => t.group))).map((group) => (
                      <optgroup key={group} label={group} className="bg-[#141720] text-foreground/80 font-mono">
                        {ALL_TOOLS.filter((t) => t.group === group).map((t) => (
                          <option key={t.name} value={t.name} className="py-1">
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Issue Category */}
                <div>
                  <label className="block text-xs font-mono text-foreground/70 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#0c0e12] border border-foreground/15 rounded-xs text-foreground focus:outline-hidden focus:border-[#eca8d6] transition-colors cursor-pointer"
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Severity Selection */}
              <div>
                <label className="block text-xs font-mono text-foreground/70 mb-2">
                  Severity / Urgency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SEVERITIES.map((sev) => {
                    const isSelected = severity === sev.level;
                    return (
                      <button
                        type="button"
                        key={sev.level}
                        onClick={() => setSeverity(sev.level)}
                        className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${
                          isSelected
                            ? `${sev.color} ring-1 ring-offset-0 ring-current`
                            : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/25 text-foreground/70"
                        }`}
                      >
                        <div className="font-mono text-xs font-bold mb-0.5">{sev.level}</div>
                        <div className="text-[11px] opacity-70 leading-snug">{sev.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Issue Details */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-foreground/10 pb-3">
                <HelpCircle className="w-4 h-4 text-foreground/50" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-foreground/70 font-semibold">
                  3. What Happened?
                </h2>
              </div>

              {/* Issue Headline */}
              <div>
                <label className="block text-xs font-mono text-foreground/70 mb-1.5">
                  Issue Summary / Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rate limit banner was generated instead of an image during second variation"
                  className="w-full px-3.5 py-2.5 text-sm bg-foreground/5 border border-foreground/15 rounded-xs text-foreground placeholder:text-foreground/30 focus:outline-hidden focus:border-[#eca8d6] transition-colors"
                />
              </div>

              {/* Error Message (if any) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-foreground/70">
                    Exact Error Message / Code (optional)
                  </label>
                  <span className="text-[11px] font-mono text-foreground/40">From toast or console</span>
                </div>
                <textarea
                  rows={2}
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste error text here (e.g. 402 Payment Required: Free limit reached, or Failed to fetch)..."
                  className="w-full px-3.5 py-2 text-xs font-mono bg-[#08090d] border border-foreground/15 rounded-xs text-red-300 placeholder:text-foreground/30 focus:outline-hidden focus:border-red-400/50 transition-colors"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-mono text-foreground/70 mb-1.5">
                  Detailed Description & Steps to Reproduce <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what you were doing, what you clicked, what you expected to happen, and what actually happened..."
                  className="w-full px-3.5 py-2.5 text-sm bg-foreground/5 border border-foreground/15 rounded-xs text-foreground placeholder:text-foreground/30 focus:outline-hidden focus:border-[#eca8d6] transition-colors leading-relaxed"
                />
              </div>

              {/* Prompt / Input used */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-foreground/70">
                    Input / Prompt Used (optional)
                  </label>
                  <span className="text-[11px] font-mono text-foreground/40">Helps reproduce accurately</span>
                </div>
                <textarea
                  rows={2}
                  value={promptOrInput}
                  onChange={(e) => setPromptOrInput(e.target.value)}
                  placeholder="Paste the prompt or input parameters you entered when the issue occurred..."
                  className="w-full px-3.5 py-2 text-xs font-mono bg-foreground/5 border border-foreground/15 rounded-xs text-foreground placeholder:text-foreground/30 focus:outline-hidden focus:border-[#eca8d6] transition-colors"
                />
              </div>
            </div>

            {/* 4. Screenshot Upload & Paste */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-5 sm:p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-foreground/50" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-foreground/70 font-semibold">
                    4. Screenshot Attachment
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-foreground/40 hidden sm:inline">
                  Tip: Press Ctrl+V anywhere to paste
                </span>
              </div>

              {screenshotPreview ? (
                /* Screenshot Preview Card */
                <div className="relative border border-foreground/20 rounded-sm p-3 bg-foreground/5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative max-w-xs max-h-48 overflow-hidden rounded-xs border border-foreground/15 bg-background">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot Preview"
                      className="object-contain max-h-44 w-auto mx-auto"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="text-xs font-mono text-foreground truncate font-medium mb-1">
                      {screenshotFile?.name || "pasted_screenshot.png"}
                    </p>
                    <p className="text-[11px] font-mono text-foreground/50 mb-3">
                      {((screenshotFile?.size || 0) / 1024).toFixed(1)} KB • {screenshotFile?.type || "image/png"}
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xs transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove Screenshot
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageSelected(file);
                  }}
                  className="border-2 border-dashed border-foreground/15 hover:border-foreground/30 bg-foreground/[0.01] hover:bg-foreground/[0.03] rounded-sm p-8 text-center cursor-pointer transition-all duration-200 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center mx-auto mb-3 text-foreground/50 group-hover:text-foreground group-hover:scale-105 transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80 mb-1">
                    Click to upload a screenshot, or drag & drop
                  </p>
                  <p className="text-xs font-mono text-foreground/40">
                    PNG, JPEG, WebP up to 10 MB • Or simply press <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded-xs text-foreground/70">Ctrl+V</kbd> to paste
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-foreground/10">
              <p className="text-xs font-mono text-foreground/40 text-center sm:text-left">
                Your report will be sent directly to the NexusAI engineering team.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-foreground text-background font-mono text-sm font-medium rounded-xs hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Send Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
