import { ChatOpenAI } from "@langchain/openai";
import { langchainConfig } from "../config/langchain.config";

export class LangChainService {
  private llm: ChatOpenAI;

  constructor() {
    if (!langchainConfig.openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.llm = new ChatOpenAI({
      modelName: langchainConfig.modelName,
      temperature: langchainConfig.temperature,
      maxTokens: langchainConfig.maxTokens,
      openAIApiKey: langchainConfig.openaiApiKey,
    });
  }

  getLLM(): ChatOpenAI {
    return this.llm;
  }

  async testConnection(): Promise<string> {
    try {
      const response = await this.llm.invoke(
        "Say 'Hello, LangChain is working!' in one sentence."
      );
      return response.content as string;
    } catch (error) {
      console.error("LangChain connection test failed:", error);
      throw error;
    }
  }
}
