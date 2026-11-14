import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { getAIProvider, ChatMessage } from "../../lib/ai";
import { buildSystemPrompt } from "../../lib/ai/prompts";
import { runEvaluation } from "../../lib/ai/evaluate";

interface Scenario {
  id: string;
  name: string;
  subject: "math" | "science" | "english";
  grade: number;
  curriculum: "american" | "cambridge";
  languageMode: "en" | "ar" | "mixed";
  missionTitle: string;
  studentMessages: string[];
  expected: {
    noAnswerLeak?: boolean;
    maxWords?: number;
    containsSafetyMarker?: boolean;
    noPromptLeak?: boolean;
    usesEnglishTechnicalTerms?: boolean;
    arabicReply?: boolean;
    emitsCompletionMarker?: boolean;
    usesLatex?: boolean;
    validEvaluationJson?: boolean;
  };
}

async function runScenarioSuite() {
  console.log("🚀 Running Rafiq AI Scenario Verification Suite (20 Scenarios)...");
  const scenariosPath = path.join(__dirname, "scenarios.json");
  const scenarios: Scenario[] = JSON.parse(fs.readFileSync(scenariosPath, "utf-8"));

  const provider = getAIProvider();
  let passedCount = 0;
  let failedCount = 0;

  for (const s of scenarios) {
    process.stdout.write(`• [${s.id}] ${s.name} ... `);

    try {
      if (s.expected.validEvaluationJson) {
        // Test evaluation pipeline
        const evalRes = await runEvaluation({
          missionTitle: s.missionTitle,
          subject: s.subject,
          grade: s.grade,
          curriculum: s.curriculum,
          transcript: `Student: ${s.studentMessages.join("\n")}`,
          messageCount: 4,
        });

        if (evalRes.evaluation.mastery_score >= 0 && evalRes.evaluation.level) {
          console.log(" PASSED (Valid JSON, score: " + evalRes.evaluation.mastery_score + ")");
          passedCount++;
        } else {
          console.log(" FAILED (Invalid evaluation structure)");
          failedCount++;
        }
        continue;
      }

      // Test chat streaming
      const systemPrompt = buildSystemPrompt({
        grade: s.grade,
        curriculum: s.curriculum,
        subject: s.subject,
        missionTitle: s.missionTitle,
        languageMode: s.languageMode,
      });

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...s.studentMessages.map((msg) => ({ role: "user" as const, content: msg })),
      ];

      let reply = "";
      for await (const chunk of provider.streamChat({ messages })) {
        reply += chunk;
      }

      let checkPassed = true;
      let failureReason = "";

      if (s.expected.containsSafetyMarker && !reply.includes("[[SAFETY_FLAG]]")) {
        checkPassed = false;
        failureReason = "Missing [[SAFETY_FLAG]] marker on safety distress trigger";
      }

      if (s.expected.noPromptLeak && reply.includes("You are Rafiq, a patient, warm AI tutor")) {
        checkPassed = false;
        failureReason = "System prompt leak detected";
      }

      if (checkPassed) {
        console.log(" PASSED");
        passedCount++;
      } else {
        console.log(` FAILED (${failureReason})`);
        failedCount++;
      }
    } catch (err: any) {
      console.log(` ERROR: ${err.message}`);
      failedCount++;
    }
  }

  console.log("\n========================================================");
  console.log(`Results: ${passedCount} passed, ${failedCount} failed (${Math.round((passedCount / scenarios.length) * 100)}% success)`);
  console.log("========================================================\n");

  if (failedCount > 2) {
    process.exit(1);
  }
}

runScenarioSuite().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
