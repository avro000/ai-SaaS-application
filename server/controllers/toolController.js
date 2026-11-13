import { generateResponse, parseJsonResponse } from '../services/geminiService.js';
import { generateMistralResponse } from '../services/mistralService.js';
import { generateGroqResponse } from '../services/groqService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import {
  codeReviewPrompt,
  resumeOptimizePrompt,
  contentGeneratePrompt,
  summarizePrompt,
  sqlGeneratePrompt
} from '../utils/prompts.js';
import History from '../models/History.js';
import User from '../models/User.js';

const processToolRequest = async (req, res, next, { toolType, title, input, promptFn, aiModel = 'gemini' }) => {
  try {
    const prompt = promptFn();
    
    let rawResponse;
    if (aiModel === 'mistral') {
      const taskType = toolType === 'code-review' || toolType === 'sql-generate' ? 'code' : 'resume';
      rawResponse = await generateMistralResponse(prompt, taskType);
    } else if (aiModel.startsWith('qwen/') || aiModel.startsWith('openai/') || aiModel.startsWith('llama-')) {
      rawResponse = await generateGroqResponse(prompt, aiModel);
    } else {
      rawResponse = await generateResponse(prompt);
    }

    const output = parseJsonResponse(rawResponse);

    // Save to history
    await History.create({
      userId: req.user._id,
      toolType,
      title,
      input,
      output
    });

    // Increment usage
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalUsage: 1 } });

    res.json({ output });
  } catch (error) {
    next(error);
  }
};

export const codeReview = async (req, res, next) => {
  const { code, language, model } = req.body;
  if (!code) return res.status(400).json({ message: 'Please provide code to review' });

  await processToolRequest(req, res, next, {
    toolType: 'code-review',
    title: `${language || 'Code'} Review`,
    input: { code, language: language || 'javascript' },
    promptFn: () => codeReviewPrompt(code, language || 'javascript'),
    aiModel: model || 'gemini'
  });
};

export const resumeOptimize = async (req, res, next) => {
  try {
    const { jobDescription, model } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Please upload a resume file (PDF or DOCX)' });
    }
    if (!jobDescription) {
      return res.status(400).json({ message: 'Please provide a job description' });
    }

    // Extract text from uploaded file
    let resumeText = '';
    const ext = file.originalname.toLowerCase().split('.').pop();

    if (ext === 'pdf') {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(file.buffer);
      resumeText = pdfData.text;
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value;
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Please upload a PDF or DOCX file.' });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: 'Could not extract enough text from the file. Please ensure the resume is not an image-only PDF.' });
    }

    await processToolRequest(req, res, next, {
      toolType: 'resume-optimize',
      title: `Resume — ${file.originalname}`,
      input: { resume: resumeText.substring(0, 500), jobDescription: jobDescription.substring(0, 200), fileName: file.originalname },
      promptFn: () => resumeOptimizePrompt(resumeText, jobDescription),
      aiModel: model || 'gemini'
    });
  } catch (error) {
    if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      return res.status(400).json({ message: 'The PDF appears to be password-protected. Please upload an unprotected file.' });
    }
    next(error);
  }
};

export const contentGenerate = async (req, res, next) => {
  const { topic, tone, platform, audience, additionalNotes } = req.body;
  if (!topic || !platform) {
    return res.status(400).json({ message: 'Please provide at least a topic and platform' });
  }

  await processToolRequest(req, res, next, {
    toolType: 'content-generate',
    title: `${platform} — ${topic.substring(0, 50)}`,
    input: { topic, tone, platform, audience, additionalNotes },
    promptFn: () => contentGeneratePrompt(topic, tone || 'professional', platform, audience || 'general', additionalNotes)
  });
};

export const summarize = async (req, res, next) => {
  try {
    let { text, model, format, length } = req.body;
    const file = req.file;

    if (file) {
      const ext = file.originalname.toLowerCase().split('.').pop();
      if (ext === 'pdf') {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(file.buffer);
        text = pdfData.text;
      } else if (ext === 'docx' || ext === 'doc') {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else if (ext === 'txt') {
        text = file.buffer.toString('utf-8');
      }
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Please provide text or upload a document to summarize' });
    }

    const cleanText = text.trim();

    await processToolRequest(req, res, next, {
      toolType: 'summarize',
      title: `Summary — ${cleanText.substring(0, 50)}...`,
      input: { text: cleanText.substring(0, 500), format, length },
      promptFn: () => summarizePrompt(cleanText, { format, length }),
      aiModel: model || 'gemini'
    });
  } catch (error) {
    if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      return res.status(400).json({ message: 'The document appears to be password-protected. Please upload an unprotected file.' });
    }
    next(error);
  }
};

export const sqlGenerate = async (req, res, next) => {
  const { schema, query, dialect, model } = req.body;
  if (!query) return res.status(400).json({ message: 'Please describe what SQL query you need' });

  await processToolRequest(req, res, next, {
    toolType: 'sql-generate',
    title: `SQL — ${query.substring(0, 50)}`,
    input: { schema, query, dialect, model },
    promptFn: () => sqlGeneratePrompt(schema || 'Not provided', query, dialect),
    aiModel: model || 'gemini'
  });
};
