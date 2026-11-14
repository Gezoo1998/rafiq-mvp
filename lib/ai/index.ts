import { AIProvider } from "./provider";
import { MockProvider } from "./mock";
import { OpenAICompatibleProvider } from "./openaiCompatible";

export * from "./provider";
export * from "./mock";
export * from "./openaiCompatible";

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER?.toLowerCase() || "mock";

  if (providerType === "openai_compatible" && process.env.AI_API_KEY) {
    return new OpenAICompatibleProvider();
  }

  // Fallback to Mock provider
  return new MockProvider();
}
