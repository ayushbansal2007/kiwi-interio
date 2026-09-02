const modelConfig = {
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  fallbackModels: [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ],
  temperature: 0.15,
  maxTokens: 4096,
  maxPromptLength: 16000,
  maxHistoryMessages: 24,
};

module.exports = modelConfig;
