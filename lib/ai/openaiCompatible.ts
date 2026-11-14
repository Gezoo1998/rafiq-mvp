import { AIProvider, ChatMessage, Usage } from "./provider";

export class OpenAICompatibleProvider implements AIProvider {
  private baseUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(options?: { baseUrl?: string; apiKey?: string; defaultModel?: string }) {
    this.baseUrl = (options?.baseUrl || process.env.AI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
    this.apiKey = options?.apiKey || process.env.AI_API_KEY || "";
    this.defaultModel = options?.defaultModel || process.env.AI_MODEL_TUTOR || "llama-3.3-70b-versatile";
  }

  async *streamChat(args: {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const model = args.model || this.defaultModel;
    const url = `${this.baseUrl}/chat/completions`;

    let retries = 0;
    const maxRetries = 2;

    while (true) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: args.messages,
            temperature: args.temperature ?? 0.7,
            max_tokens: args.maxTokens ?? 1024,
            stream: true,
          }),
          signal: args.signal,
        });

        if (!response.ok) {
          if ((response.status === 429 || response.status >= 500) && retries < maxRetries) {
            retries++;
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries)));
            continue;
          }
          const errText = await response.text();
          throw new Error(`AI API error (${response.status}): ${errText}`);
        }

        if (!response.body) {
          throw new Error("No response body received from AI provider");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":") || trimmed === "data: [DONE]") continue;
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) {
                  yield delta;
                }
              } catch {
                // Ignore incomplete line parse errors
              }
            }
          }
        }
        return;
      } catch (err) {
        if (retries < maxRetries && !(err instanceof DOMException && err.name === "AbortError")) {
          retries++;
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries)));
          continue;
        }
        throw err;
      }
    }
  }

  async json<T>(args: {
    messages: ChatMessage[];
    model?: string;
    schemaName: string;
    maxTokens?: number;
  }): Promise<{ data: unknown; usage: Usage }> {
    const startTime = Date.now();
    const model = args.model || process.env.AI_MODEL_EVAL || this.defaultModel;
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: args.messages,
        temperature: 0.2,
        max_tokens: args.maxTokens ?? 1500,
        response_format: { type: "json_object" },
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI evaluation error (${response.status}): ${errText}`);
    }

    const jsonRes = await response.json();
    const rawContent = jsonRes.choices?.[0]?.message?.content || "{}";
    const parsedData = JSON.parse(rawContent);

    const usage: Usage = {
      tokensIn: jsonRes.usage?.prompt_tokens ?? 0,
      tokensOut: jsonRes.usage?.completion_tokens ?? 0,
      latencyMs,
      model,
    };

    return { data: parsedData, usage };
  }
}

