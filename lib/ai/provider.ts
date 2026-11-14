export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Usage = {
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  model: string;
};

export interface AIProvider {
  /**
   * Streams text deltas for the tutor chat.
   */
  streamChat(args: {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
  }): AsyncIterable<string>;

  /**
   * Returns JSON validated by the caller with Zod (used for evaluation).
   */
  json<T>(args: {
    messages: ChatMessage[];
    model?: string;
    schemaName: string;
    maxTokens?: number;
  }): Promise<{ data: unknown; usage: Usage }>;
}
