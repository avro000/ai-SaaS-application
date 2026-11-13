export const generateMistralResponse = async (prompt, taskType = 'code', options = {}) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('Mistral API Key not configured.');
  }

  // Model selection based on task: codestral-latest for code, ministral-8b-latest for text/documents
  const model = taskType === 'code' ? 'codestral-latest' : 'ministral-8b-latest';
  console.log(`🤖 Calling Mistral AI API [Model: ${model}]...`);

  const isJson = options.isJson !== undefined ? options.isJson : (taskType !== 'text');

  try {
    const requestBody = {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature !== undefined ? options.temperature : 0.3,
    };

    if (isJson) {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Mistral API Error:', errorData);
      
      if (response.status === 429) {
        console.warn('⚠️ Mistral rate limit reached. Automatically falling back to Gemini...');
        const { generateResponse } = await import('./geminiService.js');
        return await generateResponse(prompt);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Mistral authentication failed or model access denied. Please verify your API key and tier.');
      }
      throw new Error(`Mistral API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Mistral AI [Model: ${model}] generated response successfully.`);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral Service Error:', error);
    throw error;
  }
};
