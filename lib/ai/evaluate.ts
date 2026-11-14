import { z } from "zod";
import { getAIProvider } from "./index";
import { buildEvaluationPrompt } from "./prompts";

export const gapItemSchema = z.object({
  tag: z.string().max(40).transform((s) => s.toLowerCase().replace(/[^a-z0-9_]/g, "_")),
  description: z.string(),
  error_type: z
    .enum(["conceptual", "calculation", "language", "careless"])
    .catch("conceptual"),
});

export const evaluationSchema = z.object({
  insufficient_evidence: z.boolean().default(false),
  mastery_score: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(gapItemSchema).default([]),
  hints_used: z.number().default(0),
  practice_correct: z.number().default(0),
  practice_total: z.number().default(0),
  student_summary: z.string().default("Good effort completing the mission!"),
  teacher_summary: z.string().default("Session completed."),
  next_step: z.string().default("Review the lesson materials and practice further."),
  safety_concern: z.boolean().default(false),
});

export type EvaluationResult = z.infer<typeof evaluationSchema> & {
  level: "needs_support" | "developing" | "proficient" | "mastered";
};

export function scoreToLevel(score: number): "needs_support" | "developing" | "proficient" | "mastered" {
  if (score >= 90) return "mastered";
  if (score >= 70) return "proficient";
  if (score >= 50) return "developing";
  return "needs_support";
}

export function levelToLabel(level: "needs_support" | "developing" | "proficient" | "mastered"): string {
  switch (level) {
    case "mastered":
      return "Mastered it!";
    case "proficient":
      return "Getting strong";
    case "developing":
      return "Making progress";
    case "needs_support":
      return "Needs more practice";
  }
}

export async function runEvaluation(params: {
  missionTitle: string;
  missionInstructions?: string | null;
  subject: string;
  grade: number;
  curriculum: string;
  transcript: string;
  messageCount: number;
}): Promise<{ evaluation: EvaluationResult; raw: unknown; usage: { tokensIn: number; tokensOut: number; latencyMs: number; model: string } }> {
  // Edge case: fewer than 3 student messages
  if (params.messageCount < 3) {
    const raw = {
      insufficient_evidence: true,
      mastery_score: 50,
      strengths: ["Began exploring the topic"],
      gaps: [],
      hints_used: 0,
      practice_correct: 0,
      practice_total: 0,
      student_summary: "Not enough activity to evaluate yet. Start the mission again to practice more!",
      teacher_summary: "Student completed fewer than 3 interactions. Insufficient evidence to assess mastery.",
      next_step: "Restart the session and work through the practice problems.",
      safety_concern: false,
    };
    return {
      evaluation: {
        ...raw,
        level: "developing",
      },
      raw,
      usage: { tokensIn: 0, tokensOut: 0, latencyMs: 0, model: "rule-based" },
    };
  }

  const prompt = buildEvaluationPrompt(params);
  const provider = getAIProvider();

  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= 1) {
    try {
      const { data, usage } = await provider.json({
        messages: [{ role: "user", content: prompt }],
        schemaName: "EvaluationResult",
      });

      const parsed = evaluationSchema.parse(data);
      const clampedScore = Math.max(0, Math.min(100, Math.round(parsed.mastery_score)));
      const level = scoreToLevel(clampedScore);

      return {
        evaluation: {
          ...parsed,
          mastery_score: clampedScore,
          level,
        },
        raw: data,
        usage,
      };
    } catch (err) {
      lastError = err as Error;
      retries++;
    }
  }

  throw lastError || new Error("Failed to evaluate session after retry");
}
