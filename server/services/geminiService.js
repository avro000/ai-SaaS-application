import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
let model;

const initGemini = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
};

export const generateResponse = async (prompt) => {
  const aiModel = initGemini();
  console.log(`🤖 Calling Google Gemini API [Model: gemini-2.5-flash]...`);

  try {
    const result = await aiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(`✅ Google Gemini [gemini-2.5-flash] generated response successfully.`);
    return text;
  } catch (error) {
    console.error('Gemini API Error Full:', error);
    if (error.status === 429) {
      throw new Error('AI rate limit reached. Please try again in a moment.');
    }
    if (error.status === 400) {
      throw new Error('Invalid input. Please check your content and try again.');
    }
    throw new Error('AI service is temporarily unavailable. Please try again.');
  }
};

export const parseJsonResponse = (text) => {
  if (!text || typeof text !== 'string') return { summary: '', rawText: text || '' };

  const cleanExtract = (raw) => {
    // 1. Direct parse
    try {
      return JSON.parse(raw);
    } catch {}

    // 2. Extract from markdown fences
    try {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
    } catch {}

    // 3. Extract between outer braces { ... }
    try {
      const startIndex = raw.indexOf('{');
      const endIndex = raw.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonStr = raw.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonStr);
      }
    } catch {}

    return null;
  };

  // Try normal extraction
  let result = cleanExtract(text);
  if (result) return normalizeResult(result);

  // Repair common LLM formatting flaws:
  // 1. Markdown asterisks placed outside quotes (e.g. `"point": **"text"` -> `"point": "**text"`)
  // 2. Unescaped control characters (literal newlines/tabs) inside JSON string literals
  // 3. Trailing commas before closing braces/brackets
  try {
    let candidate = text;
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      candidate = match[1].trim();
    } else {
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        candidate = text.substring(startIndex, endIndex + 1);
      }
    }

    // Step A: Fix asterisks placed outside double quotes
    candidate = candidate.replace(/:\s*\*\*+\s*"/g, ': "**');
    candidate = candidate.replace(/"\s*\*\*+(\s*[,}\]])/g, '**"$1');

    // Step B: Fix unescaped control characters inside string literals
    candidate = candidate.replace(/"((?:[^"\\]|\\.)*)"/gs, (m, content) => {
      const escaped = content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${escaped}"`;
    });

    // Step C: Remove trailing commas before } or ]
    candidate = candidate.replace(/,\s*([}\]])/g, '$1');

    result = cleanExtract(candidate);
    if (result) return normalizeResult(result);

    // Step D: Auto-close unclosed quotes/brackets/braces (when LLMs finish code/text but omit the final closing brace)
    let s = candidate.trim();
    const quotes = s.match(/(?<!\\)"/g);
    if (quotes && quotes.length % 2 !== 0) {
      s += '"';
    }

    let stack = [];
    let inStr = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '"' && s[i - 1] !== '\\') {
        inStr = !inStr;
      } else if (!inStr) {
        if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if (ch === '}' || ch === ']') {
          if (stack.length && stack[stack.length - 1] === ch) {
            stack.pop();
          }
        }
      }
    }

    while (stack.length > 0) {
      s += '\n' + stack.pop();
    }

    result = cleanExtract(s);
    if (result) return normalizeResult(result);
  } catch (repairErr) {
    console.error('JSON repair error:', repairErr);
  }

  // 4. Safe fallback if non-JSON string is returned or repairs failed
  let fallbackSummary = text.trim();
  if (fallbackSummary.startsWith('{') || fallbackSummary.includes('"summary"')) {
    const summaryMatch = fallbackSummary.match(/"summary"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"[a-zA-Z]+|\s*"\s*})/);
    if (summaryMatch) {
      fallbackSummary = summaryMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }

  const scoreMatch = text.match(/"(?:overallScore|qualityScore|score)"\s*:\s*(\d+)/);
  const fallbackScore = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;

  return normalizeResult({
    overallScore: fallbackScore,
    qualityScore: fallbackScore,
    summary: fallbackSummary,
    rawText: text.trim(),
    keyPoints: [],
    actionItems: [],
    topics: [],
    sentiment: 'neutral'
  });
};

const normalizeResult = (res) => {
  if (!res || typeof res !== 'object') return res;

  // Normalize code review score fields
  if (res.overallScore === undefined) {
    if (res.qualityScore !== undefined) res.overallScore = res.qualityScore;
    else if (res.score !== undefined) res.overallScore = res.score;
  }

  // Normalize SQL response query alias
  if (!res.query && (res.sqlQuery || res.sql || res.sql_query)) {
    res.query = res.sqlQuery || res.sql || res.sql_query;
  }

  // Normalize summary if returned as nested object { format, length, content }
  if (res.summary && typeof res.summary === 'object') {
    if (typeof res.summary.content === 'string') {
      res.summary = res.summary.content;
    } else if (typeof res.summary.text === 'string') {
      res.summary = res.summary.text;
    } else if (typeof res.summary.summary === 'string') {
      res.summary = res.summary.summary;
    } else if (Array.isArray(res.summary)) {
      res.summary = res.summary.join('\n\n');
    } else {
      res.summary = JSON.stringify(res.summary);
    }
  }

  // Normalize keyPoints if elements are plain strings or alternate keys
  if (Array.isArray(res.keyPoints)) {
    res.keyPoints = res.keyPoints.map(kp => {
      if (typeof kp === 'string') return { point: kp, importance: 'medium' };
      if (typeof kp === 'object' && kp !== null) {
        return {
          point: kp.point || kp.text || kp.content || JSON.stringify(kp),
          importance: typeof kp.importance === 'string' ? kp.importance : 'medium'
        };
      }
      return { point: String(kp), importance: 'medium' };
    });
  }

  // Normalize actionItems if elements are plain strings or alternate keys
  if (Array.isArray(res.actionItems)) {
    res.actionItems = res.actionItems.map(ai => {
      if (typeof ai === 'string') return { action: ai, priority: 'medium' };
      if (typeof ai === 'object' && ai !== null) {
        return {
          action: ai.action || ai.text || ai.content || JSON.stringify(ai),
          priority: typeof ai.priority === 'string' ? ai.priority : 'medium'
        };
      }
      return { action: String(ai), priority: 'medium' };
    });
  }

  return res;
};
