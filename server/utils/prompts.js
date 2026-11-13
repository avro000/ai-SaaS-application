export const codeReviewPrompt = (code, language) => `
You are a senior software engineer performing a code review. Analyze the following ${language} code carefully.

CODE:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence overall assessment>",
  "bugs": [
    { "line": "<line or section>", "severity": "critical|warning|info", "description": "<what's wrong>", "fix": "<how to fix>" }
  ],
  "suggestions": [
    { "category": "performance|readability|security|best-practice", "description": "<suggestion>", "priority": "high|medium|low" }
  ],
  "refactoredCode": "<improved version of the full code>"
}
\`\`\`
`;

export const resumeOptimizePrompt = (resume, jobDescription) => `
You are a world-class resume strategist, HR consultant, and ATS optimization expert. Perform an exhaustive, multi-lens analysis of this resume against the target job description.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Analyze across ALL of the following dimensions and respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "overallScore": <number 0-100, holistic quality score>,
  "atsScore": <number 0-100, ATS compatibility score>,
  "overallFeedback": "<4-5 sentence comprehensive assessment covering strengths, gaps, and strategic advice>",

  "strengths": [
    "<specific strength with evidence from resume, e.g. 'Strong quantification in engineering bullets — 4 of 6 include measurable outcomes'>"
  ],

  "keywords": [
    {
      "word": "<keyword or skill from the JD>",
      "status": "match|weak|missing",
      "strength": <number 0.0 to 1.0 indicating relevance/priority in the JD>,
      "suggestion": "<if weak or missing, how to add this to the resume>"
    }
  ],

  "bullets": [
    {
      "original": "<exact original bullet point from the resume>",
      "rewritten": "<improved version with action verbs, metrics, and impact>",
      "issues": ["<issue 1, e.g. 'Passive voice'>", "<issue 2, e.g. 'No metrics'>"],
      "scores": {
        "action": <number 0-100, action verb strength>,
        "quantified": <number 0-100, has numbers/metrics>,
        "impact": <number 0-100, shows business/team impact>
      }
    }
  ],

  "interviewQuestions": [
    {
      "question": "<exact question a recruiter would ask based on a weakness in this resume>",
      "targets": "<what resume weakness triggers this question>",
      "risk": "high|medium|low",
      "prepTip": "<brief advice on how to prepare an answer>"
    }
  ],

  "narrative": [
    {
      "year": "<year or year range>",
      "role": "<job title>",
      "coherence": <number 0.0 to 1.0, how well this fits the career story>,
      "note": "<brief assessment, e.g. 'Strong progression' or 'Lateral move — needs framing'>"
    }
  ],

  "improvements": [
    {
      "section": "<resume section name, e.g. 'Experience — TechCorp'>",
      "current": "<current text or issue>",
      "suggested": "<improved version>",
      "reason": "<why this change matters>"
    }
  ]
}
\`\`\`

IMPORTANT RULES:
- Extract ALL bullet points from the resume for the "bullets" array. If there are more than 8, pick the 8 most impactful/problematic ones.
- For "keywords", accurately extract 10-15 core skills and domain requirements from the JD. If the candidate has demonstrated equivalent or transferable experience (e.g., secure cloud pipelines, API authentication, data validation workflows), provide calibrated and fair evaluations.
- For "interviewQuestions", generate 4-6 realistic questions a recruiter would ask based on actual gaps or domain-specific needs (e.g., healthcare data regulations, enterprise audit standards).
- For "narrative", list each role/position chronologically with coherence scoring.
- STRICT REALISM: Never hallucinate fake metrics or insert placeholder text like "X%", "Y users", "Z requests", or "[Note: ...]". Ground every bullet in the candidate's actual stated projects and achievements. If a metric was not in the original bullet, focus on clear action verbs, tools, and qualitative impact.
- CLEAN FORMATTING: Do NOT insert markdown bold asterisks (**) or italic asterisks (*) inside JSON strings. Write clean, natural professional text ready to be used on a real resume.
- STRUCTURED IMPROVEMENTS: In "improvements", keep suggested revisions clean, readable, and properly formatted rather than combining categories into dense run-on text.
- All scores should be honest, calibrated, and grounded in the candidate's actual content.
`;

export const contentGeneratePrompt = (topic, tone, platform, audience, additionalNotes) => `
You are a professional content writer and social media strategist. Generate high-quality content based on these parameters:

Topic: ${topic}
Tone: ${tone}
Platform: ${platform}
Target Audience: ${audience}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "content": "<the generated content with proper formatting>",
  "headline": "<catchy headline/subject line>",
  "wordCount": <number>,
  "readingTime": "<X min read>",
  "hashtags": ["<relevant hashtag>"],
  "callToAction": "<suggested CTA>",
  "seoKeywords": ["<keyword>"]
}
\`\`\`
`;

export const summarizePrompt = (text, options = {}) => {
  const { format = 'executive', length = 'medium' } = options;
  return `
You are a world-class executive analyst and expert summarizer. Analyze the following text thoroughly and generate a high-impact summary.

FORMAT REQUESTED: ${format} (options: executive, bullet-points, key-insights, comprehensive)
LENGTH REQUESTED: ${length} (options: short, medium, detailed)

TEXT TO SUMMARIZE:
"""
${text}
"""

Respond ONLY with a valid JSON object matching this schema (do not wrap in markdown or backticks, just raw JSON):
{
  "summary": "<well-structured, high-clarity summary adhering to the requested format and length>",
  "keyPoints": [
    { "point": "<concise, impactful point>", "importance": "high|medium|low" }
  ],
  "actionItems": [
    { "action": "<practical, actionable takeaway or next step>", "priority": "high|medium|low" }
  ],
  "topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "sentiment": "<positive|negative|neutral|mixed>",
  "readingTimeOriginal": "<e.g. 5 min>",
  "readingTimeSummary": "<e.g. 45 sec>",
  "timeSavedPercent": 85,
  "wordCountOriginal": 500,
  "wordCountSummary": 75
}
`;
};

export const sqlGeneratePrompt = (schema, query, dialect) => `
You are a senior database architect and SQL performance optimization specialist. Generate a robust, production-grade SQL query based on the user's natural language request.

TARGET SQL DIALECT: ${dialect || 'PostgreSQL'}

DATABASE SCHEMA / CONTEXT:
${schema || 'No specific schema provided. Infer standard idiomatic table and column names based on the domain.'}

USER'S REQUEST (natural language):
${query}

REQUIREMENTS:
1. Generate syntactically flawless SQL specifically for the chosen dialect (${dialect || 'PostgreSQL'}).
2. Use standard SQL capitalization for keywords (SELECT, FROM, WHERE, GROUP BY, ORDER BY, JOIN, LEFT JOIN, ON, HAVING, LIMIT, etc.).
3. Format the SQL with clean indentation and line breaks for maximum readability.
4. If a schema was provided, strictly use the table names, column names, and data types from it.
5. In "optimization", include concrete index recommendations (e.g. \`CREATE INDEX idx_... ON ...\`) and performance considerations (sargability, avoiding Cartesian joins, partition pruning).
6. In "warnings", highlight NULL handling, edge cases, division-by-zero risks, or dialect-specific caveats.
7. In "relatedQueries", provide 2-3 helpful companion queries (e.g., an index creation DDL, an aggregation or count verification query, or a CTE variant).

Respond ONLY with valid JSON in this exact structure:
\`\`\`json
{
  "query": "<properly formatted SQL query>",
  "dialect": "${dialect || 'PostgreSQL'}",
  "complexity": "Simple|Moderate|Advanced",
  "tablesUsed": ["<table1>", "<table2>"],
  "explanation": "<step-by-step explanation of what each part of the query does>",
  "optimization": "<performance tips, index recommendations, and query cost notes>",
  "warnings": [
    "<potential edge case, NULL trap, or dialect caution>"
  ],
  "relatedQueries": [
    {
      "title": "<short descriptive title>",
      "description": "<what this companion query does>",
      "query": "<SQL query>"
    }
  ]
}
\`\`\`
Do not include any introductory or concluding text outside the JSON markdown block.
`;
