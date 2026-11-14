import { AIProvider, ChatMessage, Usage } from "./provider";

export class MockProvider implements AIProvider {
  async *streamChat(args: {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const userMessages = args.messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || "";

    // Check for safety simulation in testing
    if (lastUserMessage.includes("harm") || lastUserMessage.includes("hurt") || lastUserMessage.includes("unsafe")) {
      const safetyReply =
        "I hear you, and your safety is the most important thing. Please talk to a trusted adult, parent, or your teacher today—they are there to support you.\n\n[[SAFETY_FLAG]]\n\nWhenever you feel ready, we can return to our lesson.";
      for (const word of safetyReply.split(" ")) {
        if (args.signal?.aborted) return;
        yield word + " ";
        await new Promise((r) => setTimeout(r, 25));
      }
      return;
    }

    let response = "";

    if (userMessages.length <= 1) {
      response =
        "Welcome! I am Rafiq, your study companion. Today we will explore this topic step by step. First, quick question to see what you already know: what is $1/2 + 1/2$? Can you tell me your answer?";
    } else if (lastUserMessage.includes("stuck") || lastUserMessage.includes("help") || lastUserMessage.includes("hint")) {
      response =
        "No problem at all, let's take it one step at a time! Hint: Remember that to add fractions like $1/2$ and $1/3$, we first need a common denominator. What is a number that both $2$ and $3$ divide into?";
    } else if (userMessages.length === 2) {
      response =
        "Excellent thinking! That's correct. Now let's try something a bit more interesting: how would you add $1/2 + 1/3$? Think about finding a common denominator for $2$ and $3$. What do you get?";
    } else if (userMessages.length === 3) {
      response =
        "Spot on! With denominator 6, $1/2 = 3/6$ and $1/3 = 2/6$, so $3/6 + 2/6 = 5/6$. You're really getting the hang of this! Let's do one more practice: what is $2/5 + 1/10$?";
    } else if (userMessages.length === 4) {
      response =
        "Brilliant effort! $2/5$ becomes $4/10$, so $4/10 + 1/10 = 5/10$, which simplifies to $1/2$. You've mastered the main steps of finding common denominators and adding fractions!\n\n[[SESSION_COMPLETE]]";
    } else {
      response =
        "Great work working through these problems! You've shown solid understanding and persistence.\n\n[[SESSION_COMPLETE]]";
    }

    // Stream word by word with delay
    const words = response.split(" ");
    for (const word of words) {
      if (args.signal?.aborted) return;
      yield word + " ";
      await new Promise((r) => setTimeout(r, 20));
    }
  }

  async json<T>(args: {
    messages: ChatMessage[];
    model?: string;
    schemaName: string;
    maxTokens?: number;
  }): Promise<{ data: unknown; usage: Usage }> {
    const userMessages = args.messages.filter((m) => m.role === "user");
    const count = userMessages.length;

    // Realistic canned evaluation data
    const evalData = {
      insufficient_evidence: count < 2,
      mastery_score: Math.min(92, Math.max(65, 70 + count * 5)),
      strengths: [
        "Understands common denominators quickly",
        "Demonstrates persistence when solving multi-step problems",
      ],
      gaps: [
        {
          tag: "simplifying_fractions",
          description: "Occasionally forgets to reduce the final fraction to lowest terms",
          error_type: "careless" as const,
        },
      ],
      hints_used: 1,
      practice_correct: Math.max(1, count - 1),
      practice_total: Math.max(2, count),
      student_summary:
        "You did an amazing job learning how to find common denominators and add fractions! You solved practice problems with great focus.",
      teacher_summary:
        "Student demonstrated solid grasp of finding common denominators. Solved problems with minimal hints. Suggested reinforcement on simplifying final answers.",
      next_step: "Practice simplifying fractions to lowest terms after completing addition.",
      safety_concern: false,
    };

    return {
      data: evalData,
      usage: {
        tokensIn: 450,
        tokensOut: 210,
        latencyMs: 120,
        model: "mock-eval-model",
      },
    };
  }
}

