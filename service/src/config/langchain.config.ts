export const langchainConfig = {
  // Provider selection: "openai" or "gemini" (default: "gemini")
  provider: process.env.LLM_PROVIDER || "gemini",

  // OpenAI configuration
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openaiTemperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  openaiMaxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "9000"),

  // Google Gemini configuration
  googleApiKey: process.env.GEMINI_API_KEY || "",
  geminiModelName: process.env.GEMINI_MODEL || "gemini-2.5-",
  geminiTemperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
  geminiMaxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "8192"),
};
