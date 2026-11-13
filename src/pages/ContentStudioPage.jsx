import { useEffect, useRef, useState, useCallback } from "react";
import Navigation from "../components/Landing/Navigation";
import FooterSection from "../components/Landing/FooterSection";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  PenTool,
  ArrowLeft,
  ArrowRight,
  Type,
  ImageIcon,
  Video,
  AudioLines,
  Sparkles,
  Wand2,
  Play,
  Pause,
  Download,
  FileText,
  Megaphone,
  Mail,
  Languages,
  RefreshCw,
  Clapperboard,
  Eraser,
  Maximize2,
  Hexagon,
  Image as Img,
  UserSquare,
  Scissors,
  Captions,
  Mic,
  Music,
  AudioWaveform,
  FileAudio,
  Upload,
  Check,
  X,
  AlertTriangle,
  Copy,
  Clock,
  Search,
  ChevronDown,
} from "lucide-react";

export const ALL_LANGUAGES = [
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Assamese",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Burmese (Myanmar)",
  "Catalan",
  "Cebuano",
  "Chinese (Simplified / Mandarin)",
  "Chinese (Traditional / Cantonese)",
  "Corsican",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Esperanto",
  "Estonian",
  "Filipino (Tagalog)",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Haitian Creole",
  "Hausa",
  "Hawaiian",
  "Hebrew",
  "Hindi",
  "Hmong",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Kinyarwanda",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latin",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Maori",
  "Marathi",
  "Mongolian",
  "Nepali",
  "Norwegian",
  "Odia (Oriya)",
  "Pashto",
  "Persian (Farsi)",
  "Polish",
  "Portuguese (Brazil)",
  "Portuguese (Portugal)",
  "Punjabi",
  "Romanian",
  "Russian",
  "Samoan",
  "Sanskrit",
  "Scots Gaelic",
  "Serbian",
  "Sesotho",
  "Shona",
  "Sindhi",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swedish",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Turkish",
  "Turkmen",
  "Ukrainian",
  "Urdu",
  "Uyghur",
  "Uzbek",
  "Vietnamese",
  "Welsh",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zulu"
];

const modalities = [
  { id: "text", label: "Text", icon: Type, blurb: "Write anything" },
  { id: "image", label: "Image", icon: ImageIcon, blurb: "Create visuals" },
  { id: "video", label: "Video", icon: Video, blurb: "Produce motion" },
  { id: "audio", label: "Audio", icon: AudioLines, blurb: "Generate sound" },
];

const tools = [
  // ---------- TEXT ----------
  {
    modality: "text", icon: FileText, title: "Blog Writer",
    desc: "Long-form articles with SEO structure and citations.", tag: "Popular",
    input: "prompt", promptLabel: "Topic or title",
    placeholder: "How small teams ship faster with an all-in-one AI studio...",
    fields: [
      { kind: "chips", label: "Tone", options: ["Professional", "Casual", "Bold", "Friendly"] },
      { kind: "select", label: "Length", options: ["Short (600w)", "Medium (1200w)", "Long (2000w+)"] },
      { kind: "select", label: "Audience", options: ["General", "Developers", "Marketers", "Founders"] },
      { kind: "toggle", label: "Include SEO keywords", value: true },
    ],
    output: "text", cta: "Write Article",
  },
  {
    modality: "text", icon: Megaphone, title: "Social & Ad Copy",
    desc: "Hooks, captions and ads tuned per platform.", tag: "",
    input: "prompt", promptLabel: "What are you promoting?",
    placeholder: "Launch of our new AI productivity app for remote teams...",
    fields: [
      { kind: "chips", label: "Platform", options: ["Instagram", "X", "LinkedIn", "TikTok", "Facebook"] },
      { kind: "select", label: "Goal", options: ["Engagement", "Clicks", "Sign-ups", "Sales"] },
      { kind: "select", label: "Variations", options: ["3 options", "5 options", "10 options"] },
    ],
    output: "text", cta: "Generate Copy",
  },
  {
    modality: "text", icon: Mail, title: "Email Composer",
    desc: "Cold outreach, newsletters and follow-ups.", tag: "",
    input: "prompt", promptLabel: "Goal of the email",
    placeholder: "Re-engage trial users who haven't logged in for 14 days...",
    fields: [
      { kind: "chips", label: "Type", options: ["Cold outreach", "Newsletter", "Follow-up", "Welcome"] },
      { kind: "select", label: "Tone", options: ["Warm", "Direct", "Formal", "Playful"] },
      { kind: "select", label: "Length", options: ["Concise", "Standard", "Detailed"] },
    ],
    output: "text", cta: "Draft Email",
  },
  {
    modality: "text", icon: Clapperboard, title: "Script Writer",
    desc: "YouTube, podcast and reel scripts with beats.", tag: "",
    input: "prompt", promptLabel: "Video idea",
    placeholder: "A 60-second explainer on why creators are consolidating AI tools...",
    fields: [
      { kind: "chips", label: "Format", options: ["YouTube", "Podcast", "Reel/Short", "Ad"] },
      { kind: "select", label: "Duration", options: ["30s", "60s", "3 min", "10 min"] },
      { kind: "select", label: "Hook style", options: ["Question", "Bold claim", "Story", "Stat"] },
    ],
    output: "text", cta: "Write Script",
  },
  {
    modality: "text", icon: RefreshCw, title: "Rewriter & Paraphraser",
    desc: "Rephrase, expand or shorten while keeping tone.", tag: "",
    input: "prompt", promptLabel: "Paste your text",
    placeholder: "Paste the paragraph you want to rewrite here...",
    fields: [
      { kind: "chips", label: "Mode", options: ["Rephrase", "Expand", "Shorten", "Simplify"] },
      { kind: "select", label: "Tone", options: ["Keep original", "Professional", "Casual", "Confident"] },
      { kind: "slider", label: "Creativity", min: 0, max: 100, step: 10, value: 40, unit: "%" },
    ],
    output: "text", cta: "Rewrite",
  },
  {
    modality: "text", icon: Languages, title: "Translator",
    desc: "Native-quality translation across 100+ languages.", tag: "",
    input: "prompt", promptLabel: "Text to translate",
    placeholder: "Enter text in any language...",
    fields: [
      { 
        kind: "searchable-select", 
        label: "From", 
        options: ["Auto-detect", ...ALL_LANGUAGES],
        default: "Auto-detect" 
      },
      { 
        kind: "searchable-select", 
        label: "To", 
        options: ALL_LANGUAGES,
        default: "Spanish"
      },
      { kind: "chips", label: "Formality", options: ["Neutral", "Formal", "Casual"] },
    ],
    output: "text", cta: "Translate",
  },
  // ---------- IMAGE ----------
  {
    modality: "image", icon: Img, title: "Text to Image",
    desc: "Photoreal or stylized art from a prompt.", tag: "Popular",
    input: "prompt", promptLabel: "Describe your image",
    placeholder: "A minimal crystalline mountain range at night, cinematic, warm glow...",
    fields: [
      { 
        kind: "select", 
        label: "AI Model", 
        options: [
          "Auto Multi-Model (Auto Fallback)",
          "FLUX.1 Schnell (Recommended)",
          "FLUX Realism (Cinematic)",
          "SDXL Turbo (High-Speed)",
          "Sana 1.6B (Neural)"
        ],
        default: "Auto Multi-Model (Auto Fallback)"
      },
      { kind: "chips", label: "Style", options: ["Photoreal", "3D", "Anime", "Watercolor", "Minimal"] },
      { kind: "select", label: "Aspect ratio", options: ["1:1 Square", "16:9 Wide", "9:16 Portrait", "4:3"] },
      { kind: "select", label: "Variations", options: ["1 image", "2 images", "4 images"] },
    ],
    output: "image", cta: "Generate Images",
  },
  {
    modality: "image", icon: Eraser, title: "Background Remover",
    desc: "One-click cutouts with clean edges.", tag: "",
    input: "upload", accept: "image",
    uploadLabel: "Drop an image to remove its background",
    fields: [
      { kind: "chips", label: "New background", options: ["Transparent", "White", "Black", "Blur"] },
      { kind: "toggle", label: "Refine hair & edges", value: true },
    ],
    output: "image", single: true, cta: "Remove Background",
  },
  {
    modality: "image", icon: Maximize2, title: "Upscaler",
    desc: "Sharpen and enlarge up to 4x without artifacts.", tag: "",
    input: "upload", accept: "image",
    uploadLabel: "Drop a low-res image to upscale",
    fields: [
      { kind: "chips", label: "Scale", options: ["2x", "4x", "8x"] },
      { kind: "toggle", label: "Enhance faces", value: true },
      { kind: "toggle", label: "De-noise", value: false },
    ],
    output: "image", single: true, cta: "Upscale Image",
  },
  {
    modality: "image", icon: Hexagon, title: "Logo & Icon Maker",
    desc: "Brand-ready vectors and app icons.", tag: "",
    input: "prompt", promptLabel: "Brand name & vibe",
    placeholder: "NexusAI — a modern, minimal tech brand, geometric mark...",
    fields: [
      { 
        kind: "select", 
        label: "AI Model", 
        options: [
          "Auto Multi-Model (Auto Fallback)",
          "FLUX.1 Schnell (Recommended)",
          "FLUX Realism (Cinematic)",
          "SDXL Turbo (High-Speed)",
          "Sana 1.6B (Neural)"
        ],
        default: "Auto Multi-Model (Auto Fallback)"
      },
      { kind: "chips", label: "Type", options: ["Logo", "App icon", "Monogram", "Mascot"] },
      { kind: "select", label: "Style", options: ["Minimal", "Geometric", "Playful", "Luxury"] },
      { kind: "select", label: "Color", options: ["Monochrome", "Warm", "Cool", "Vibrant"] },
      { kind: "select", label: "Variations", options: ["1 concept", "2 concepts", "4 concepts"], default: "2 concepts" },
    ],
    output: "image", cta: "Generate Logos",
  },
  {
    modality: "image", icon: ImageIcon, title: "Photo Restore",
    desc: "Repair, colorize and de-noise old photos.", tag: "",
    input: "upload", accept: "image",
    uploadLabel: "Drop an old or damaged photo",
    fields: [
      { kind: "toggle", label: "Colorize", value: true },
      { kind: "toggle", label: "Repair scratches", value: true },
      { kind: "toggle", label: "Sharpen faces", value: true },
    ],
    output: "image", single: true, cta: "Restore Photo",
  },
  // ---------- VIDEO ----------
  {
    modality: "video", icon: Clapperboard, title: "Text to Video",
    desc: "Generate b-roll and scenes from a script.", tag: "Coming Soon",
    input: "prompt", promptLabel: "Describe the scene",
    placeholder: "A 10s aerial shot flying over a neon-lit futuristic city at dusk...",
    fields: [
      { kind: "chips", label: "Style", options: ["Cinematic", "Realistic", "Animated", "Retro"] },
      { kind: "select", label: "Duration", options: ["5s", "10s", "15s"] },
      { kind: "select", label: "Aspect ratio", options: ["16:9", "9:16", "1:1"] },
    ],
    output: "video", cta: "Generate Video",
  },
  {
    modality: "video", icon: UserSquare, title: "Talking Avatar",
    desc: "Lifelike presenters that speak your text.", tag: "Coming Soon",
    input: "prompt", promptLabel: "What should the avatar say?",
    placeholder: "Hi there! Welcome to NexusAI, your all-in-one creative studio...",
    fields: [
      { kind: "select", label: "Avatar", options: ["Ava (F)", "Marcus (M)", "Lena (F)", "Kai (M)"] },
      { kind: "select", label: "Voice", options: ["Natural", "Warm", "Energetic", "Calm"] },
      { kind: "select", label: "Language", options: ["English", "Spanish", "French", "Hindi"] },
    ],
    output: "video", cta: "Create Avatar Video",
  },
  {
    modality: "video", icon: Scissors, title: "Clip & Shorts Maker",
    desc: "Turn long videos into viral vertical clips.", tag: "Coming Soon",
    input: "upload", accept: "video",
    uploadLabel: "Drop a long video or paste a link",
    fields: [
      { kind: "chips", label: "Clip length", options: ["15s", "30s", "60s"] },
      { kind: "select", label: "Aspect", options: ["9:16 Vertical", "1:1 Square", "16:9"] },
      { kind: "toggle", label: "Auto captions", value: true },
    ],
    output: "video", cta: "Find Best Clips",
  },
  {
    modality: "video", icon: Captions, title: "Auto Subtitles",
    desc: "Accurate captions with styling in any language.", tag: "Coming Soon",
    input: "upload", accept: "video",
    uploadLabel: "Drop a video to caption",
    fields: [
      { kind: "select", label: "Language", options: ["Auto-detect", "English", "Spanish", "French"] },
      { kind: "select", label: "Style", options: ["Clean", "Bold", "Karaoke", "Outline"] },
      { kind: "toggle", label: "Burn into video", value: false },
    ],
    output: "video", cta: "Add Subtitles",
  },
  // ---------- AUDIO ----------
  {
    modality: "audio", icon: Mic, title: "Voiceover (TTS)",
    desc: "Studio-grade narration in 100+ voices.", tag: "Popular",
    input: "prompt", promptLabel: "Script to narrate",
    placeholder: "Welcome to the future of content creation, where one idea becomes anything...",
    fields: [
      { kind: "select", label: "Voice", options: ["Ava — warm", "Ryan — deep", "Mia — bright", "Leo — calm"] },
      { kind: "chips", label: "Emotion", options: ["Neutral", "Cheerful", "Serious", "Excited"] },
      { kind: "slider", label: "Speed", min: 50, max: 150, step: 5, value: 100, unit: "%" },
      { kind: "slider", label: "Pitch", min: -10, max: 10, step: 1, value: 0 },
    ],
    output: "audio", cta: "Generate Voiceover",
    outFile: "voiceover_01.wav", outSub: "AI narration",
  },
  {
    modality: "audio", icon: Music, title: "Music Generator",
    desc: "Royalty-free tracks in any genre and mood.", tag: "Beta",
    input: "prompt", promptLabel: "Describe the track",
    placeholder: "An upbeat lo-fi beat with warm keys for a product demo...",
    fields: [
      { kind: "chips", label: "Genre", options: ["Lo-fi", "Cinematic", "Electronic", "Acoustic", "Hip-hop"] },
      { kind: "select", label: "Mood", options: ["Uplifting", "Chill", "Epic", "Dark"] },
      { kind: "select", label: "Duration", options: ["30s", "1 min", "2 min"] },
      { kind: "slider", label: "Tempo", min: 60, max: 180, step: 5, value: 110, unit: " BPM" },
    ],
    output: "audio", cta: "Compose Track",
    outFile: "track_01.wav", outSub: "royalty-free",
  },
  {
    modality: "audio", icon: AudioWaveform, title: "Voice Cloning",
    desc: "Recreate a voice from a short sample.", tag: "Beta",
    input: "prompt+upload", accept: "audio",
    uploadLabel: "Upload a 30s voice sample",
    promptLabel: "Text for the cloned voice to speak",
    placeholder: "Type what you want the cloned voice to say...",
    fields: [
      { kind: "chips", label: "Emotion", options: ["Natural", "Warm", "Energetic"] },
      { kind: "slider", label: "Similarity", min: 0, max: 100, step: 5, value: 85, unit: "%" },
    ],
    output: "audio", cta: "Clone & Speak",
    outFile: "cloned_voice.wav", outSub: "voice clone preview",
  },
  {
    modality: "audio", icon: FileAudio, title: "Transcription",
    desc: "Turn audio into searchable, timestamped text.", tag: "",
    input: "upload", accept: "audio",
    uploadLabel: "Drop an audio or video file to transcribe",
    fields: [
      { kind: "select", label: "Language", options: ["Auto-detect", "English", "Spanish", "French"] },
      { kind: "toggle", label: "Timestamps", value: true },
      { kind: "toggle", label: "Speaker labels", value: true },
    ],
    output: "transcript", cta: "Transcribe",
  },
];

// ─── Helper: initialize default field values for a tool ───
function getDefaultFieldValues(toolFields) {
  const vals = {};
  for (const f of toolFields) {
    if (f.kind === "chips") vals[f.label] = f.default || f.options[0];
    else if (f.kind === "select" || f.kind === "searchable-select") vals[f.label] = f.default || f.options[0];
    else if (f.kind === "slider") vals[f.label] = f.value;
    else if (f.kind === "toggle") vals[f.label] = f.value;
  }
  return vals;
}

// ─── Grid background ───
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      {[...Array(20)].map((_, i) => (
        <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground to-transparent" style={{ top: `${5 * (i + 1)}%` }} />
      ))}
      {[...Array(16)].map((_, i) => (
        <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground to-transparent" style={{ left: `${6.25 * (i + 1)}%` }} />
      ))}
    </div>
  );
}

// ─── Waveform visualization ───
function Waveform({ active }) {
  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {[...Array(48)].map((_, i) => (
        <span key={i} className="w-1 rounded-full bg-foreground/40" style={{ height: active ? `${20 + Math.abs(Math.sin(i * 0.6)) * 60}%` : "12%", transition: "height 0.4s ease", transitionDelay: `${i * 15}ms` }} />
      ))}
    </div>
  );
}

// ─── Markdown Article View ───
function parseMarkdownBlocks(text) {
  if (!text || typeof text !== "string") return [];
  const rawLines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  const isTableRow = (line) => {
    const t = line.trim();
    if (!t) return false;
    return t.startsWith("|") && (t.match(/\|/g) || []).length >= 2;
  };

  const isSeparatorRow = (cells) => {
    if (!cells || cells.length === 0) return false;
    return cells.every(c => /^:?-{2,}:?$/.test(c.trim()) || /^:?-+:?$/.test(c.trim()));
  };

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Check for Table block
    if (isTableRow(trimmed)) {
      const tableLines = [trimmed];
      let j = i + 1;
      while (j < rawLines.length) {
        const nextTrimmed = rawLines[j].trim();
        if (isTableRow(nextTrimmed)) {
          tableLines.push(nextTrimmed);
          j++;
        } else if (nextTrimmed === "") {
          // Peek ahead: LLMs often separate rows with blank lines
          let peek = j + 1;
          while (peek < rawLines.length && rawLines[peek].trim() === "") {
            peek++;
          }
          if (peek < rawLines.length && isTableRow(rawLines[peek].trim())) {
            j = peek;
            tableLines.push(rawLines[j].trim());
            j++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Parse all rows in table
      const parsedRows = tableLines.map(tLine => {
        let content = tLine.trim();
        if (content.startsWith("|")) content = content.slice(1);
        if (content.endsWith("|")) content = content.slice(0, -1);
        return content.split("|").map(cell => cell.trim());
      });

      let headers = [];
      let aligns = [];
      let dataRows = [];

      if (parsedRows.length > 0) {
        headers = parsedRows[0];
        let startIdx = 1;

        if (parsedRows.length > 1 && isSeparatorRow(parsedRows[1])) {
          aligns = parsedRows[1].map(sep => {
            const s = sep.trim();
            const left = s.startsWith(":");
            const right = s.endsWith(":");
            if (left && right) return "center";
            if (right) return "right";
            return "left";
          });
          startIdx = 2;
        }

        for (let r = startIdx; r < parsedRows.length; r++) {
          if (!isSeparatorRow(parsedRows[r])) {
            dataRows.push(parsedRows[r]);
          }
        }
      }

      blocks.push({
        type: "table",
        headers,
        aligns,
        rows: dataRows
      });

      i = j;
      continue;
    }

    // Empty line
    if (!trimmed) {
      // Avoid stacking duplicate empty blocks
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== "empty") {
        blocks.push({ type: "empty" });
      }
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h4", text: trimmed.slice(5).trim() });
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push({ type: "blockquote", text: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    // Bullet point
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      blocks.push({ type: "bullet", text: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      blocks.push({ type: "number", num: numMatch[1], text: numMatch[2].trim() });
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push({ type: "p", text: trimmed });
    i++;
  }

  return blocks;
}

function MarkdownArticleView({ text }) {
  if (!text || typeof text !== "string") return null;

  const blocks = parseMarkdownBlocks(text);

  const alignClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="space-y-3 font-sans text-foreground/85 leading-relaxed text-sm md:text-base selection:bg-foreground selection:text-background">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "empty":
            return <div key={idx} className="h-1.5" />;

          case "hr":
            return <hr key={idx} className="border-t border-foreground/10 my-4" />;

          case "h1":
            return (
              <h1 key={idx} className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight pt-3 pb-2 border-b border-foreground/10">
                <InlineFormatted text={block.text} />
              </h1>
            );

          case "h2":
            return (
              <h2 key={idx} className="text-lg md:text-xl font-display font-medium text-foreground tracking-tight pt-4 pb-1.5 border-b border-foreground/10">
                <InlineFormatted text={block.text} />
              </h2>
            );

          case "h3":
            return (
              <h3 key={idx} className="text-base md:text-lg font-display font-medium text-foreground/90 pt-2.5">
                <InlineFormatted text={block.text} />
              </h3>
            );

          case "h4":
            return (
              <h4 key={idx} className="text-sm font-mono font-medium uppercase tracking-wider text-foreground/75 pt-2">
                <InlineFormatted text={block.text} />
              </h4>
            );

          case "blockquote":
            return (
              <blockquote key={idx} className="border-l-2 border-foreground/30 pl-4 py-1 italic text-foreground/75 my-2">
                <InlineFormatted text={block.text} />
              </blockquote>
            );

          case "bullet":
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-3 text-foreground/80">
                <span className="text-foreground/40 mt-1 text-xs">•</span>
                <span className="flex-1">
                  <InlineFormatted text={block.text} />
                </span>
              </div>
            );

          case "number":
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-3 text-foreground/80">
                <span className="font-mono text-xs text-foreground/40 mt-0.5">{block.num}.</span>
                <span className="flex-1">
                  <InlineFormatted text={block.text} />
                </span>
              </div>
            );

          case "table":
            return (
              <div key={idx} className="my-5 overflow-x-auto rounded-xs border border-foreground/15 bg-foreground/[0.02]">
                <table className="w-full text-xs md:text-sm font-sans border-collapse">
                  {block.headers.length > 0 && (
                    <thead>
                      <tr className="border-b border-foreground/15 bg-foreground/[0.05]">
                        {block.headers.map((h, cIdx) => (
                          <th
                            key={cIdx}
                            className={`py-3 px-4 font-mono font-medium text-foreground tracking-wider uppercase text-[11px] ${alignClass(block.aligns[cIdx])}`}
                          >
                            <InlineFormatted text={h} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-foreground/10">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-foreground/[0.03] transition-colors">
                        {block.headers.map((_, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-4 text-foreground/85 ${alignClass(block.aligns[cIdx])}`}
                          >
                            <InlineFormatted text={row[cIdx] || ""} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "p":
          default:
            return (
              <p key={idx} className="leading-relaxed">
                <InlineFormatted text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}

function InlineFormatted({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          return <em key={i} className="italic text-foreground/90">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          return <code key={i} className="px-1.5 py-0.5 rounded-xs bg-foreground/10 text-foreground font-mono text-xs">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

function stripMarkdown(md) {
  if (!md || typeof md !== "string") return "";
  return md
    // Strip markdown table separator rows e.g. |---|---|
    .replace(/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/gm, "")
    // Strip table boundary pipes into clean readable columns
    .replace(/^\s*\|\s*(.*?)\s*\|\s*$/gm, (match, inner) => {
      return inner.split("|").map(c => c.trim()).filter(Boolean).join("   |   ");
    })
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Typed text animation ───
function TypedOutput({ text, active }) {
  const [shown, setShown] = useState("");
  const [i, setI] = useState(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    setShown("");
    setI(0);
  }, [text, active]);

  useEffect(() => {
    if (active && i < textRef.current.length) {
      const t = setTimeout(() => {
        setShown(textRef.current.slice(0, i + 1));
        setI(i + 1);
      }, 6);
      return () => clearTimeout(t);
    }
  }, [active, i]);

  return (
    <pre className="text-sm font-sans text-foreground/80 leading-relaxed whitespace-pre-wrap">
      {shown}
      {active && i < (textRef.current?.length || 0) && (
        <span className="inline-block w-1.5 h-4 bg-foreground/60 animate-pulse ml-0.5 align-middle" />
      )}
    </pre>
  );
}

// ─── Searchable Dropdown with Inbuilt Search Bar ───
function SearchableSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const query = search.toLowerCase().trim();
  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query)
  );

  return (
    <div className="relative block" ref={containerRef}>
      <span className="text-xs font-mono text-foreground/40 mb-1.5 block">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-sm font-mono bg-[#0a0a0b] border ${
          isOpen ? "border-foreground/40 ring-1 ring-foreground/20" : "border-foreground/10 hover:border-foreground/25"
        } text-foreground/85 px-3 py-2 rounded-sm focus:outline-none flex items-center justify-between cursor-pointer h-[42px] transition-all`}
      >
        <span className="truncate">{value || options[0] || "Select"}</span>
        <ChevronDown
          className={`w-4 h-4 text-foreground/40 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#0d0d10] border border-foreground/20 rounded-sm shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
          {/* Inbuilt Search Bar */}
          <div className="p-2 border-b border-foreground/10 bg-foreground/[0.03]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full bg-foreground/[0.04] border border-foreground/15 rounded-xs pl-8 pr-7 py-1.5 text-xs font-mono text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 text-foreground/40 hover:text-foreground p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <span className="text-[10px] font-mono text-foreground/40">
                {filtered.length} {filtered.length === 1 ? "language" : "languages"}
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[10px] font-mono text-foreground/50 hover:text-foreground underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Language List */}
          <div className="overflow-y-auto max-h-56 p-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-foreground/35">
                No matching language found for "{search}"
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(label, opt);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 text-xs font-mono text-left rounded-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-foreground text-background font-medium"
                        : "text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-background shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field Control (state lifted to parent) ───
function FieldControl({ field, value, onChange }) {
  if (field.kind === "searchable-select" || (field.kind === "select" && (field.searchable || field.options.length > 8))) {
    return (
      <SearchableSelect
        label={field.label}
        value={value}
        options={field.options}
        onChange={onChange}
      />
    );
  }

  if (field.kind === "select") {
    return (
      <label className="block">
        <span className="text-xs font-mono text-foreground/40 mb-1.5 block">{field.label}</span>
        <select
          value={value}
          onChange={(e) => onChange(field.label, e.target.value)}
          className="w-full text-sm font-mono bg-[#0a0a0b] border border-foreground/10 text-foreground/70 px-3 py-2 rounded-sm focus:outline-none focus:border-foreground/30 [&>option]:bg-[#0a0a0b] [&>option]:text-foreground/70 cursor-pointer h-[42px]"
        >
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.kind === "chips") {
    return (
      <div className="block sm:col-span-2">
        <span className="text-xs font-mono text-foreground/40 mb-1.5 block">{field.label}</span>
        <div className="flex flex-wrap gap-2">
          {field.options.map((o) => (
            <button
              key={o} type="button"
              onClick={() => onChange(field.label, o)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-all cursor-pointer ${
                value === o
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground/55 border-foreground/15 hover:border-foreground/30"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.kind === "slider") {
    return (
      <label className="block">
        <span className="text-xs font-mono text-foreground/40 mb-1.5 flex items-center justify-between">
          {field.label}
          <span className="text-foreground/70">{value}{field.unit ?? ""}</span>
        </span>
        <input
          type="range" min={field.min} max={field.max} step={field.step}
          value={value}
          onChange={(e) => onChange(field.label, Number(e.target.value))}
          className="w-full accent-foreground cursor-pointer"
        />
      </label>
    );
  }

  // toggle
  return (
    <button
      type="button"
      onClick={() => onChange(field.label, !value)}
      className="flex items-center justify-between gap-3 px-3 py-2 border border-foreground/10 rounded-sm bg-foreground/[0.02] hover:border-foreground/25 transition-colors cursor-pointer"
    >
      <span className="text-xs font-mono text-foreground/55 text-left">{field.label}</span>
      <span className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${value ? "bg-foreground" : "bg-foreground/15"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

// ─── Upload Zone (real file input) ───
function UploadZone({ accept, label, file, onFileChange }) {
  const inputRef = useRef(null);
  const Icon = accept === "image" ? ImageIcon : accept === "audio" ? AudioLines : Video;

  const acceptMap = {
    image: "image/png,image/jpeg,image/jpg,image/webp,image/gif",
    audio: "audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm,audio/flac",
    video: "video/mp4,video/webm,video/quicktime",
  };

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 border border-foreground/15 rounded-sm bg-foreground/[0.04]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-sm bg-foreground/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-foreground/80 font-mono truncate">{file.name}</p>
            <p className="text-xs text-foreground/40 flex items-center gap-1">
              <Check className="w-3 h-3" /> {(file.size / 1024).toFixed(0)} KB · Ready to process
            </p>
          </div>
        </div>
        <button
          type="button" onClick={() => onFileChange(null)}
          className="text-foreground/40 hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef} type="file" className="hidden"
        accept={acceptMap[accept] || "*"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex flex-col items-center justify-center gap-3 px-4 py-10 border border-dashed border-foreground/20 rounded-sm bg-foreground/[0.02] hover:border-foreground/40 hover:bg-foreground/[0.04] transition-colors text-center cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-foreground/40" />
        </div>
        <span className="text-sm text-foreground/60 font-mono">{label}</span>
        <span className="text-xs text-foreground/30">Click to browse · {accept} files</span>
      </button>
    </>
  );
}

// ─── Audio Player ───
function AudioPlayer({ audioSrc, filename, subtitle }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="border border-foreground/10 rounded-sm p-6 bg-foreground/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-foreground/90 transition-colors">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div className="min-w-0">
            <p className="text-sm text-foreground/80 font-mono truncate">{filename}</p>
            <p className="text-xs text-foreground/40">{subtitle}</p>
          </div>
          <a
            href={audioSrc} download={filename}
            className="ml-auto flex items-center gap-1.5 text-xs font-mono text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
        <Waveform active={isPlaying} />
        <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} />
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function ContentStudioPage() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [modality, setModality] = useState("text");
  const [activeTitle, setActiveTitle] = useState(tools[0].title);
  const [prompt, setPrompt] = useState("");
  const [fieldValues, setFieldValues] = useState(() => getDefaultFieldValues(tools[0].fields));
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultData, setResultData] = useState(null); // { type, data, ... }
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [textViewMode, setTextViewMode] = useState("formatted"); // "formatted" | "clean" | "markdown"
  const promptRef = useRef(null);
  const playgroundRef = useRef(null);

  useEffect(() => { setIsVisible(true); }, []);

  const tool = tools.find((t) => t.title === activeTitle) ?? tools[0];
  const modalityTools = tools.filter((t) => t.modality === modality);

  const reset = useCallback(() => {
    setResultData(null);
    setError(null);
    setIsGenerating(false);
    setPrompt("");
    setUploadedFile(null);
    setCopied(false);
  }, []);

  const selectTool = useCallback((t, scroll = false) => {
    setModality(t.modality);
    setActiveTitle(t.title);
    setFieldValues(getDefaultFieldValues(t.fields));
    reset();
    if (scroll) {
      playgroundRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (t.input !== "upload") setTimeout(() => promptRef.current?.focus(), 500);
    }
  }, [reset]);

  const switchModality = useCallback((id) => {
    const first = tools.find((t) => t.modality === id);
    setModality(id);
    setActiveTitle(first.title);
    setFieldValues(getDefaultFieldValues(first.fields));
    reset();
  }, [reset]);

  const handleFieldChange = useCallback((label, value) => {
    setFieldValues((prev) => ({ ...prev, [label]: value }));
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;

    // Auth check
    if (!user) {
      toast.error("Please log in to use Content Studio.");
      return;
    }

    // Validation
    if ((tool.input === "prompt" || tool.input === "prompt+upload") && !prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    if ((tool.input === "upload" || tool.input === "prompt+upload") && !uploadedFile) {
      toast.error("Please upload a file.");
      return;
    }

    setIsGenerating(true);
    setResultData(null);
    setError(null);

    try {
      let res;

      if (uploadedFile) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append("toolTitle", tool.title);
        formData.append("prompt", prompt);
        formData.append("fields", JSON.stringify(fieldValues));
        formData.append("file", uploadedFile);

        res = await api.post("/tools/content-studio", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000, // 2 minutes for image/audio generation
        });
      } else {
        res = await api.post("/tools/content-studio", {
          toolTitle: tool.title,
          prompt,
          fields: fieldValues,
        }, { timeout: 120000 });
      }

      setResultData(res.data);

      if (res.data.note) {
        toast(res.data.note, { icon: "ℹ️" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Generation failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = typeof resultData?.data === "string" 
    ? (resultData.wordCount || resultData.data.trim().split(/\s+/).filter(Boolean).length)
    : 0;
  const readingTime = typeof resultData?.data === "string"
    ? (resultData.readingTime || Math.max(1, Math.round(wordCount / 200)))
    : 0;

  const handleExport = (forceMarkdown = false) => {
    if (!resultData) return;

    if (resultData.type === "text" || resultData.type === "transcript") {
      const rawText = typeof resultData.data === 'string' ? resultData.data : JSON.stringify(resultData.data);
      const isMd = forceMarkdown || textViewMode === "markdown";
      const textToCopy = isMd ? rawText : stripMarkdown(rawText);

      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(isMd ? "Markdown copied to clipboard!" : "Article text copied (clean without markdown)!");
      setTimeout(() => setCopied(false), 2000);
    } else if (resultData.type === "image" || resultData.type === "image-single") {
      const imgData = resultData.type === "image-single" ? resultData.data : resultData.data?.[0];
      if (imgData) {
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `nexusai_${tool.title.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.click();
      }
    } else if (resultData.type === "audio") {
      const link = document.createElement("a");
      link.href = resultData.data;
      link.download = resultData.filename || "output.wav";
      link.click();
    }
  };

  const handleDownloadText = () => {
    if (!resultData?.data) return;
    const rawText = typeof resultData.data === 'string' ? resultData.data : JSON.stringify(resultData.data);
    const isMd = textViewMode === "markdown";
    const textToDownload = isMd ? rawText : stripMarkdown(rawText);
    const ext = isMd ? "md" : "txt";
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusai_${tool.title.replace(/\s+/g, '_').toLowerCase()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded .${ext} file`);
  };

  const ToolIcon = tool.icon;
  const isComingSoon = tool.tag === "Coming Soon";

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <GridBackground />
      <Navigation />

      {/* Hero */}
      <section className="relative pt-24 lg:pt-28 pb-8">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
          <Link
            to="/tools"
            className={`inline-flex items-center gap-2 text-sm font-mono text-foreground/50 hover:text-foreground transition-all duration-500 mb-8 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-sm bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                  <PenTool className="w-7 h-7 text-foreground/70" />
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-foreground/10 text-foreground/60">03</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-[0.95] tracking-tight text-foreground mb-4">
                Content Studio
              </h1>
              <p className="text-lg text-foreground/50 max-w-2xl text-pretty">
                Every kind of content from one place — text, image, video and audio.
                Pick a tool and its workspace adapts: the inputs, controls and output
                are tailored to exactly what you're making.
              </p>
            </div>

            <div className={`flex gap-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {[
                { value: "19", label: "Generators" },
                { value: "4", label: "Modalities" },
                { value: "1", label: "Subscription" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="block text-3xl font-display text-foreground">{stat.value}</span>
                  <span className="text-xs font-mono text-foreground/40">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Adaptive Studio Playground */}
      <section ref={playgroundRef} className="relative pb-16 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Modality switcher */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-thin">
              {modalities.map((m) => {
                const MIcon = m.icon;
                const active = modality === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchModality(m.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-sm border transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      active ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground/50 border-foreground/10 hover:border-foreground/30 hover:text-foreground/70"
                    }`}
                  >
                    <MIcon className="w-4 h-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Sub-tool chips */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-thin pb-1">
              {modalityTools.map((t) => {
                const active = t.title === activeTitle;
                return (
                  <button
                    key={t.title}
                    onClick={() => selectTool(t)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      active ? "bg-foreground/10 text-foreground border-foreground/30" : "bg-transparent text-foreground/45 border-foreground/10 hover:border-foreground/25 hover:text-foreground/70"
                    }`}
                  >
                    {t.title}
                    {t.tag === "Coming Soon" && <Clock className="w-3 h-3 text-yellow-500/70" />}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-6">
              {/* Input panel */}
              <div className="relative border border-foreground/10 bg-foreground/[0.02] rounded-sm flex flex-col">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/10">
                  <div className="w-8 h-8 rounded-sm bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
                    <ToolIcon className="w-4 h-4 text-foreground/70" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground leading-tight">{tool.title}</p>
                    <p className="text-xs text-foreground/40 leading-tight">{tool.desc}</p>
                  </div>
                  {isComingSoon && (
                    <span className="text-[10px] font-mono px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-sm">Coming Soon</span>
                  )}
                </div>

                <div className="flex-1 p-4 space-y-5">
                  {/* Upload */}
                  {(tool.input === "upload" || tool.input === "prompt+upload") && tool.accept && (
                    <UploadZone accept={tool.accept} label={tool.uploadLabel ?? "Upload a file"} file={uploadedFile} onFileChange={setUploadedFile} />
                  )}

                  {/* Prompt */}
                  {(tool.input === "prompt" || tool.input === "prompt+upload") && (
                    <div>
                      <span className="text-xs font-mono text-foreground/40 mb-1.5 block">{tool.promptLabel}</span>
                      <textarea
                        ref={promptRef}
                        value={prompt}
                        onChange={(e) => { setPrompt(e.target.value); setResultData(null); }}
                        placeholder={tool.placeholder}
                        rows={4}
                        className="w-full min-h-[110px] bg-foreground/[0.02] border border-foreground/10 rounded-sm p-3 text-base text-foreground/85 leading-relaxed resize-none focus:outline-none focus:border-foreground/30 placeholder:text-foreground/25"
                        spellCheck={false}
                        disabled={isComingSoon}
                      />
                    </div>
                  )}

                  {/* Tool-specific controls */}
                  {tool.fields.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {tool.fields.map((f) => (
                        <FieldControl key={f.label} field={f} value={fieldValues[f.label]} onChange={handleFieldChange} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate button */}
                <div className="px-4 py-4 border-t border-foreground/10 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-foreground/40 hidden sm:block">
                    Output: <span className="text-foreground/70 capitalize">{tool.output}</span>
                  </span>
                  {!user ? (
                    <Link to="/login" className="h-11 px-6 rounded-sm bg-foreground/20 text-foreground/70 font-mono text-sm flex items-center gap-2 hover:bg-foreground/30 transition-colors">
                      Log in to generate
                    </Link>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || isComingSoon}
                      className="h-11 px-6 rounded-sm bg-foreground text-background hover:bg-foreground/90 font-mono text-sm disabled:opacity-50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {tool.cta}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {!isGenerating && !resultData && !error && (
                <div className="relative border border-dashed border-foreground/10 overflow-hidden">
                  <div className="relative flex flex-col items-center justify-center text-center px-6 py-20 lg:py-28">
                    {isComingSoon ? (
                      <>
                        <Clock className="w-9 h-9 text-yellow-500/50 mb-6" />
                        <p className="text-base lg:text-lg font-mono text-yellow-500/70 text-balance">
                          {tool.title} is coming soon
                        </p>
                        <p className="text-sm text-foreground/30 mt-3 max-w-xl text-pretty">
                          Video generation requires specialized GPU infrastructure that we are actively building. Stay tuned!
                        </p>
                      </>
                    ) : (
                      <>
                        <ToolIcon className="w-9 h-9 text-foreground/40 mb-6" />
                        <p className="text-base lg:text-lg font-mono text-foreground/50 text-balance">
                          Configure {tool.title} above, then click "{tool.cta}"
                        </p>
                        <p className="text-sm text-foreground/30 mt-3 max-w-xl text-pretty">
                          {tool.desc} Your {tool.output} output will appear right here.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && !isGenerating && (
                <div className="relative border border-red-500/30 bg-red-500/5 overflow-hidden">
                  <div className="relative flex flex-col items-center justify-center text-center px-6 py-16">
                    <AlertTriangle className="w-9 h-9 text-red-400/70 mb-4" />
                    <p className="text-sm font-mono text-red-400/90 mb-2">Generation Failed</p>
                    <p className="text-xs text-red-400/60 max-w-md">{error}</p>
                    <button
                      onClick={() => { setError(null); handleGenerate(); }}
                      className="mt-4 text-xs font-mono text-foreground/60 hover:text-foreground underline underline-offset-4 cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* Output panel */}
              {(isGenerating || resultData) && (
                <div className="relative border border-foreground/10 bg-foreground/[0.02] overflow-hidden flex flex-col min-h-[420px]">
                  <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-foreground/10 bg-foreground/[0.02] gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Sparkles className="w-4 h-4 text-foreground/50" />
                      <span className="text-sm font-mono text-foreground/70">Output Preview</span>

                      {resultData?.type === "text" && wordCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-foreground/10 text-foreground/80 border border-foreground/15 rounded-xs">
                            {wordCount.toLocaleString()} words
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-foreground/5 text-foreground/60 border border-foreground/10 rounded-xs">
                            ~{readingTime} min read
                          </span>
                        </div>
                      )}

                      {resultData?.note && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-sm">{resultData.note}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {resultData?.type === "text" && (
                        <div className="flex items-center border border-foreground/10 rounded-xs p-0.5 bg-foreground/[0.02]">
                          <button
                            onClick={() => setTextViewMode("formatted")}
                            className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer rounded-xs ${
                              textViewMode === "formatted"
                                ? "bg-foreground text-background font-medium"
                                : "text-foreground/50 hover:text-foreground"
                            }`}
                          >
                            Formatted
                          </button>
                          <button
                            onClick={() => setTextViewMode("clean")}
                            className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer rounded-xs ${
                              textViewMode === "clean"
                                ? "bg-foreground text-background font-medium"
                                : "text-foreground/50 hover:text-foreground"
                            }`}
                          >
                            Clean Text
                          </button>
                          <button
                            onClick={() => setTextViewMode("markdown")}
                            className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer rounded-xs ${
                              textViewMode === "markdown"
                                ? "bg-foreground text-background font-medium"
                                : "text-foreground/50 hover:text-foreground"
                            }`}
                          >
                            Markdown
                          </button>
                        </div>
                      )}

                      {resultData && (
                        <div className="flex items-center gap-1.5">
                          {resultData.type === "text" && (
                            <button
                              onClick={handleDownloadText}
                              className="p-1.5 text-xs font-mono text-foreground/50 hover:text-foreground border border-foreground/10 hover:border-foreground/30 transition-colors cursor-pointer rounded-xs"
                              title="Download text file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleExport()}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-foreground/70 hover:text-foreground bg-foreground/10 hover:bg-foreground/15 border border-foreground/15 transition-colors cursor-pointer rounded-xs"
                          >
                            {resultData.type === "text" || resultData.type === "transcript" ? (
                              copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>
                            ) : (
                              <><Download className="w-3.5 h-3.5" /> Export</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                    {/* Loading */}
                    {isGenerating && (
                      <div className="h-full flex flex-col items-center justify-center py-16">
                        <div className="relative w-20 h-20 mb-6">
                          <div className="absolute inset-0 border-2 border-foreground/10 rounded-full" />
                          <div className="absolute inset-0 border-2 border-t-foreground border-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-foreground/60 font-mono text-sm mb-1">Running {tool.title}...</p>
                        <p className="text-foreground/30 text-xs capitalize">Generating {tool.output}</p>
                        <p className="text-foreground/20 text-[10px] mt-4 font-mono">
                          {tool.type === 'image' 
                            ? 'Synthesizing with neural diffusion • Auto-cascading to fallback cluster if busy'
                            : 'This may take 15–30 seconds depending on the model'}
                        </p>
                      </div>
                    )}

                    {/* TEXT result */}
                    {resultData?.type === "text" && (
                      <div className="p-2">
                        {textViewMode === "formatted" && (
                          <MarkdownArticleView text={resultData.data} />
                        )}
                        {textViewMode === "clean" && (
                          <pre className="text-sm font-sans text-foreground/85 leading-relaxed whitespace-pre-wrap font-normal">
                            {stripMarkdown(resultData.data)}
                          </pre>
                        )}
                        {textViewMode === "markdown" && (
                          <pre className="text-xs font-mono text-foreground/75 leading-relaxed whitespace-pre-wrap bg-foreground/[0.02] p-3 border border-foreground/10">
                            {resultData.data}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* TRANSCRIPT result */}
                    {resultData?.type === "transcript" && (
                      <div className="space-y-3">
                        <pre className="text-sm font-sans text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {typeof resultData.data === 'string' ? resultData.data : JSON.stringify(resultData.data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* IMAGE result (multi) */}
                    {resultData?.type === "image" && (
                      <div className={`grid gap-4 ${resultData.data.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {resultData.data.map((imgSrc, n) => {
                          const aspect = fieldValues['Aspect ratio'] || '';
                          const aspectClass = aspect.includes('16:9')
                            ? 'aspect-video'
                            : aspect.includes('9:16')
                            ? 'aspect-[9/16] max-w-xs mx-auto'
                            : aspect.includes('4:3')
                            ? 'aspect-[4/3]'
                            : 'aspect-square';

                          return (
                            <div key={n} className={`relative ${aspectClass} overflow-hidden border border-foreground/15 rounded-sm bg-foreground/5 group transition-all duration-300 hover:border-foreground/30 shadow-sm`}>
                              <img src={imgSrc} alt={`Generated ${n + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                                <span className="text-[10px] font-mono text-foreground/80 px-1.5 py-0.5 bg-background/80 rounded-xs border border-foreground/10">
                                  #{n + 1}
                                </span>
                                <a
                                  href={imgSrc} download={`nexusai_image_${n + 1}.jpg`}
                                  className="w-8 h-8 rounded-sm bg-background/90 border border-foreground/20 flex items-center justify-center text-foreground/75 hover:text-foreground hover:bg-background transition-colors cursor-pointer shadow-sm"
                                  title="Download Image"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* IMAGE result (single — before/after) */}
                    {resultData?.type === "image-single" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative overflow-hidden border border-foreground/10 rounded-sm aspect-square bg-foreground/5 flex items-center justify-center">
                          {resultData.original && (
                            <img src={resultData.original} alt="Original" className="max-w-full max-h-full object-contain p-2" />
                          )}
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 bg-background/80 text-foreground/70 rounded-xs border border-foreground/10">
                            Original (Before)
                          </span>
                        </div>
                        <div className={`relative overflow-hidden border border-foreground/20 rounded-sm aspect-square flex items-center justify-center group shadow-inner ${
                          tool.title === "Background Remover" 
                            ? "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:12px_12px] bg-background" 
                            : "bg-foreground/5"
                        }`}>
                          <img src={resultData.data} alt="Processed" className="max-w-full max-h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]" />
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono px-2.5 py-0.5 bg-foreground text-background font-medium rounded-xs shadow-sm">
                            {tool.title === "Upscaler" 
                              ? (resultData.dimensions || "Upscaled (After)")
                              : tool.title === "Photo Restore" 
                              ? "Restored (After)" 
                              : "Cutout (After)"}
                          </span>
                          <a
                            href={resultData.data} 
                            download={
                              tool.title === "Upscaler" 
                                ? "nexusai_upscaled.png" 
                                : tool.title === "Photo Restore" 
                                ? "nexusai_restored.png" 
                                : "nexusai_cutout.png"
                            }
                            className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-sm bg-background/90 border border-foreground/20 flex items-center gap-1.5 text-xs font-mono text-foreground/80 hover:text-foreground hover:bg-background transition-colors cursor-pointer shadow-sm"
                            title={`Download ${tool.title === "Upscaler" ? "Upscaled" : tool.title === "Photo Restore" ? "Restored" : "Cutout"} Image`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download {tool.title === "Upscaler" ? "Upscaled" : "PNG"}</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* AUDIO result */}
                    {resultData?.type === "audio" && (
                      <AudioPlayer audioSrc={resultData.data} filename={resultData.filename || "output.wav"} subtitle={resultData.note || "AI generated"} />
                    )}

                    {/* COMING SOON result */}
                    {resultData?.type === "coming-soon" && (
                      <div className="h-full flex flex-col items-center justify-center py-16">
                        <Clock className="w-12 h-12 text-yellow-500/50 mb-4" />
                        <p className="text-foreground/60 font-mono text-sm mb-2">Coming Soon</p>
                        <p className="text-foreground/30 text-xs max-w-md text-center">{resultData.data}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why one studio */}
      <section className="relative pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Wand2, title: "A workspace per tool", desc: "Every generator gets its own tailored inputs, controls and output." },
              { icon: Sparkles, title: "Consistent brand voice", desc: "Styles and tone carry across every generator automatically." },
              { icon: Download, title: "Export anywhere", desc: "Download or push straight to your favorite platforms in one click." },
            ].map((f) => {
              const FIcon = f.icon;
              return (
                <div key={f.title} className="p-6 border border-foreground/10 bg-foreground/[0.02]">
                  <FIcon className="w-6 h-6 text-foreground/40 mb-4" />
                  <h3 className="font-medium text-sm mb-1 text-foreground">{f.title}</h3>
                  <p className="text-xs text-foreground/40 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-display text-foreground mb-2">
                One studio for all your content
              </h2>
              <p className="text-foreground/50">
                Replace your stack of AI subscriptions. Start creating for free.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/register" className="inline-flex items-center justify-center rounded-sm bg-foreground text-background hover:bg-foreground/90 h-12 px-6 font-mono text-sm transition-colors">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/tools" className="inline-flex items-center justify-center rounded-sm border border-foreground/20 text-foreground/70 hover:bg-foreground/5 h-12 px-6 font-mono text-sm transition-colors">
                View All Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
