import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../lib/db/client";
import {
  schools,
  users,
  classes,
  classStudents,
  classTeachers,
  missions,
  missionTargets,
  assignments,
  sessions,
  messages,
  evaluations,
  aiUsage,
} from "../lib/db/schema";
import { generateAccessCode } from "../lib/auth/codes";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting Rafiq Demo Seed...");

  // 1. Create or Find School
  const schoolName = "Demo International School";
  let schoolRows = await db.select().from(schools).where(eq(schools.name, schoolName)).limit(1);

  let school = schoolRows[0];
  if (!school) {
    const inserted = await db
      .insert(schools)
      .values({
        name: schoolName,
        city: "Riyadh",
        defaultLanguageMode: "mixed",
        aiDailyTokenCap: 2000000,
        isActive: true,
      })
      .returning();
    school = inserted[0];
    console.log(` Created School: ${school.name} (${school.id})`);
  } else {
    console.log(` School exists: ${school.name}`);
  }

  // 2. Create System Admin
  const sysAdminCode = generateAccessCode("system_admin");
  const sysAdmin = await db
    .insert(users)
    .values({
      schoolId: null,
      role: "system_admin",
      fullName: "System Admin (Rafiq Staff)",
      codeHmac: sysAdminCode.codeHmac,
      codeLast4: sysAdminCode.codeLast4,
      status: "active",
    })
    .returning();

  // 3. Create School Admin
  const schoolAdminCode = generateAccessCode("school_admin");
  const schoolAdmin = await db
    .insert(users)
    .values({
      schoolId: school.id,
      role: "school_admin",
      fullName: "Dr. Mona Al-Ahmad (Principal)",
      externalId: "ADM-01",
      codeHmac: schoolAdminCode.codeHmac,
      codeLast4: schoolAdminCode.codeLast4,
      status: "active",
    })
    .returning();

  // 4. Create 3 Teachers
  const teacherDefs = [
    { name: "Ms. Huda Al-Ghamdi", subject: "math" as const },
    { name: "Mr. Nasser Al-Shehri", subject: "science" as const },
    { name: "Mrs. Sarah Jenkins", subject: "english" as const },
  ];

  const teachers = [];
  for (const t of teacherDefs) {
    const code = generateAccessCode("teacher");
    const inserted = await db
      .insert(users)
      .values({
        schoolId: school.id,
        role: "teacher",
        fullName: t.name,
        codeHmac: code.codeHmac,
        codeLast4: code.codeLast4,
        status: "active",
      })
      .returning();
    teachers.push({ ...inserted[0], code: code.plainCode, subject: t.subject });
  }

  // 5. Create 4 Classes (Grades 6-8, American & Cambridge)
  const classDefs = [
    { name: "6A", grade: 6, curriculum: "american" as const },
    { name: "6B", grade: 6, curriculum: "american" as const },
    { name: "7A", grade: 7, curriculum: "cambridge" as const },
    { name: "8A", grade: 8, curriculum: "american" as const },
  ];

  const createdClasses = [];
  for (const c of classDefs) {
    const inserted = await db
      .insert(classes)
      .values({
        schoolId: school.id,
        name: c.name,
        grade: c.grade,
        curriculum: c.curriculum,
        academicYear: "2026-2027",
      })
      .returning();
    createdClasses.push(inserted[0]);

    // Assign all 3 teachers to each class
    for (const t of teachers) {
      await db.insert(classTeachers).values({
        classId: inserted[0].id,
        teacherId: t.id,
        subject: t.subject,
      });
    }
  }

  // 6. Create 40 Students (10 per class)
  const arabicFirstNames = ["Omar", "Sara", "Khalid", "Fatima", "Zaid", "Noor", "Fahad", "Reem", "Hamza", "Lina"];
  const lastNames = ["Al-Harbi", "Al-Otaibi", "Al-Ghamdi", "Al-Zahrani", "Al-Shehri", "Al-Dossari", "Al-Qarni", "Al-Anazi"];

  const createdStudents = [];
  let studentIdx = 1;

  for (const cls of createdClasses) {
    for (let i = 0; i < 10; i++) {
      const fn = arabicFirstNames[i % arabicFirstNames.length];
      const ln = lastNames[(studentIdx + i) % lastNames.length];
      const fullName = `${fn} ${ln}`;
      const code = generateAccessCode("student");

      const inserted = await db
        .insert(users)
        .values({
          schoolId: school.id,
          role: "student",
          fullName,
          externalId: `STU-${1000 + studentIdx}`,
          grade: cls.grade,
          curriculum: cls.curriculum,
          preferredLanguage: "mixed",
          codeHmac: code.codeHmac,
          codeLast4: code.codeLast4,
          status: "active",
        })
        .returning();

      // Enroll in class
      await db.insert(classStudents).values({
        classId: cls.id,
        studentId: inserted[0].id,
      });

      createdStudents.push({
        ...inserted[0],
        code: code.plainCode,
        class: cls,
      });
      studentIdx++;
    }
  }

  // 7. Create 6 Published Missions
  const missionDefs = [
    {
      title: "Adding Fractions with Unlike Denominators",
      instructions: "Focus on finding common denominators using the least common multiple. Reduce answers to lowest terms.",
      subject: "math" as const,
      grade: 6,
      curriculum: "american" as const,
      teacherId: teachers[0].id,
      targetClass: createdClasses[0], // 6A
    },
    {
      title: "Simplifying Algebraic Expressions",
      instructions: "Combine like terms and apply the distributive property step by step.",
      subject: "math" as const,
      grade: 6,
      curriculum: "american" as const,
      teacherId: teachers[0].id,
      targetClass: createdClasses[1], // 6B
    },
    {
      title: "The Water Cycle and Weather Patterns",
      instructions: "Explain evaporation, condensation, precipitation, and transpiration.",
      subject: "science" as const,
      grade: 6,
      curriculum: "american" as const,
      teacherId: teachers[1].id,
      targetClass: createdClasses[0], // 6A
    },
    {
      title: "Photosynthesis and Plant Cells",
      instructions: "Cover chlorophyll, sunlight conversion to glucose, and oxygen release.",
      subject: "science" as const,
      grade: 7,
      curriculum: "cambridge" as const,
      teacherId: teachers[1].id,
      targetClass: createdClasses[2], // 7A
    },
    {
      title: "Past Tense and Irregular Verbs",
      instructions: "Practice identifying and using irregular past tense verbs in context.",
      subject: "english" as const,
      grade: 6,
      curriculum: "american" as const,
      teacherId: teachers[2].id,
      targetClass: createdClasses[0], // 6A
    },
    {
      title: "Descriptive Writing and Sensory Details",
      instructions: "Practice vivid adjectives and imagery appealing to sight, sound, and touch.",
      subject: "english" as const,
      grade: 8,
      curriculum: "american" as const,
      teacherId: teachers[2].id,
      targetClass: createdClasses[3], // 8A
    },
  ];

  const dueInFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  for (const mDef of missionDefs) {
    const insertedMission = await db
      .insert(missions)
      .values({
        schoolId: school.id,
        teacherId: mDef.teacherId,
        title: mDef.title,
        instructions: mDef.instructions,
        subject: mDef.subject,
        grade: mDef.grade,
        curriculum: mDef.curriculum,
        languageMode: "mixed",
        dueAt: dueInFuture,
        status: "published",
        publishedAt: new Date(),
      })
      .returning();

    const mission = insertedMission[0];

    // Target class
    await db.insert(missionTargets).values({
      missionId: mission.id,
      classId: mDef.targetClass.id,
    });

    // Create assignments for students in target class
    const classEnrolled = createdStudents.filter((s) => s.class.id === mDef.targetClass.id);

    for (let i = 0; i < classEnrolled.length; i++) {
      const student = classEnrolled[i];

      // Stagger statuses for rich demo reports:
      // First 5 completed, next 3 in_progress, next 2 not_started
      let assignStatus: "completed" | "in_progress" | "not_started" = "completed";
      if (i >= 8) assignStatus = "not_started";
      else if (i >= 5) assignStatus = "in_progress";

      const assignmentRes = await db
        .insert(assignments)
        .values({
          missionId: mission.id,
          studentId: student.id,
          schoolId: school.id,
          status: assignStatus,
          startedAt: assignStatus !== "not_started" ? new Date(Date.now() - 3600 * 1000) : null,
          completedAt: assignStatus === "completed" ? new Date() : null,
        })
        .returning();

      const assign = assignmentRes[0];

      if (assignStatus !== "not_started") {
        // Create session
        const sessionRes = await db
          .insert(sessions)
          .values({
            assignmentId: assign.id,
            schoolId: school.id,
            studentId: student.id,
            missionId: mission.id,
            status: assignStatus === "completed" ? "finished" : "active",
            languageMode: "mixed",
            messageCount: assignStatus === "completed" ? 8 : 4,
            safetyFlag: i === 4, // Student #5 gets a safety flag for demo
            startedAt: new Date(Date.now() - 3600 * 1000),
            finishedAt: assignStatus === "completed" ? new Date() : null,
          })
          .returning();

        const sess = sessionRes[0];

        // Seed realistic dialogue messages
        await db.insert(messages).values([
          {
            sessionId: sess.id,
            role: "assistant",
            content: `Welcome, ${student.fullName}! Today we'll work on ${mission.title}. What is $1/2 + 1/2$?`,
            tokensIn: 100,
            tokensOut: 35,
          },
          {
            sessionId: sess.id,
            role: "user",
            content: "It equals 1!",
            tokensIn: 8,
            tokensOut: 0,
          },
          {
            sessionId: sess.id,
            role: "assistant",
            content: "Spot on! Now how would you add $1/2 + 1/3$? Remember to find a common denominator.",
            tokensIn: 45,
            tokensOut: 28,
          },
          {
            sessionId: sess.id,
            role: "user",
            content: i === 0 ? "The common denominator is 6, so 3/6 + 2/6 = 5/6" : "Is it 2/5?",
            tokensIn: 18,
            tokensOut: 0,
          },
        ]);

        if (assignStatus === "completed") {
          // Add evaluation
          const scores = [94, 88, 76, 68, 55];
          const score = scores[i % scores.length];
          let level: "mastered" | "proficient" | "developing" | "needs_support" = "proficient";
          if (score >= 90) level = "mastered";
          else if (score >= 70) level = "proficient";
          else if (score >= 50) level = "developing";
          else level = "needs_support";

          await db.insert(evaluations).values({
            sessionId: sess.id,
            assignmentId: assign.id,
            status: "ok",
            masteryScore: score,
            level,
            strengths: ["Calculates common denominators accurately", "Shows persistence when solving checks"],
            gaps: [
              {
                tag: "simplifying_fractions",
                description: "Sometimes forgets to reduce the final result to lowest terms",
                error_type: "careless",
              },
            ],
            hintsUsed: score > 80 ? 1 : 3,
            practiceCorrect: score > 80 ? 4 : 2,
            practiceTotal: 4,
            studentSummary: "Great job completing your mission! You understand the key steps of finding denominators.",
            teacherSummary: "Student demonstrated good conceptual grasp. Solved problems with minimal hints.",
            nextStep: "Practice simplifying fractions to lowest terms.",
            safetyConcern: i === 4,
            model: "tutor-model",
          });

          // Log AI usage
          await db.insert(aiUsage).values({
            schoolId: school.id,
            userId: student.id,
            sessionId: sess.id,
            kind: "tutor",
            provider: "mock",
            model: "llama-3.3-70b",
            tokensIn: 650,
            tokensOut: 280,
            latencyMs: 140,
            status: "ok",
          });
        }
      }
    }
  }

  console.log("\n========================================================");
  console.log(" Rafiq Demo Seed Completed Successfully!");
  console.log("========================================================");
  console.log(`\n🔑 SYSTEM ADMIN:`);
  console.log(`   Name: System Admin`);
  console.log(`   Code: ${sysAdminCode.plainCode}`);

  console.log(`\n🔑 SCHOOL ADMIN:`);
  console.log(`   Name: ${schoolAdmin[0].fullName}`);
  console.log(`   School: ${school.name}`);
  console.log(`   Code: ${schoolAdminCode.plainCode}`);

  console.log(`\n🔑 TEACHERS (3):`);
  teachers.forEach((t) => {
    console.log(`   • ${t.fullName} (${t.subject.toUpperCase()}): ${t.code}`);
  });

  console.log(`\n🔑 SAMPLE STUDENTS (First 4):`);
  createdStudents.slice(0, 4).forEach((s) => {
    console.log(`   • ${s.fullName} (${s.class.name}): ${s.code}`);
  });
  console.log("========================================================\n");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

