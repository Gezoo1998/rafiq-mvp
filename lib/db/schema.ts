import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  bigserial,
  bigint,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Enums as specified in Section 8 of the PRD
export const roleEnum = pgEnum("role", [
  "student",
  "teacher",
  "school_admin",
  "system_admin",
]);

export const subjectEnum = pgEnum("subject", ["math", "science", "english"]);

export const curriculumEnum = pgEnum("curriculum", ["american", "cambridge"]);

export const languageModeEnum = pgEnum("language_mode", ["en", "ar", "mixed"]);

export const missionStatusEnum = pgEnum("mission_status", [
  "draft",
  "published",
  "closed",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "not_started",
  "in_progress",
  "completed",
  "evaluation_failed",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "finished",
  "archived",
]);

export const levelEnum = pgEnum("level", [
  "needs_support",
  "developing",
  "proficient",
  "mastered",
]);

// 1. schools
export const schools = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  defaultLanguageMode: languageModeEnum("default_language_mode")
    .default("mixed")
    .notNull(),
  aiDailyTokenCap: integer("ai_daily_token_cap").default(2000000).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 2. users
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").references(() => schools.id),
    role: roleEnum("role").notNull(),
    fullName: text("full_name").notNull(),
    externalId: text("external_id"),
    grade: integer("grade"), // 6, 7, 8 for students
    curriculum: curriculumEnum("curriculum"),
    preferredLanguage: languageModeEnum("preferred_language"),
    codeHmac: text("code_hmac").notNull(),
    codeLast4: text("code_last4").notNull(),
    status: text("status").default("active").notNull(), // 'active' | 'inactive'
    consentStatus: text("consent_status")
      .default("not_required_demo")
      .notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_code_hmac_idx").on(table.codeHmac),
    index("users_school_role_idx").on(table.schoolId, table.role),
    index("users_school_external_idx").on(table.schoolId, table.externalId),
  ]
);

// 3. classes
export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    name: text("name").notNull(),
    grade: integer("grade").notNull(),
    curriculum: curriculumEnum("curriculum").notNull(),
    academicYear: text("academic_year").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("classes_school_name_year_idx").on(
      table.schoolId,
      table.name,
      table.academicYear
    ),
  ]
);

// 4. class_students
export const classStudents = pgTable(
  "class_students",
  {
    classId: uuid("class_id")
      .references(() => classes.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("class_students_pk").on(table.classId, table.studentId),
  ]
);

// 5. class_teachers
export const classTeachers = pgTable(
  "class_teachers",
  {
    classId: uuid("class_id")
      .references(() => classes.id, { onDelete: "cascade" })
      .notNull(),
    teacherId: uuid("teacher_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    subject: subjectEnum("subject").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("class_teachers_pk").on(
      table.classId,
      table.teacherId,
      table.subject
    ),
  ]
);

// 6. missions
export const missions = pgTable(
  "missions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    teacherId: uuid("teacher_id")
      .references(() => users.id)
      .notNull(),
    title: text("title").notNull(), // <= 120 chars
    instructions: text("instructions"), // <= 2000 chars
    subject: subjectEnum("subject").notNull(),
    grade: integer("grade").notNull(),
    curriculum: curriculumEnum("curriculum").notNull(),
    languageMode: languageModeEnum("language_mode").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    status: missionStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("missions_school_teacher_status_idx").on(
      table.schoolId,
      table.teacherId,
      table.status
    ),
  ]
);

// 7. mission_targets
export const missionTargets = pgTable("mission_targets", {
  id: uuid("id").defaultRandom().primaryKey(),
  missionId: uuid("mission_id")
    .references(() => missions.id, { onDelete: "cascade" })
    .notNull(),
  classId: uuid("class_id").references(() => classes.id),
  studentId: uuid("student_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 8. assignments
export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    missionId: uuid("mission_id")
      .references(() => missions.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => users.id)
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    status: assignmentStatusEnum("status").default("not_started").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    resetCount: integer("reset_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("assignments_mission_student_idx").on(
      table.missionId,
      table.studentId
    ),
    index("assignments_student_status_idx").on(table.studentId, table.status),
  ]
);

// 9. sessions
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .references(() => assignments.id, { onDelete: "cascade" })
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    studentId: uuid("student_id")
      .references(() => users.id)
      .notNull(),
    missionId: uuid("mission_id")
      .references(() => missions.id)
      .notNull(),
    status: sessionStatusEnum("status").default("active").notNull(),
    languageMode: languageModeEnum("language_mode").notNull(),
    messageCount: integer("message_count").default(0).notNull(),
    rollingSummary: text("rolling_summary"),
    safetyFlag: boolean("safety_flag").default(false).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sessions_assignment_status_idx").on(
      table.assignmentId,
      table.status
    ),
  ]
);

// 10. messages
export const messages = pgTable(
  "messages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sessionId: uuid("session_id")
      .references(() => sessions.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(), // 'user' | 'assistant' | 'system'
    content: text("content").notNull(),
    tokensIn: integer("tokens_in").default(0).notNull(),
    tokensOut: integer("tokens_out").default(0).notNull(),
    model: text("model"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("messages_session_id_idx").on(table.sessionId, table.id)]
);

// 11. message_flags
export const messageFlags = pgTable("message_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: bigint("message_id", { mode: "number" })
    .references(() => messages.id)
    .notNull(),
  flaggedBy: uuid("flagged_by")
    .references(() => users.id)
    .notNull(),
  reason: text("reason").notNull(), // 'wrong_answer' | 'unsafe' | 'confusing' | 'other'
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 12. evaluations
export const evaluations = pgTable(
  "evaluations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => sessions.id)
      .notNull(),
    assignmentId: uuid("assignment_id")
      .references(() => assignments.id)
      .notNull(),
    status: text("status").notNull(), // 'ok' | 'failed'
    masteryScore: integer("mastery_score"), // 0-100
    level: levelEnum("level"),
    strengths: jsonb("strengths").$type<string[]>(),
    gaps: jsonb("gaps").$type<
      {
        tag: string;
        description: string;
        error_type: "conceptual" | "calculation" | "language" | "careless";
      }[]
    >(),
    hintsUsed: integer("hints_used").default(0).notNull(),
    practiceCorrect: integer("practice_correct").default(0).notNull(),
    practiceTotal: integer("practice_total").default(0).notNull(),
    studentSummary: text("student_summary"),
    teacherSummary: text("teacher_summary"),
    nextStep: text("next_step"),
    safetyConcern: boolean("safety_concern").default(false).notNull(),
    raw: jsonb("raw"),
    model: text("model"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("evaluations_assignment_created_idx").on(
      table.assignmentId,
      table.createdAt
    ),
  ]
);

// 13. ai_usage
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    sessionId: uuid("session_id").references(() => sessions.id),
    kind: text("kind").notNull(), // 'tutor' | 'evaluation' | 'test'
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    tokensIn: integer("tokens_in").default(0).notNull(),
    tokensOut: integer("tokens_out").default(0).notNull(),
    latencyMs: integer("latency_ms").default(0).notNull(),
    status: text("status").notNull(), // 'ok' | 'error' | 'rate_limited'
    errorCode: text("error_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("ai_usage_school_created_idx").on(table.schoolId, table.createdAt)]
);

// 14. auth_attempts
export const authAttempts = pgTable(
  "auth_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ipHash: text("ip_hash").notNull(),
    success: boolean("success").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("auth_attempts_ip_created_idx").on(table.ipHash, table.createdAt)]
);

// 15. import_batches
export const importBatches = pgTable("import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  filename: text("filename").notNull(),
  status: text("status").notNull(), // 'previewed' | 'committed' | 'cancelled'
  summary: jsonb("summary").notNull(),
  payload: jsonb("payload").notNull(),
  committedAt: timestamp("committed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 16. audit_log
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").references(() => schools.id),
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("audit_log_school_created_idx").on(table.schoolId, table.createdAt)]
);
