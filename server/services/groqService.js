const GROQ_MODEL_ALIASES = {
  'qwen/qwen3-32b': 'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile': 'openai/gpt-oss-120b',
  'llama-3.1-70b-versatile': 'openai/gpt-oss-120b',
  'llama3-70b-8192': 'openai/gpt-oss-120b',
  'llama-3-70b-8192': 'openai/gpt-oss-120b',
};

export const generateGroqResponse = async (prompt, modelId, options = {}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key not configured.');
  }

  // Resolve model alias if needed
  const resolvedModel = GROQ_MODEL_ALIASES[modelId] || modelId;
  console.log(`🤖 Calling Groq API [Model: ${resolvedModel}]...`);

  // Allow caller to specify whether JSON output is required
  const isJson = options.isJson !== undefined ? options.isJson : (options.json !== false);
  const defaultSystemPrompt = isJson
    ? 'You are an expert AI assistant. Always output complete, strictly valid JSON matching the requested schema. Ensure all strings, arrays, and the root JSON object are properly closed with closing quotes and braces. Never omit the final closing "}".'
    : 'You are an elite, professional writer and AI assistant. Provide high-quality, comprehensive, well-structured content exactly adhering to user instructions.';

  const systemContent = options.systemPrompt || defaultSystemPrompt;

  try {
    const requestBody = {
      model: resolvedModel,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature !== undefined ? options.temperature : (isJson ? 0.2 : 0.7),
      max_tokens: options.max_tokens || 4096,
    };

    if (isJson && options.response_format) {
      requestBody.response_format = options.response_format;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error:', errorData);

      // If Groq rejected due to failed JSON validation but provided failed_generation text, salvage it!
      if (errorData.error?.failed_generation) {
        return errorData.error.failed_generation;
      }

      if (response.status === 404) {
        throw new Error(`Groq model "${resolvedModel}" not found. Available models: qwen/qwen3.8-27b, openai/gpt-oss-120b, openai/gpt-oss-20b.`);
      }
      if (response.status === 429) {
        throw new Error('Groq rate limit reached. Please try again or switch models.');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Groq authentication failed or access denied. Please verify your API key.');
      }
      throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Groq [Model: ${resolvedModel}] generated response successfully.`);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq Service Error:', error);
    throw error;
  }
};
