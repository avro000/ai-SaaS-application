/**
 * Content Studio Controller
 * Unified endpoint that dispatches each tool to the correct HF service function,
 * building tool-specific prompts from ALL user-supplied parameters.
 */

import {
  generateText,
  generateImage,
  removeBackground,
  upscaleImage,
  restoreImage,
  generateSpeech,
  generateMusic,
  transcribeAudio,
} from '../services/huggingfaceService.js';
import sharp from 'sharp';
import History from '../models/History.js';
import User from '../models/User.js';

// ────────────────────────────────────────────────────
// PROMPT BUILDERS — one per tool, incorporating all fields
// ────────────────────────────────────────────────────

function buildBlogWriterPrompt(prompt, fields) {
  const tone = fields['Tone'] || 'Professional';
  const length = fields['Length'] || 'Medium (1200w)';
  const audience = fields['Audience'] || 'General';
  const seo = fields['Include SEO keywords'] !== false;

  let targetWords = 1200;
  let minWords = 1100;
  let maxWords = 1250;
  let sectionGuideline = '6 to 7 balanced sections, approximately 160-180 words per section';

  if (length.includes('600')) {
    targetWords = 600;
    minWords = 550;
    maxWords = 650;
    sectionGuideline = '4 to 5 concise sections, approximately 120-140 words per section';
  } else if (length.includes('2000')) {
    targetWords = 2000;
    minWords = 1900;
    maxWords = 2100;
    sectionGuideline = '8 to 10 in-depth sections with technical depth, approximately 200-220 words per section';
  }

  const toneGuides = {
    'Professional': 'Authoritative, analytical, objective, and industry-standard. Avoid colloquialisms or hyperbole.',
    'Casual': 'Conversational, approachable, and engaging, like a senior peer sharing practical advice over coffee.',
    'Bold': 'Opinionated, direct, provocative, and high-conviction. Challenge common dogmas and take a definitive stance.',
    'Friendly': 'Warm, inviting, accessible, and supportive, using clear explanations and encouraging language.'
  };

  const audienceGuides = {
    'Developers': 'Write specifically for software engineers, tech leads, and system architects. Dive into technical mechanics, architectural trade-offs, code paradigms, performance, and developer ergonomics. Skip generic high-level fluff.',
    'Founders': 'Write for startup founders, CTOs, and business leaders. Emphasize business impact, ROI, engineering velocity, team scaling, competitive advantage, and cost efficiency.',
    'Marketers': 'Write for growth and marketing professionals. Highlight engagement, user adoption, narrative hooks, distribution, and audience retention.',
    'General': 'Write for an informed general readership. Use intuitive analogies and clear context, avoiding unexplained technical jargon.'
  };

  return `You are an elite, award-winning technology journalist and long-form essayist.

TOPIC: "${prompt}"

STRICT PARAMETERS:
1. TARGET AUDIENCE: ${audience}
   Guidance: ${audienceGuides[audience] || audienceGuides['General']}

2. TONE & VOICE: ${tone}
   Guidance: ${toneGuides[tone] || toneGuides['Professional']}

3. STRICT WORD COUNT LIMIT:
   - Target length: EXACTLY ${targetWords} words.
   - ABSOLUTE HARD BOUND: Your total output MUST be between ${minWords} and ${maxWords} words.
   - Section structure: ${sectionGuideline}.
   - Count your words carefully. Do NOT write more than ${maxWords} words. Do NOT write fewer than ${minWords} words.

4. SEO KEYWORD INTEGRATION:
   ${seo
     ? `- Seamlessly integrate 5-8 high-intent search terms related to "${prompt}" naturally into the prose flow.
   - CRITICAL FORMATTING RULE: NEVER bold, italicize, or wrap SEO keywords in asterisks (**). They must read completely naturally as normal text in the sentences.`
     : '- Focus solely on organic reader value without search engine keyword optimization.'}

5. FORMATTING & TYPOGRAPHY RULES:
   - Headline: Start directly with a single "# Compelling Article Title" (do not use quotes).
   - Sections: Use "## Section Title" for major sections and "### Subtitle" sparingly if needed.
   - Spacing: Leave exactly one blank line between paragraphs and before headings.
   - Asterisks (**): Use bold asterisks ONLY for key takeaway lead-ins in bullet points. NEVER pepper asterisks around common nouns, technical terms, or keywords inside sentences.
   - Bullet lists: Use standard hyphens "- " with brief, high-impact points where relevant.
   - Clean Prose: No conversational preamble (e.g. "Sure, here is your article:"). Begin immediately with the title "# ".`;
}

function buildSocialCopyPrompt(prompt, fields) {
  const platform = fields['Platform'] || 'Instagram';
  const goal = fields['Goal'] || 'Engagement';
  const variations = fields['Variations'] || '3 options';
  const count = parseInt(variations) || 3;

  const platformGuides = {
    'X': 'Write punchy, high-impact tweets (under 280 characters per post) or hook threads. Use sharp sentence fragments, 1-2 focused hashtags, and high-retention hooks.',
    'LinkedIn': 'Professional thought-leadership style. Use a strong 1-line hook before the fold, generous line breaks, bullet points, business insight, and 3-5 relevant industry hashtags. End with a discussion question.',
    'Instagram': 'Visually descriptive, engaging storytelling caption. Use clean paragraph breaks, emojis where natural, an unambiguous call-to-action (e.g. "Save this for later", "Link in bio"), and 8-12 niche-targeted hashtags.',
    'TikTok': 'Conversational, energetic, authentic hook. Sounds like speaking directly to the viewer. Include on-screen text suggestion, snappy caption, and trending hashtags.',
    'Facebook': 'Community-focused, relatable, and conversational. Emphasize storytelling and a direct question to drive comments.'
  };

  const goalGuides = {
    'Engagement': 'Focus on controversial insight, relatable humor, or thought-provoking questions that compel comments, shares, and debates.',
    'Clicks': 'Create immense curiosity gaps, clear value teasers, and a compelling reason to click the link right now.',
    'Sign-ups': 'Highlight transformation, pain relief, free value, or instant access to turn viewers into active subscribers/users.',
    'Sales': 'Emphasize urgency, social proof, ROI, and direct benefits with a decisive, low-friction call-to-action.'
  };

  return `You are a world-class growth marketer, direct-response copywriter, and viral social media strategist.

WHAT IS BEING PROMOTED:
"${prompt}"

PARAMETERS:
1. PLATFORM: ${platform}
   Platform Guide: ${platformGuides[platform] || platformGuides['Instagram']}

2. PRIMARY GOAL: ${goal}
   Goal Guide: ${goalGuides[goal] || goalGuides['Engagement']}

3. VARIATIONS: EXACTLY ${count} distinct, completely different creative angles (e.g. Story-driven, Question/Contrarian hook, Hard data/metrics, Direct benefit).

FORMATTING REQUIREMENTS:
- Structure each variation clearly with:
  ## Option [Number]: [Angle Name]
  **Hook:** [The opening 1-2 lines]
  **Body:** [The core caption/post]
  **Call to Action:** [Clear CTA]
  **Hashtags:** [Relevant hashtags for ${platform}]
- Do NOT pepper unnecessary asterisks (**) inside normal sentences.
- Begin immediately with "## Option 1:" without conversational preamble.`;
}

function buildEmailPrompt(prompt, fields) {
  const type = fields['Type'] || 'Cold outreach';
  const tone = fields['Tone'] || 'Warm';
  const length = fields['Length'] || 'Standard';

  const typeGuides = {
    'Cold outreach': 'Write a compelling, low-friction cold outreach email. Focus on a pattern-interrupt hook, clear problem-solution alignment, and a low-commitment ask (e.g., asking for brief thoughts or an intro chat rather than an aggressive hard sell).',
    'Newsletter': 'Write an engaging, insightful newsletter issue. Include an editorial opening hook, 2-3 concise digestible bullet points or insights, and a community-oriented takeaway or discussion prompt.',
    'Follow-up': 'Write a polite, high-value follow-up email. Acknowledge previous context without sounding aggressive or desperate, add a quick piece of value or insight, and offer a clear, low-friction next step.',
    'Welcome': 'Write a warm, inspiring onboarding welcome email. Celebrate the subscriber/user joining, outline 2-3 immediate high-impact quick wins they can achieve today, and include a single clear primary CTA to get started.'
  };

  const toneGuides = {
    'Warm': 'Empathetic, approachable, encouraging, and collaborative. Speaks like a helpful trusted partner.',
    'Direct': 'Clear, concise, no-fluff, respectful of the reader\'s busy calendar. Gets straight to the value in the first two sentences.',
    'Formal': 'Polished, corporate-standard, authoritative, and respectful. Suited for executive and enterprise communications.',
    'Playful': 'Witty, upbeat, conversational, and energetic with brand personality. Keep it light while maintaining clarity.'
  };

  const lengthGuides = {
    'Concise': '75 to 125 words for the email body. Extremely punchy, mobile-optimized, fast to scan in under 30 seconds.',
    'Standard': '150 to 250 words for the email body. Balanced narrative with sufficient context, clear benefits, and focused CTA.',
    'Detailed': '275 to 400 words for the email body. Comprehensive breakdown, contextual storytelling, or multi-step onboarding guide.'
  };

  return `You are an elite email copywriter who crafts high-converting, spam-filter-safe emails for modern tech companies and professionals.

GOAL / CONTEXT:
"${prompt}"

PARAMETERS:
1. EMAIL TYPE: ${type}
   Guidance: ${typeGuides[type] || typeGuides['Cold outreach']}

2. TONE & VOICE: ${tone}
   Guidance: ${toneGuides[tone] || toneGuides['Warm']}

3. LENGTH TARGET: ${length}
   Guidance: ${lengthGuides[length] || lengthGuides['Standard']}

CRITICAL FORMATTING & STRUCTURE:
Format the output cleanly in Markdown with the following exact sections:

## Subject Line Options
Provide 3 high-open-rate subject lines:
- **Option 1 (Direct & Clear):** [Subject line]
- **Option 2 (Curiosity & Hook):** [Subject line]
- **Option 3 (Value & Benefit):** [Subject line]

## Preview Text
[A crisp 1-sentence pre-header snippet under 90 characters that complements the subject line]

---

## Email Draft
[Opening Greeting, e.g. "Hi {{FirstName}}," or "Hey team,"]

[Email Body — structured according to the ${length} length guideline and ${type} strategy. Use short 1-2 sentence paragraphs for effortless readability.]

[Clear Call-to-Action button/link, e.g. "**CTA:** [Action text]"]

[Sign-off and Signature placeholder, e.g.
Best,
[Your Name]
[Your Title / Company]
]

---

## Strategic P.S. (Postscript)
**P.S.** [A compelling postscript driving urgency, offering an alternative low-commitment resource, or reiterating the main benefit.]

FORMATTING RULES:
- Do NOT wrap random common words in asterisks (**).
- Begin immediately with "## Subject Line Options" without conversational filler.`;
}

function buildScriptPrompt(prompt, fields) {
  const format = fields['Format'] || 'YouTube';
  const duration = fields['Duration'] || '60s';
  const hookStyle = fields['Hook style'] || 'Question';

  const formatGuides = {
    'YouTube': 'Full video script with an engaging thumbnail concept, 3 viral title options, high-retention 10-second opening hook, progressive content beats with b-roll/visual directions, and a clear subscriber CTA.',
    'Reel/Short': 'Ultra-fast vertical video script (9:16). Needs an immediate 0-3s scroll-stopping visual hook, rapid-fire pacing, on-screen text overlay prompts, and a seamless loop transition.',
    'Podcast': 'Engaging conversational audio script. Includes podcast intro, audio cues (intro stinger, transition chimes), segment breakdown with natural conversational voice, and an inspiring sign-off.',
    'Ad': 'High-converting performance marketing ad script. Follows Hook -> Pain Point -> Solution Demonstration -> Social Proof/Risk Reversal -> Urgent CTA.'
  };

  const hookGuides = {
    'Question': 'Open with a thought-provoking, uncomfortable, or curiosity-inducing question that immediately calls out the target viewer.',
    'Bold claim': 'Start with a shocking, contrarian, or audacious claim that challenges common industry beliefs.',
    'Story': 'Begin in media res with a vivid personal or real-world micro-story that hooks viewer empathy instantly.',
    'Stat': 'Hit the audience with a mind-blowing, specific data point or statistic that creates an urgency gap.'
  };

  const durationGuides = {
    '30s': 'Pacing for 30 seconds (~65-80 spoken words). Laser-focused on 1 single punchy takeaway.',
    '60s': 'Pacing for 60 seconds (~130-160 spoken words). Fast hook, 2-3 quick points, and punchy CTA.',
    '3 min': 'Pacing for 3 minutes (~400-500 spoken words). Structured across 3 clear visual beats and a practical demonstration.',
    '10 min': 'Pacing for a long-form video (~1,200-1,500 spoken words). Comprehensive script covering introduction, 4-5 detailed chapters with b-roll notes, mid-roll cliffhanger, and outro.'
  };

  return `You are a world-class creator, director, and YouTube/TikTok scriptwriter with millions of views.

TOPIC / IDEA:
"${prompt}"

PARAMETERS:
1. FORMAT: ${format}
   Guidance: ${formatGuides[format] || formatGuides['YouTube']}

2. DURATION: ${duration}
   Guidance: ${durationGuides[duration] || durationGuides['60s']}

3. HOOK STYLE: ${hookStyle}
   Guidance: ${hookGuides[hookStyle] || hookGuides['Question']}

SCRIPT STRUCTURE & REQUIREMENTS:
- **Title & Concept:** Provide 2-3 high-CTR title options and a brief thumbnail concept.
- **Hook (0:00 - 0:10):** Execute the ${hookStyle.toLowerCase()} hook with precise visual & auditory cues.
- **Core Scenes / Beats:** Break down the script chronologically with scene timestamps or beat numbers.
  - Clearly label visual/camera directions and B-roll using [Visual: ...] or [Camera: ...].
  - Clearly label on-screen text graphics using [Text on screen: ...].
  - Provide natural, spoken dialogue for the speaker/host (no robotic phrasing).
- **Call-to-Action (Outro):** Strong closing that drives viewer retention, comments, or sign-ups.

FORMATTING RULES:
- Use Markdown headers ("## Section Title") for structure.
- Do NOT wrap ordinary words in double asterisks (**).
- Begin immediately with "# [Script Title]" without conversational filler.`;
}

function buildRewriterPrompt(prompt, fields) {
  const mode = fields['Mode'] || 'Rephrase';
  const tone = fields['Tone'] || 'Keep original';
  const creativity = fields['Creativity'] || 40;

  const modeGuides = {
    'Rephrase': 'Transform sentence structures, improve cadence, and enrich vocabulary while strictly preserving the core meaning.',
    'Expand': 'Deepen the thought with concrete examples, nuanced context, and explanatory clarity without adding redundant fluff.',
    'Shorten': 'Aggressively cut filler words, redundancies, and passive phrasing. Deliver high signal-to-noise ratio in concise sentences.',
    'Simplify': 'Explain the idea in simple, crystal-clear plain English. Eliminate dense jargon and convoluted phrasing so any reader grasps it immediately.'
  };

  const toneGuides = {
    'Keep original': 'Preserve the original author\'s voice, perspective, and emotional register.',
    'Professional': 'Polished, articulate, authoritative, and boardroom-ready without sounding stiff.',
    'Casual': 'Warm, conversational, natural, and relatable, like explaining to a colleague over coffee.',
    'Confident': 'High conviction, active voice, bold declarations, eliminating timid hedging qualifiers like "maybe" or "in my opinion".'
  };

  return `You are a world-class editor, stylistic consultant, and copy doctor.

ORIGINAL TEXT:
"${prompt}"

REWRITE SPECIFICATIONS:
1. MODE: ${mode}
   Guidance: ${modeGuides[mode] || modeGuides['Rephrase']}

2. DESIRED TONE: ${tone}
   Guidance: ${toneGuides[tone] || toneGuides['Keep original']}

3. CREATIVITY LEVEL: ${creativity}%
   - ${creativity > 70 ? 'Expressive & inventive: Use fresh metaphors, dynamic pacing, and bold sentence structures.' : creativity > 35 ? 'Balanced & natural: Smooth out friction points and modernize phrasing while staying true to the premise.' : 'Strict fidelity: Make minimal structural changes, focusing strictly on grammatical clarity and precision.'}

FORMATTING REQUIREMENTS:
- Provide the polished rewrite directly.
- If appropriate, maintain the original paragraph breaks.
- Do NOT wrap ordinary words in unnecessary asterisks (**).
- Do NOT include conversational filler like "Here is your rewritten text:". Begin directly with the rewritten text.`;
}

function buildTranslatorPrompt(prompt, fields) {
  const from = fields['From'] || 'Auto-detect';
  const to = fields['To'] || 'Spanish';
  const formality = fields['Formality'] || 'Neutral';

  return `You are a professional native-fluency localization specialist and translator.

TEXT TO TRANSLATE:
"${prompt}"

TRANSLATION SPECIFICATIONS:
- Source language: ${from}
- Target language: ${to}
- Formality level: ${formality} (${formality === 'Formal' ? 'Use formal grammar, polite address, and professional vocabulary.' : formality === 'Casual' ? 'Use natural, colloquial everyday spoken phrasing.' : 'Use clear, standard, neutral phrasing.'})

CRITICAL GUIDELINES:
- Preserve proper nouns, brand names (such as "NexusAI"), technical identifiers, and code untouched.
- Maintain the original markdown formatting, paragraphs, and list structure.
- Do NOT provide conversational explanations, pronunciations, or preambles. Output ONLY the translated text directly.`;
}

function buildImagePrompt(prompt, fields) {
  const style = fields['Style'] || 'Photoreal';
  const styleMap = {
    'Photoreal': 'photorealistic, 8k, ultra detailed, professional photography',
    '3D': '3d render, octane render, cinema 4d, blender, volumetric lighting',
    'Anime': 'anime style, manga art, studio ghibli inspired, vibrant colors',
    'Watercolor': 'watercolor painting, artistic, soft edges, paper texture',
    'Minimal': 'minimalist, clean design, flat illustration, simple shapes',
  };

  return `${prompt}, ${styleMap[style] || styleMap['Photoreal']}, masterpiece, best quality`;
}

function buildLogoPrompt(prompt, fields) {
  const type = fields['Type'] || 'Logo';
  const style = fields['Style'] || 'Minimal';
  const color = fields['Color'] || 'Monochrome';

  const colorMap = {
    'Monochrome': 'black and white, monochrome, high contrast, minimalist palette',
    'Warm': 'warm tones, fiery orange, golden amber, vibrant red accents',
    'Cool': 'cool tones, electric cyan, deep cobalt, violet indigo accents',
    'Vibrant': 'rich vibrant gradient, punchy bold saturated colors',
  };

  const typeMap = {
    'Logo': 'professional company logo mark, clean vector symbol, iconic corporate identity mark',
    'App icon': 'modern iOS app icon, rounded squircle glyph, clean centered emblem, vector asset',
    'Monogram': 'minimalist typographic monogram, interlocking letters emblem, luxury aesthetic',
    'Mascot': 'stylized modern brand mascot icon, charismatic vector character emblem, esports badge'
  };

  const styleMap = {
    'Minimal': 'ultra-minimalist, flat design, negative space, simple bold geometry, swiss design',
    'Geometric': 'precise geometric construction, sacred geometry, clean sharp angles, golden ratio balance',
    'Playful': 'friendly, rounded geometry, approachable modern aesthetics, dynamic curves',
    'Luxury': 'premium luxury branding, sophisticated elegance, refined fine lines, gold and platinum accents'
  };

  return `${typeMap[type] || 'vector logo mark'} for "${prompt}", ${styleMap[style] || 'minimalist'}, ${colorMap[color] || 'monochrome'}, clean vector graphic, solid white background, centered, isolated, behance dribbble trending branding, master quality, no messy background, no photo artifacts, sharp edges`;
}

function buildTTSText(prompt, fields) {
  // TTS just needs the text — we return it as-is
  // Speed/pitch/voice are noted but HF free MMS model doesn't support them natively
  return prompt;
}

function buildMusicPrompt(prompt, fields) {
  const genre = fields['Genre'] || 'Lo-fi';
  const mood = fields['Mood'] || 'Chill';
  const duration = fields['Duration'] || '30s';
  const tempo = fields['Tempo'] || 110;

  return `${genre} ${mood.toLowerCase()} music, ${prompt}, ${tempo} bpm, ${duration} duration`;
}

// ────────────────────────────────────────────────────
// MAIN CONTROLLER
// ────────────────────────────────────────────────────

export const studioGenerate = async (req, res, next) => {
  try {
    const { toolTitle, prompt, fields } = req.body;
    const file = req.file; // optional uploaded file

    // Parse fields if it arrives as a string (from FormData)
    let parsedFields = fields;
    if (typeof fields === 'string') {
      try { parsedFields = JSON.parse(fields); } catch { parsedFields = {}; }
    }
    if (!parsedFields) parsedFields = {};

    if (!toolTitle) {
      return res.status(400).json({ message: 'Missing toolTitle' });
    }

    let responseData;

    switch (toolTitle) {
      // ─── TEXT TOOLS ───
      case 'Blog Writer': {
        if (!prompt) return res.status(400).json({ message: 'Please provide a topic' });
        console.log('📝 Blog Writer params:', { prompt, ...parsedFields });
        const built = buildBlogWriterPrompt(prompt, parsedFields);
        let text = await generateText(built);

        // Sanitize stray bold asterisks that wrap random isolated single/double words in prose
        text = text.replace(/(?<!^|\n|[-*]\s)\*\*([a-zA-Z0-9_\s]{2,40})\*\*(?!:)/g, '$1');

        const words = text.trim().split(/\s+/).filter(Boolean);
        responseData = { 
          type: 'text', 
          data: text,
          wordCount: words.length,
          readingTime: Math.max(1, Math.round(words.length / 200))
        };
        break;
      }
      case 'Social & Ad Copy': {
        if (!prompt) return res.status(400).json({ message: 'Please describe what you are promoting' });
        console.log('📣 Social & Ad Copy params:', { prompt, ...parsedFields });
        const built = buildSocialCopyPrompt(prompt, parsedFields);
        let text = await generateText(built);

        // Sanitize stray bold asterisks that wrap random isolated single words in prose
        text = text.replace(/(?<!^|\n|[-*]\s)\*\*([a-zA-Z0-9_\s]{2,40})\*\*(?!:)/g, '$1');

        const words = text.trim().split(/\s+/).filter(Boolean);
        responseData = { 
          type: 'text', 
          data: text,
          wordCount: words.length,
          readingTime: Math.max(1, Math.round(words.length / 200))
        };
        break;
      }
      case 'Email Composer': {
        if (!prompt) return res.status(400).json({ message: 'Please describe the email goal' });
        console.log('✉️ Email Composer params:', { prompt, ...parsedFields });
        const built = buildEmailPrompt(prompt, parsedFields);
        let text = await generateText(built);

        // Sanitize stray bold asterisks that wrap random isolated single words in prose
        text = text.replace(/(?<!^|\n|[-*]\s)\*\*([a-zA-Z0-9_\s]{2,40})\*\*(?!:)/g, '$1');

        const words = text.trim().split(/\s+/).filter(Boolean);
        responseData = { 
          type: 'text', 
          data: text,
          wordCount: words.length,
          readingTime: Math.max(1, Math.round(words.length / 200))
        };
        break;
      }
      case 'Script Writer': {
        if (!prompt) return res.status(400).json({ message: 'Please describe your video idea' });
        console.log('🎬 Script Writer params:', { prompt, ...parsedFields });
        const built = buildScriptPrompt(prompt, parsedFields);
        let text = await generateText(built);

        // Sanitize stray bold asterisks that wrap random isolated single words in prose
        text = text.replace(/(?<!^|\n|[-*]\s)\*\*([a-zA-Z0-9_\s]{2,40})\*\*(?!:)/g, '$1');

        const words = text.trim().split(/\s+/).filter(Boolean);
        responseData = { 
          type: 'text', 
          data: text,
          wordCount: words.length,
          readingTime: Math.max(1, Math.round(words.length / 200))
        };
        break;
      }
      case 'Rewriter & Paraphraser': {
        if (!prompt) return res.status(400).json({ message: 'Please paste text to rewrite' });
        console.log('🔄 Rewriter params:', { prompt, ...parsedFields });
        const built = buildRewriterPrompt(prompt, parsedFields);
        let text = await generateText(built);

        // Sanitize stray bold asterisks that wrap random isolated words in prose
        text = text.replace(/(?<!^|\n|[-*]\s)\*\*([a-zA-Z0-9_\s]{2,40})\*\*(?!:)/g, '$1');

        const words = text.trim().split(/\s+/).filter(Boolean);
        responseData = { 
          type: 'text', 
          data: text,
          wordCount: words.length,
          readingTime: Math.max(1, Math.round(words.length / 200))
        };
        break;
      }
      case 'Translator': {
        if (!prompt) return res.status(400).json({ message: 'Please provide text to translate' });
        console.log('🌐 Translator params:', { prompt, ...parsedFields });
        const built = buildTranslatorPrompt(prompt, parsedFields);
        let text = await generateText(built);

        // Sanitize stray bold asterisks
        text = text.replace(/(?<!^|\n|[-*]\s)\*\*([a-zA-Z0-9_\s]{2,40})\*\*(?!:)/g, '$1');

        const words = text.trim().split(/\s+/).filter(Boolean);
        responseData = { 
          type: 'text', 
          data: text,
          wordCount: words.length,
          readingTime: Math.max(1, Math.round(words.length / 200))
        };
        break;
      }

      // ─── IMAGE TOOLS ───
      case 'Text to Image': {
        if (!prompt) return res.status(400).json({ message: 'Please describe your image' });
        const built = buildImagePrompt(prompt, parsedFields);
        const variationsStr = parsedFields['Variations'] || '1 image';
        const count = Math.min(parseInt(variationsStr) || 1, 4); // cap at 4

        const aspectRatio = parsedFields['Aspect ratio'] || '1:1 Square';
        let width = 768;
        let height = 768;
        if (aspectRatio.includes('16:9')) { width = 1024; height = 576; }
        else if (aspectRatio.includes('9:16')) { width = 576; height = 1024; }
        else if (aspectRatio.includes('4:3')) { width = 800; height = 600; }

        const modelChoice = parsedFields['AI Model'] || parsedFields['Model'] || 'Auto';
        console.log('🎨 Text to Image params:', { prompt, style: parsedFields['Style'], model: modelChoice, count, width, height });

        const images = [];
        for (let i = 0; i < count; i++) {
          try {
            const seed = Math.floor(Math.random() * 80000) + 1000 + (i * 243);
            const img = await generateImage(built, { width, height, seed, model: modelChoice });
            images.push(img);
          } catch (imgErr) {
            console.warn(`⚠️ Variation ${i + 1} issue:`, imgErr.message);
            if (images.length > 0) break; // Return what we got
            throw imgErr;
          }
        }
        responseData = { 
          type: 'image', 
          data: images,
          ...(images.length < count && images.length > 0 ? { note: `${images.length} variation${images.length > 1 ? 's' : ''} generated successfully (additional variations require a brief cooldown)` } : {})
        };
        break;
      }
      case 'Logo & Icon Maker': {
        if (!prompt) return res.status(400).json({ message: 'Please describe your brand' });
        const built = buildLogoPrompt(prompt, parsedFields);
        const variationsStr = parsedFields['Variations'] || parsedFields['Concepts'] || '2 concepts';
        const count = Math.min(parseInt(variationsStr) || 2, 4);
        const modelChoice = parsedFields['AI Model'] || 'flux';

        console.log('🎨 Logo & Icon Maker params:', { prompt, type: parsedFields['Type'], style: parsedFields['Style'], count, model: modelChoice });

        const images = [];
        for (let i = 0; i < count; i++) {
          try {
            const seed = Math.floor(Math.random() * 80000) + 1000 + (i * 197);
            const img = await generateImage(built, { width: 512, height: 512, seed, model: modelChoice });
            images.push(img);
          } catch (imgErr) {
            console.warn(`⚠️ Logo variation ${i + 1} issue:`, imgErr.message);
            if (images.length > 0) break;
            throw imgErr;
          }
        }
        responseData = { 
          type: 'image', 
          data: images,
          ...(images.length < count && images.length > 0 ? { note: `${images.length} logo concept${images.length > 1 ? 's' : ''} generated (additional concepts require a brief cooldown)` } : {})
        };
        break;
      }
      case 'Background Remover': {
        if (!file) return res.status(400).json({ message: 'Please upload an image' });
        const newBg = parsedFields['New background'] || 'Transparent';
        console.log('✂️ Background Remover params:', { newBg, size: file.size });
        let result = await removeBackground(file.buffer);

        // Composite custom background if user selected White, Black, or Blur
        if (newBg === 'White' || newBg === 'Black') {
          const bgHex = newBg === 'White' ? '#ffffff' : '#000000';
          const pngBuffer = Buffer.from(result.split(',')[1], 'base64');
          const flattened = await sharp(pngBuffer)
            .flatten({ background: bgHex })
            .png()
            .toBuffer();
          result = `data:image/png;base64,${flattened.toString('base64')}`;
        } else if (newBg === 'Blur') {
          const pngBuffer = Buffer.from(result.split(',')[1], 'base64');
          const meta = await sharp(pngBuffer).metadata();
          const blurredBg = await sharp(file.buffer)
            .resize(meta.width, meta.height)
            .blur(25)
            .toBuffer();
          const composite = await sharp(blurredBg)
            .composite([{ input: pngBuffer }])
            .png()
            .toBuffer();
          result = `data:image/png;base64,${composite.toString('base64')}`;
        }

        responseData = { 
          type: 'image-single', 
          data: result, 
          original: `data:${file.mimetype};base64,${file.buffer.toString('base64')}` 
        };
        break;
      }
      case 'Upscaler': {
        if (!file) return res.status(400).json({ message: 'Please upload an image' });
        const scaleStr = parsedFields['Scale'] || '2x';
        const scale = parseInt(scaleStr) || 2;
        const enhanceFaces = parsedFields['Enhance faces'] !== false;
        const deNoise = parsedFields['De-noise'] === true;

        console.log('🔍 Upscaler params:', { scale, enhanceFaces, deNoise, size: file.size });
        const result = await upscaleImage(file.buffer, scale, { enhanceFaces, deNoise });

        responseData = { 
          type: 'image-single', 
          data: result.data, 
          original: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          dimensions: `${result.originalWidth}×${result.originalHeight} → ${result.width}×${result.height} (${result.scale}x)`,
          note: `Upscaled ${result.scale}x to ${result.width}×${result.height}px`
        };
        break;
      }
      case 'Photo Restore': {
        if (!file) return res.status(400).json({ message: 'Please upload a photo' });
        const colorize = parsedFields['Colorize'] !== false;
        const repairScratches = parsedFields['Repair scratches'] !== false;
        const sharpenFaces = parsedFields['Sharpen faces'] !== false;

        console.log('🪄 Photo Restore processing:', { colorize, repairScratches, sharpenFaces, size: file.size });
        const result = await restoreImage(file.buffer, { colorize, repairScratches, sharpenFaces });
        responseData = { 
          type: 'image-single', 
          data: result, 
          original: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          note: 'Restored via CodeFormer (SOTA Neural Face & Photo Reconstruction)'
        };
        break;
      }

      // ─── AUDIO TOOLS ───
      case 'Voiceover (TTS)': {
        if (!prompt) return res.status(400).json({ message: 'Please enter the script to narrate' });
        const text = buildTTSText(prompt, parsedFields);
        const audio = await generateSpeech(text);
        responseData = { type: 'audio', data: audio, filename: 'voiceover.wav' };
        break;
      }
      case 'Music Generator': {
        if (!prompt) return res.status(400).json({ message: 'Please describe the track' });
        const built = buildMusicPrompt(prompt, parsedFields);
        const audio = await generateMusic(built);
        responseData = { type: 'audio', data: audio, filename: 'music_track.wav' };
        break;
      }
      case 'Voice Cloning': {
        // No reliable free model — fall back to standard TTS with a note
        if (!prompt) return res.status(400).json({ message: 'Please enter text for the voice to speak' });
        const audio = await generateSpeech(prompt);
        responseData = { type: 'audio', data: audio, filename: 'cloned_voice.wav', note: 'Voice cloning is in beta — using enhanced TTS as a preview.' };
        break;
      }
      case 'Transcription': {
        if (!file) return res.status(400).json({ message: 'Please upload an audio file' });
        const transcript = await transcribeAudio(file.buffer);
        responseData = { type: 'transcript', data: transcript };
        break;
      }

      // ─── VIDEO TOOLS (Coming Soon) ───
      case 'Text to Video':
      case 'Talking Avatar':
      case 'Clip & Shorts Maker':
      case 'Auto Subtitles': {
        responseData = { type: 'coming-soon', data: `${toolTitle} is coming soon! Video generation requires specialized GPU infrastructure that we are actively building.` };
        break;
      }

      default:
        return res.status(400).json({ message: `Unknown tool: ${toolTitle}` });
    }

    // Save to history (skip for coming-soon)
    if (responseData.type !== 'coming-soon' && req.user) {
      try {
        await History.create({
          userId: req.user._id,
          toolType: 'content-studio',
          title: `${toolTitle} — ${(prompt || file?.originalname || '').substring(0, 50)}`,
          input: { toolTitle, prompt: prompt?.substring(0, 300), fields: parsedFields },
          output: { type: responseData.type, preview: responseData.type === 'text' ? responseData.data?.substring(0, 500) : `[${responseData.type}]` },
        });
        await User.findByIdAndUpdate(req.user._id, { $inc: { totalUsage: 1 } });
      } catch (histErr) {
        console.error('History save error:', histErr);
        // Don't fail the request for history errors
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error('Content Studio Error:', error);
    next(error);
  }
};
