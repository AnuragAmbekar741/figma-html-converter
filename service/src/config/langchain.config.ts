export const langchainConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  modelName: process.env.OPENAI_MODEL || "gpt-4o-mini", // Use gpt-4o-mini for cost efficiency, or gpt-4o for better quality
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "4000"),
};
