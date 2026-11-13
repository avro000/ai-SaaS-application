import { useEffect, useRef, useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Link } from "react-router-dom";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Database,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Zap,
  Download,
  Terminal,
  Layers,
  Table,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  Code2,
  CheckCircle,
  FileCode,
  ShieldCheck,
  Share2,
} from "lucide-react";

// ─── Supported SQL Dialects ───
const supportedDialects = [
  { id: "PostgreSQL", name: "PostgreSQL", desc: "Advanced ORDBMS with rich CTE & JSON support" },
  { id: "MySQL", name: "MySQL", desc: "Widely used relational database engine" },
  { id: "SQLite", name: "SQLite", desc: "Lightweight file-based embedded SQL engine" },
  { id: "SQL Server", name: "SQL Server", desc: "Microsoft T-SQL enterprise database" },
  { id: "Snowflake", name: "Snowflake", desc: "Cloud data warehouse analytical SQL" },
  { id: "BigQuery", name: "BigQuery", desc: "Google Cloud serverless analytical SQL" },
  { id: "Oracle", name: "Oracle PL/SQL", desc: "High-performance enterprise database" },
];

// ─── Supported LLM Models ───
const supportedModels = [
  { id: "gemini", name: "Gemini 2.5 Flash", provider: "Google", desc: "Fast & highly accurate" },
  { id: "mistral", name: "Codestral", provider: "Mistral AI", desc: "Specialized code & SQL reasoning" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", provider: "Groq", desc: "Precise technical queries" },
  { id: "openai/gpt-oss-120b", name: "GPT OSS 120B", provider: "Groq", desc: "Deep complex query planner" },
  { id: "openai/gpt-oss-20b", name: "GPT OSS 20B", provider: "Groq", desc: "Ultra-fast lightweight reasoning" },
];

// ─── Preset Examples ───
const samplePresets = [
  {
    title: "E-Commerce Retention",
    desc: "Active customers with 3+ orders over $500",
    dialect: "PostgreSQL",
    schema: `-- Users and Orders schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  order_date TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);`,
    query: "Find all users who registered in the last 6 months and have placed at least 3 completed orders totaling over $500. Return their name, email, order count, total spent, and average order value, ordered by total spent descending."
  },
  {
    title: "SaaS MRR & Churn",
    desc: "Monthly recurring revenue and customer churn",
    dialect: "PostgreSQL",
    schema: `-- Subscriptions and events
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  mrr DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'active', 'churned', 'paused'
  start_date DATE NOT NULL,
  churn_date DATE
);`,
    query: "Calculate total active MRR, new subscriber count, and churn rate percentage grouped by month for the last 12 months using window functions."
  },
  {
    title: "Inventory Stock Alert",
    desc: "Products below reorder threshold",
    dialect: "MySQL",
    schema: `-- Inventory management
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  reorder_level INT NOT NULL
);

CREATE TABLE stock_levels (
  stock_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity_on_hand INT NOT NULL,
  quantity_reserved INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);`,
    query: "List all products where net available inventory (quantity on hand minus reserved) across all warehouses is below the reorder level. Show product name, SKU, total net available, and the deficit quantity."
  },
  {
    title: "Org Tree Hierarchy",
    desc: "Recursive employee & manager reporting chain",
    dialect: "PostgreSQL",
    schema: `-- Employees table
CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  manager_id INT REFERENCES employees(employee_id),
  salary DECIMAL(10,2) NOT NULL
);`,
    query: "Write a recursive CTE to display the full organizational hierarchy starting from the CEO (manager_id IS NULL). Include the employee name, their management depth level, and the path of managers above them."
  }
];

// ─── Subtle Grid Background ───
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

// ─── Inline Markdown & Typography Formatter ───
function FormattedText({ text, className = "" }) {
  if (!text || typeof text !== "string") return null;
  const lines = text.split(/\r?\n/);
  return (
    <span className={className}>
      {lines.map((line, lineIdx) => {
        // Parse bold, italic, and inline code spans
        const parts = line.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);
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
              if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
                return (
                  <code key={i} className="px-1.5 py-0.5 rounded-xs bg-foreground/10 text-foreground font-mono text-[12px]">
                    {part.slice(1, -1)}
                  </code>
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

export default function SqlGeneratorPage() {
  const { user } = useAuth();
  const [selectedDialect, setSelectedDialect] = useState("PostgreSQL");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [queryPrompt, setQueryPrompt] = useState("");
  const [schemaText, setSchemaText] = useState("");
  const [showSchemaDrawer, setShowSchemaDrawer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Copy states
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [copiedRelatedIdx, setCopiedRelatedIdx] = useState(null);

  const queryTextareaRef = useRef(null);
  const resultsRef = useRef(null);

  // Keyboard shortcut: Ctrl + Enter or ⌘ + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!isGenerating && queryPrompt.trim()) {
          e.preventDefault();
          handleGenerate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGenerating, queryPrompt, schemaText, selectedDialect, selectedModel]);

  // Load preset sample
  const applyPreset = (preset) => {
    setSelectedDialect(preset.dialect);
    setSchemaText(preset.schema);
    setQueryPrompt(preset.query);
    setShowSchemaDrawer(true);
    toast.success(`Loaded "${preset.title}" preset`);
    queryTextareaRef.current?.focus();
  };

  // Clear inputs
  const handleClear = () => {
    setQueryPrompt("");
    setSchemaText("");
    setResults(null);
    setError(null);
  };

  // Generate SQL Query
  const handleGenerate = async () => {
    if (!queryPrompt.trim()) {
      toast.error("Please describe what SQL query you need");
      queryTextareaRef.current?.focus();
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await api.post("/tools/sql-generate", {
        query: queryPrompt.trim(),
        schema: schemaText.trim() || undefined,
        dialect: selectedDialect,
        model: selectedModel,
      });

      const output = res.data?.output;
      if (!output) {
        throw new Error("No output received from the server");
      }

      setResults(output);
      toast.success("SQL query generated successfully!");

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      console.error("SQL generation error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to generate SQL query. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Main Query
  const copyMainQuery = () => {
    if (!results?.query) return;
    navigator.clipboard.writeText(results.query);
    setCopiedQuery(true);
    toast.success("SQL query copied to clipboard");
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Copy Related Query
  const copyRelatedQuery = (q, idx) => {
    navigator.clipboard.writeText(q);
    setCopiedRelatedIdx(idx);
    toast.success("Companion query copied to clipboard");
    setTimeout(() => setCopiedRelatedIdx(null), 2000);
  };

  // Download .sql file
  const downloadSqlFile = () => {
    if (!results?.query) return;
    const blob = new Blob([results.query], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_${selectedDialect.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded .sql file");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-foreground selection:text-background">
      <Navigation />
      <GridBackground />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-12 pt-28 pb-20 relative z-10">
        {/* Breadcrumb */}
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 hover:text-foreground/80 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
        </Link>

        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border border-foreground/15 bg-foreground/[0.03] flex items-center justify-center">
              <Database className="w-5 h-5 text-foreground/80" />
            </div>
            <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest px-2 py-0.5 border border-foreground/10 bg-foreground/[0.02]">
              Tool 05 · SQL Generator
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display text-foreground tracking-tight mb-3">
            SQL Generator
          </h1>
          <p className="text-sm md:text-base text-foreground/50 max-w-2xl leading-relaxed">
            Convert natural language to production-grade SQL queries instantly. Works with PostgreSQL, MySQL, SQLite, SQL Server, Snowflake, and more databases.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="p-4 border border-foreground/10 bg-foreground/[0.02]">
              <div className="text-xl md:text-2xl font-display text-foreground">99%</div>
              <div className="text-[11px] font-mono text-foreground/40 mt-1 uppercase">Query Accuracy</div>
            </div>
            <div className="p-4 border border-foreground/10 bg-foreground/[0.02]">
              <div className="text-xl md:text-2xl font-display text-foreground">7+</div>
              <div className="text-[11px] font-mono text-foreground/40 mt-1 uppercase">SQL Dialects</div>
            </div>
            <div className="p-4 border border-foreground/10 bg-foreground/[0.02]">
              <div className="text-xl md:text-2xl font-display text-foreground">Sub-second</div>
              <div className="text-[11px] font-mono text-foreground/40 mt-1 uppercase">Query Synthesis</div>
            </div>
            <div className="p-4 border border-foreground/10 bg-foreground/[0.02]">
              <div className="text-xl md:text-2xl font-display text-foreground">Schema-Aware</div>
              <div className="text-[11px] font-mono text-foreground/40 mt-1 uppercase">Index Optimization</div>
            </div>
          </div>
        </div>

        {/* ─── Main Workspace Card ─── */}
        <div className="border border-foreground/10 bg-foreground/[0.02] p-5 md:p-8 relative mb-10">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-foreground/10 mb-6">
            {/* Dialect Selector */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono text-foreground/40 uppercase">Dialect:</span>
              <div className="flex flex-wrap gap-1.5">
                {supportedDialects.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDialect(d.id)}
                    className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                      selectedDialect === d.id
                        ? "bg-foreground text-background border-foreground font-medium"
                        : "bg-transparent text-foreground/60 border-foreground/10 hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-foreground/40 uppercase">AI Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs font-mono bg-[#0a0a0b] border border-foreground/15 text-foreground/80 px-3 py-1.5 rounded-sm focus:outline-none focus:border-foreground/40 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/80 cursor-pointer"
              >
                {supportedModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-[11px] font-mono text-foreground/40 uppercase flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3 h-3 text-foreground/50" /> Try Samples:
            </span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="text-[11px] font-mono px-2.5 py-1 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.06] hover:border-foreground/25 text-foreground/70 transition-colors cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
            {(queryPrompt || schemaText) && (
              <button
                onClick={handleClear}
                className="text-[11px] font-mono text-foreground/40 hover:text-foreground/80 transition-colors ml-auto cursor-pointer underline underline-offset-4"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Natural Language Query Input */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-foreground/40" />
                Describe the SQL query you need
              </label>
              <span className="text-[11px] font-mono text-foreground/30">
                {queryPrompt.length} characters
              </span>
            </div>
            <textarea
              ref={queryTextareaRef}
              value={queryPrompt}
              onChange={(e) => setQueryPrompt(e.target.value)}
              placeholder="e.g. Find the top 5 customers by total order amount in the last 30 days who have ordered more than 3 times, and calculate their average basket size..."
              rows={4}
              className="w-full bg-[#050506] border border-foreground/15 p-4 text-sm font-sans text-foreground/90 placeholder:text-foreground/25 focus:outline-none focus:border-foreground/40 transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Collapsible Database Schema Context Drawer */}
          <div className="border border-foreground/10 bg-foreground/[0.01] mb-6">
            <button
              onClick={() => setShowSchemaDrawer(!showSchemaDrawer)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-foreground/70">
                <Table className="w-3.5 h-3.5 text-foreground/40" />
                <span>Database Schema / Table DDL</span>
                <span className="text-foreground/40 font-normal">
                  {schemaText.trim() ? `(${schemaText.split('\n').length} lines loaded)` : "(Optional, but recommended for exact column names)"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground/40">
                {schemaText.trim() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
                {showSchemaDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showSchemaDrawer && (
              <div className="p-4 pt-1 border-t border-foreground/10 space-y-3">
                <p className="text-xs text-foreground/50">
                  Paste your table schemas, <code className="text-foreground/70">CREATE TABLE</code> statements, or list of columns so the query maps to your exact schema.
                </p>
                <div className="border border-foreground/10 bg-[#050506] overflow-hidden">
                  <CodeEditor
                    value={schemaText}
                    language="sql"
                    placeholder={"-- Example:\nCREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(255));\nCREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT, amount DECIMAL(10,2), created_at TIMESTAMP);"}
                    onChange={(ev) => setSchemaText(ev.target.value)}
                    padding={16}
                    minHeight={140}
                    style={{
                      fontSize: 13,
                      backgroundColor: "transparent",
                      fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace",
                    }}
                  />
                </div>
                {schemaText && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSchemaText("")}
                      className="text-[11px] font-mono text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer"
                    >
                      Clear schema
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-foreground/10">
            <div className="text-xs font-mono text-foreground/40 flex items-center gap-2">
              <span className="px-1.5 py-0.5 border border-foreground/10 bg-foreground/[0.04]">
                Ctrl + Enter
              </span>
              <span>to generate</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !queryPrompt.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Query ({supportedModels.find(m => m.id === selectedModel)?.name})...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Generate SQL Query
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/[0.05] text-red-400 text-sm mb-10 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Generation Error</p>
              <p className="text-xs text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ─── Results Dashboard ─── */}
        {results && (
          <div ref={resultsRef} className="space-y-8 animate-fade-in-up">
            {/* Main Generated SQL Query Card */}
            <div className="border border-foreground/10 bg-foreground/[0.02]">
              <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-foreground/10 bg-foreground/[0.03] gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-mono text-foreground font-medium">Generated Query</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-green-400/10 text-green-400 border border-green-400/20 uppercase">
                    {results.dialect || selectedDialect}
                  </span>
                  {results.complexity && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-foreground/10 text-foreground/70 uppercase">
                      {results.complexity}
                    </span>
                  )}
                  {results.tablesUsed && Array.isArray(results.tablesUsed) && results.tablesUsed.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-foreground/40">
                      <span>Tables:</span>
                      {results.tablesUsed.map((t, idx) => (
                        <span key={idx} className="text-foreground/70 underline underline-offset-2">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadSqlFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-foreground/60 hover:text-foreground border border-foreground/10 hover:border-foreground/30 transition-colors cursor-pointer"
                    title="Download .sql file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export .sql</span>
                  </button>
                  <button
                    onClick={copyMainQuery}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-foreground hover:text-foreground bg-foreground/10 hover:bg-foreground/15 border border-foreground/20 transition-colors cursor-pointer"
                  >
                    {copiedQuery ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuery ? "Copied!" : "Copy SQL"}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Display */}
              <div className="bg-[#050506] overflow-x-auto">
                <CodeEditor
                  value={results.query || "-- No query generated"}
                  language="sql"
                  disabled={true}
                  padding={20}
                  style={{
                    fontSize: 14,
                    backgroundColor: "transparent",
                    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace",
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>

            {/* Explanation & Logic Breakdown */}
            {results.explanation && (
              <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-foreground/50" />
                  <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
                    Query Logic & Explanation
                  </span>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed font-sans">
                  <FormattedText text={results.explanation} />
                </div>
              </div>
            )}

            {/* Performance, Optimization & Indexing Advice */}
            {results.optimization && (
              <div className="border border-green-500/20 bg-green-500/[0.02] p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
                    Performance & Index Recommendations
                  </span>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed font-sans">
                  <FormattedText text={results.optimization} />
                </div>
              </div>
            )}

            {/* Safety Warnings & Dialect Nuances */}
            {results.warnings && Array.isArray(results.warnings) && results.warnings.length > 0 && (
              <div className="border border-amber-500/20 bg-amber-500/[0.02] p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    Execution Caveats & Dialect Notes ({results.warnings.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {results.warnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/75 leading-relaxed">
                      <span className="text-amber-400/80 font-mono mt-0.5">•</span>
                      <div><FormattedText text={warn} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related & Companion Queries */}
            {results.relatedQueries && Array.isArray(results.relatedQueries) && results.relatedQueries.length > 0 && (
              <div className="border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-foreground/50" />
                  <span className="text-xs font-mono text-foreground/50 uppercase tracking-wider">
                    Companion & Related Queries
                  </span>
                </div>
                <div className="space-y-4">
                  {results.relatedQueries.map((rq, i) => (
                    <div key={i} className="border border-foreground/10 bg-[#050506] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-mono text-foreground font-medium">
                          {rq.title || `Variant ${i + 1}`}
                        </div>
                        <button
                          onClick={() => copyRelatedQuery(rq.query, i)}
                          className="flex items-center gap-1 text-[11px] font-mono text-foreground/50 hover:text-foreground cursor-pointer transition-colors"
                        >
                          {copiedRelatedIdx === i ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedRelatedIdx === i ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      {rq.description && (
                        <p className="text-xs text-foreground/60 mb-2 leading-relaxed">
                          {rq.description}
                        </p>
                      )}
                      <pre className="text-xs font-mono text-foreground/80 bg-foreground/[0.03] p-3 border border-foreground/5 overflow-x-auto">
                        {rq.query}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Quick Action Bar */}
            <div className="p-4 border border-foreground/10 bg-foreground/[0.03] flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs font-mono text-foreground/50">
                Generated with <strong className="text-foreground/80">{supportedModels.find(m => m.id === selectedModel)?.name || selectedModel}</strong> for <strong className="text-foreground/80">{selectedDialect}</strong>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    queryTextareaRef.current?.focus();
                  }}
                  className="text-xs font-mono text-foreground/50 hover:text-foreground transition-colors cursor-pointer underline underline-offset-4"
                >
                  Write another query ↑
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
