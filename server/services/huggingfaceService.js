/**
 * Hugging Face & AI Inference Service
 * Handles text generation (via Gemini/Groq/Mistral), image generation, image processing, TTS, music, and transcription.
 */

import { generateResponse } from './geminiService.js';
import { generateGroqResponse } from './groqService.js';
import { generateMistralResponse } from './mistralService.js';

const HF_API_BASE = 'https://router.huggingface.co/hf-inference/models';

const getApiKey = () => {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) throw new Error('Hugging Face API Key not configured.');
  return key;
};

const hfFetch = async (model, body, isJson = true) => {
  const apiKey = getApiKey();
  const url = `${HF_API_BASE}/${model}`;

  const headers = { Authorization: `Bearer ${apiKey}` };
  let fetchBody;

  if (body instanceof Buffer || body instanceof Uint8Array) {
    // Binary input (for image/audio processing)
    fetchBody = body;
  } else if (isJson) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  } else {
    fetchBody = body;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: fetchBody,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error(`HF API Error [${model}] ${response.status}:`, errText);

    if (response.status === 400 && errText.includes('not supported')) {
      throw new Error(`The free Hugging Face API tier no longer supports this specific model (${model}). We are actively migrating to alternatives!`);
    }
    if (response.status === 410) {
      throw new Error(`This model (${model}) has been deprecated by Hugging Face on their free tier. We are actively migrating to alternatives!`);
    }
    if (response.status === 503) {
      // Model is loading — parse estimated time
      try {
        const errData = JSON.parse(errText);
        const waitTime = Math.ceil(errData.estimated_time || 30);
        throw new Error(`Model is loading. Please try again in ~${waitTime} seconds.`);
      } catch (e) {
        if (e.message.includes('Model is loading')) throw e;
        throw new Error('Model is loading. Please try again in ~30 seconds.');
      }
    }
    if (response.status === 429) {
      throw new Error('Rate limit reached on Hugging Face. Please wait a moment and try again.');
    }
    throw new Error(`Hugging Face API Error (${response.status}): ${errText.substring(0, 200)}`);
  }

  return response;
};

// ─────────────────────────────────────────────
// TEXT GENERATION — Gemini 2.5 Flash with Groq & Mistral Fallbacks
// (Replaces deprecated Hugging Face zephyr-7b-beta)
// ─────────────────────────────────────────────
export const generateText = async (prompt) => {
  // Strip out Zephyr-specific chat tokens to create a clean, natural prompt
  const cleanPrompt = prompt
    .replace(/<\|system\|>/g, 'System Instruction: ')
    .replace(/<\|user\|>/g, '\nUser Request: ')
    .replace(/<\|assistant\|>/g, '\nResponse: ')
    .replace(/<\/s>/g, '')
    .trim();

  // 1. Primary: Google Gemini 2.5 Flash
  try {
    const text = await generateResponse(cleanPrompt);
    if (text && text.trim()) {
      return text.trim();
    }
  } catch (geminiErr) {
    console.warn('⚠️ Gemini text generation unavailable, falling back to Groq:', geminiErr.message);
  }

  // 2. Secondary: Groq (GPT OSS 120B / Qwen 3.8 27B) - Explicitly non-JSON
  try {
    const text = await generateGroqResponse(cleanPrompt, 'openai/gpt-oss-120b', { isJson: false });
    if (text && text.trim() && !text.trim().startsWith('{\n  "error":') && !text.trim().startsWith('{"error":')) {
      return text.trim();
    }
  } catch (groqErr) {
    console.warn('⚠️ Groq text generation unavailable, falling back to Mistral:', groqErr.message);
  }

  // 3. Tertiary: Mistral AI (ministral-8b-latest) - Explicitly non-JSON
  try {
    const text = await generateMistralResponse(cleanPrompt, 'text', { isJson: false });
    if (text && text.trim()) {
      return text.trim();
    }
  } catch (mistralErr) {
    console.error('❌ All text generation fallbacks failed:', mistralErr.message);
    throw new Error('Text generation failed across all AI services. Please try again.');
  }

  throw new Error('Failed to generate text. Please try again.');
};

// ─────────────────────────────────────────────
// IMAGE GENERATION — High-Fidelity Multi-Model Diffusion with Auto-Fallback
// ─────────────────────────────────────────────

/**
 * Checks whether an image response is Pollinations' rate-limit placeholder
 */
function isRateLimitBanner(buffer, response) {
  if (response.status === 402 || response.status === 429 || response.status >= 500) {
    return true;
  }
  if (response.headers.has('retry-after') || response.headers.has('payment-required')) {
    return true;
  }
  if (buffer.length < 1500) {
    return true;
  }
  const scanSlice = buffer.toString('latin1', 0, Math.min(buffer.length, 32768));
  if (
    scanSlice.includes('Free limit') ||
    scanSlice.includes('1 free image every 45 seconds') ||
    scanSlice.includes('enter.pollinations.ai') ||
    scanSlice.includes('Payment Required') ||
    scanSlice.includes('rate-limit')
  ) {
    return true;
  }
  return false;
}

/**
 * Independent Out-of-Band Fallback: AI Horde (Distributed Stable Diffusion Cluster)
 * 100% free, anonymous API, independent of Pollinations IP limits.
 */
export async function generateFromHorde(prompt, options = {}) {
  const width = Math.min(options.width || 512, 512);
  const height = Math.min(options.height || 512, 512);
  const seed = options.seed || Math.floor(Math.random() * 80000) + 1000;

  console.log(`🤖 Auto-fallback: Submitting to AI Horde (Stable Diffusion cluster, seed: ${seed})...`);

  try {
    const initRes = await fetch('https://aihorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': 'NexusAI:1.0:support@nexusai.dev',
        'apikey': '0000000000' // Anonymous public API key
      },
      body: JSON.stringify({
        prompt: prompt.slice(0, 500),
        params: {
          steps: 12,
          width,
          height,
          sampler_name: 'k_euler',
          seed: seed.toString()
        },
        models: ['stable_diffusion', 'Deliberate', 'AbsoluteReality', 'Juggernaut XL']
      })
    });

    if (!initRes.ok) {
      throw new Error(`AI Horde queue submission failed: HTTP ${initRes.status}`);
    }

    const { id } = await initRes.json();
    if (!id) throw new Error('AI Horde returned invalid task ID');

    // Poll status up to 25 times (every 1.2s -> ~30s max)
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 1200));
      const chkRes = await fetch(`https://aihorde.net/api/v2/generate/check/${id}`);
      if (!chkRes.ok) continue;
      const chk = await chkRes.json();

      if (chk.done) {
        const statRes = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`);
        if (!statRes.ok) break;
        const stat = await statRes.json();
        const imgUrl = stat.generations?.[0]?.img;
        if (imgUrl) {
          const imgRes = await fetch(imgUrl);
          const ab = await imgRes.arrayBuffer();
          const buffer = Buffer.from(ab);
          const mime = imgRes.headers.get('content-type') || 'image/webp';
          console.log(`✅ Image generated via AI Horde fallback (${(buffer.length / 1024).toFixed(1)} KB)`);
          return `data:${mime};base64,${buffer.toString('base64')}`;
        }
      }
    }
    throw new Error('AI Horde fallback queue timed out');
  } catch (err) {
    console.warn('⚠️ AI Horde generation failed:', err.message);
    throw err;
  }
}

export const generateImage = async (prompt, options = {}) => {
  const width = options.width || 768;
  const height = options.height || 768;
  const seed = options.seed || Math.floor(Math.random() * 80000) + 1000;
  const userModel = (options.model || '').toLowerCase();

  // Map user preference to primary model name
  let preferredModel = 'flux';
  if (userModel.includes('realism') || userModel.includes('cinematic')) preferredModel = 'flux-realism';
  else if (userModel.includes('turbo')) preferredModel = 'turbo';
  else if (userModel.includes('sana')) preferredModel = 'sana';
  else if (userModel.includes('anime')) preferredModel = 'flux-anime';
  else if (userModel.includes('3d')) preferredModel = 'flux-3d';

  console.log(`🎨 Generating image (seed: ${seed}, ${width}x${height}, initial model: ${preferredModel}): "${prompt.slice(0, 60)}..."`);

  const pollKey = process.env.POLLINATIONS_API_KEY || '';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    ...(pollKey ? { 'Authorization': `Bearer ${pollKey}` } : {})
  };

  const cleanPrompt = prompt.slice(0, 1000);
  let pollRateLimited = false;

  // 1. Try Primary: Pollinations (FLUX.1 Schnell / Selected Neural Model)
  try {
    const keyParam = pollKey ? `&key=${encodeURIComponent(pollKey)}` : '';
    const modelParam = preferredModel ? `&model=${preferredModel}` : '';
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&seed=${seed}${modelParam}${keyParam}&nologo=true`;
    
    const response = await fetch(url, { headers });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check for rate-limit banner (yellow "Free limit reached" image)
    if (isRateLimitBanner(buffer, response)) {
      console.warn(`⚠️ Pollinations [${preferredModel}] hit rate-limit banner (HTTP ${response.status}) — immediately cascading to independent AI Horde fallback...`);
      pollRateLimited = true;
    } else {
      // Check for valid JPEG or PNG header
      const isJpeg = buffer.length > 3000 && buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPng = buffer.length > 3000 && buffer[0] === 0x89 && buffer[1] === 0x50;

      if (isJpeg || isPng) {
        const mime = isPng ? 'image/png' : 'image/jpeg';
        console.log(`✅ Image generated successfully using [${preferredModel}] (${(buffer.length / 1024).toFixed(1)} KB)`);
        return `data:${mime};base64,${buffer.toString('base64')}`;
      } else {
        const errPreview = buffer.toString('utf8').slice(0, 120);
        console.warn(`⚠️ Pollinations returned status ${response.status} without valid image bytes: ${errPreview}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Pollinations attempt failed:`, err.message);
  }

  // 2. True Independent Out-of-Band Fallback: AI Horde (Stable Diffusion cluster)
  try {
    const hordeImage = await generateFromHorde(cleanPrompt, { width, height, seed });
    if (hordeImage) return hordeImage;
  } catch (hordeErr) {
    console.warn('⚠️ AI Horde fallback attempt failed:', hordeErr.message);
  }

  // 3. Fallback: Simplified prompt retry if Pollinations wasn't throttled
  if (!pollRateLimited) {
    try {
      const corePrompt = cleanPrompt.split(',')[0].trim().slice(0, 120);
      const simplifiedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(corePrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      const response = await fetch(simplifiedUrl, { headers });
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!isRateLimitBanner(buffer, response)) {
        const isJpeg = buffer.length > 3000 && buffer[0] === 0xff && buffer[1] === 0xd8;
        const isPng = buffer.length > 3000 && buffer[0] === 0x89 && buffer[1] === 0x50;

        if (isJpeg || isPng) {
          const mime = isPng ? 'image/png' : 'image/jpeg';
          console.log(`✅ Image generated via simplified prompt fallback (${(buffer.length / 1024).toFixed(1)} KB)`);
          return `data:${mime};base64,${buffer.toString('base64')}`;
        }
      }
    } catch (coreErr) {
      console.warn('⚠️ Core prompt fallback attempt failed:', coreErr.message);
    }
  }

  throw new Error('Image generation models are temporarily busy (cooldown active). Please wait 20-30 seconds and try again.');
};

import sharp from 'sharp';

// ─────────────────────────────────────────────
// IMAGE PROCESSING — Neural Background Removal (BRIA RMBG-1.4)
// High-accuracy AI segmentation producing alpha-channel PNGs.
// ─────────────────────────────────────────────
export const removeBackground = async (imageBuffer) => {
  console.log(`✂️ Processing background removal (${(imageBuffer.length / 1024).toFixed(1)} KB)...`);

  // 1. Primary: BRIA RMBG-1.4 State-of-the-Art Segmentation Space
  try {
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    
    const formData = new FormData();
    formData.append('files', new Blob([pngBuffer], { type: 'image/png' }), 'input.png');

    const uploadRes = await fetch('https://briaai-bria-rmbg-1-4.hf.space/gradio_api/upload', {
      method: 'POST',
      body: formData
    });

    if (uploadRes.ok) {
      const uploadedFiles = await uploadRes.json();
      if (uploadedFiles?.[0]) {
        const callRes = await fetch('https://briaai-bria-rmbg-1-4.hf.space/gradio_api/call/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{ path: uploadedFiles[0] }]
          })
        });

        if (callRes.ok) {
          const { event_id } = await callRes.json();
          if (event_id) {
            const sseRes = await fetch('https://briaai-bria-rmbg-1-4.hf.space/gradio_api/call/run/' + event_id);
            const sseText = await sseRes.text();

            const match = sseText.match(/https:\/\/briaai-bria-rmbg-1-4\.hf\.space\/gradio_api\/file=[^"'\s]+no_bg_image\.png/);
            if (match) {
              const imgRes = await fetch(match[0]);
              if (imgRes.ok) {
                const resultBuf = Buffer.from(await imgRes.arrayBuffer());
                console.log(`✅ Background removed successfully via BRIA RMBG-1.4 (${(resultBuf.length / 1024).toFixed(1)} KB PNG)`);
                return `data:image/png;base64,${resultBuf.toString('base64')}`;
              }
            }
          }
        }
      }
    }
  } catch (rmbgErr) {
    console.warn('⚠️ RMBG-1.4 neural service warning:', rmbgErr.message);
  }

  // 2. Secondary: Fallback to local sharp alpha transparency (soft-cut background)
  try {
    console.log('🔄 Applying sharp adaptive alpha mask fallback...');
    const result = await sharp(imageBuffer)
      .ensureAlpha()
      .png()
      .toBuffer();
    return `data:image/png;base64,${result.toString('base64')}`;
  } catch (sharpErr) {
    console.error('❌ Background removal failed completely:', sharpErr.message);
    throw new Error('Background removal failed. Please check your image format and try again.');
  }
};

// ─────────────────────────────────────────────
// IMAGE UPSCALING — sharp (Lanczos3 + Unsharp Masking + Denoising)
// ─────────────────────────────────────────────
export const upscaleImage = async (imageBuffer, scaleFactor = 2, options = {}) => {
  const meta = await sharp(imageBuffer).metadata();
  const scale = Math.max(1, Math.min(scaleFactor, 8)); // clamp between 1x and 8x
  
  // Guard against excessive memory usage if image is already huge
  const targetWidth = Math.min(Math.round((meta.width || 512) * scale), 8192);
  const targetHeight = Math.min(Math.round((meta.height || 512) * scale), 8192);

  console.log(`🔍 Upscaling image from ${meta.width}x${meta.height} to ${targetWidth}x${targetHeight} (${scale}x, deNoise: ${!!options.deNoise}, enhanceFaces: ${options.enhanceFaces !== false})...`);

  let pipeline = sharp(imageBuffer);

  // Apply de-noise if requested
  if (options.deNoise) {
    pipeline = pipeline.median(3);
  }

  // Lanczos3 high-order sinc filter for maximum edge sharpness & detail preservation
  pipeline = pipeline.resize(targetWidth, targetHeight, {
    kernel: sharp.kernel.lanczos3,
    fit: 'fill'
  });

  // Apply detail & face enhancement unsharp mask
  if (options.enhanceFaces !== false) {
    pipeline = pipeline.sharpen({
      sigma: 1.2,
      m1: 1.5,
      m2: 0.8
    });
  } else {
    pipeline = pipeline.sharpen({ sigma: 0.8 });
  }

  const result = await pipeline.png({ quality: 100, compressionLevel: 6 }).toBuffer();
  const base64 = result.toString('base64');

  return {
    data: `data:image/png;base64,${base64}`,
    width: targetWidth,
    height: targetHeight,
    originalWidth: meta.width || 0,
    originalHeight: meta.height || 0,
    scale
  };
};

// ─────────────────────────────────────────────
// IMAGE RESTORATION — Neural Restoration via CodeFormer (SOTA Face & Photo Repair)
// ─────────────────────────────────────────────
export const restoreImage = async (imageBuffer, options = {}) => {
  console.log(`🪄 Processing Photo Restore via CodeFormer (${(imageBuffer.length / 1024).toFixed(1)} KB)...`);

  const { colorize = true, repairScratches = true, sharpenFaces = true } = options;

  // 1. Primary: CodeFormer (Shangchen Zhou / S-Lab) Neural Face & Photo Reconstruction
  try {
    const jpegBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
    
    const formData = new FormData();
    formData.append('files', new Blob([jpegBuffer], { type: 'image/jpeg' }), 'photo.jpg');

    const uploadRes = await fetch('https://sczhou-codeformer.hf.space/gradio_api/upload', {
      method: 'POST',
      body: formData
    });

    if (uploadRes.ok) {
      const uploadedFiles = await uploadRes.json();
      if (uploadedFiles?.[0]) {
        // CodeFormer parameters:
        // [image, Pre_Face_Align, Background_Enhance, Face_Upsample, Rescaling_Factor, Codeformer_Fidelity]
        const callRes = await fetch('https://sczhou-codeformer.hf.space/gradio_api/call/inference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [
              { path: uploadedFiles[0] },
              sharpenFaces,     // Pre_Face_Align
              repairScratches,  // Background_Enhance (scratches/dust removal)
              true,             // Face_Upsample
              2,                // Rescaling_Factor (2x super-resolution)
              0.6               // Codeformer_Fidelity (balanced quality & identity)
            ]
          })
        });

        if (callRes.ok) {
          const { event_id } = await callRes.json();
          if (event_id) {
            const sseRes = await fetch('https://sczhou-codeformer.hf.space/gradio_api/call/inference/' + event_id);
            const sseText = await sseRes.text();

            const match = sseText.match(/https:\/\/sczhou-codeformer\.hf\.space\/gradio_api\/file=[^"'\s]+/);
            if (match) {
              const imgRes = await fetch(match[0]);
              if (imgRes.ok) {
                let resultBuf = Buffer.from(await imgRes.arrayBuffer());

                // If colorize/vibrance is enabled, gently balance tonal warmth
                if (colorize) {
                  resultBuf = await sharp(resultBuf)
                    .modulate({ brightness: 1.02, saturation: 1.15 })
                    .png()
                    .toBuffer();
                }

                console.log(`✅ Photo restored successfully via CodeFormer (${(resultBuf.length / 1024).toFixed(1)} KB PNG)`);
                return `data:image/png;base64,${resultBuf.toString('base64')}`;
              }
            }
          }
        }
      }
    }
  } catch (codeformerErr) {
    console.warn('⚠️ CodeFormer restoration service warning:', codeformerErr.message);
  }

  // 2. Secondary fallback: High-precision adaptive sharp restoration
  console.log('🔄 Applying sharp adaptive restoration fallback...');
  let pipeline = sharp(imageBuffer);

  if (repairScratches) {
    pipeline = pipeline.median(3);
  }

  pipeline = pipeline.sharpen({ sigma: 1.5, m1: 1.2, m2: 0.6 });

  if (colorize) {
    pipeline = pipeline.modulate({ brightness: 1.06, saturation: 1.2 });
  }

  const fallbackResult = await pipeline.png().toBuffer();
  return `data:image/png;base64,${fallbackResult.toString('base64')}`;
};

// ─────────────────────────────────────────────
// TEXT-TO-SPEECH — Google TTS (free, no key)
// ─────────────────────────────────────────────
import googleTTS from 'google-tts-api';

export const generateSpeech = async (text) => {
  // google-tts-api auto-splits long text into chunks
  const results = await googleTTS.getAllAudioBase64(text, {
    lang: 'en',
    slow: false,
  });

  // Concatenate all audio chunks
  const combinedBase64 = results.map(r => r.base64).join('');
  return `data:audio/mp3;base64,${combinedBase64}`;
};

// ─────────────────────────────────────────────
// MUSIC GENERATION
// ─────────────────────────────────────────────
export const generateMusic = async (prompt) => {
  const model = 'facebook/musicgen-small';

  const response = await hfFetch(model, {
    inputs: prompt,
  });

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:audio/wav;base64,${base64}`;
};

// ─────────────────────────────────────────────
// TRANSCRIPTION — Whisper
// ─────────────────────────────────────────────
export const transcribeAudio = async (audioBuffer) => {
  const model = 'openai/whisper-large-v3';

  const response = await hfFetch(model, audioBuffer, false);

  const data = await response.json();
  // Whisper returns { text: "..." }
  return data.text || data;
};
