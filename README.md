# Rafiq MVP (رفيق) — Personal AI Study Companion

> A B2B tutoring platform for private schools in Saudi Arabia (Grades 6–8; Math, Science, English).
> Teachers assign an interactive Mission in 60 seconds; students receive step-by-step Socratic AI tutoring; teachers review structured mastery diagnostics and export Excel/PDF reports.

---

## Features Built

- **Authentication & Security (US-AUTH-01 – 05)**:
  - Role-coded access codes (`S-...`, `T-...`, `A-...`, `Y-...`) with Crockford Base32.
  - HMAC-SHA256 storage with server pepper (plaintext codes are never stored and shown only once).
  - Signed HTTP-only session cookies via `jose` JWT (12h student, 8h staff).
  - Brute-force rate limiting (10 failures per IP in 10 mins triggers a 15-min lock).
  - One-time System Admin bootstrap via `SYSTEM_ADMIN_BOOTSTRAP_CODE`.
- **System Administration (US-SYS-01 – 05)**:
  - Multi-tenant school creation and daily token limit configuration.
  - School Administrator provisioning with one-time credential display.
  - Aggregate AI token and cost monitoring.
  - Live AI connection & latency diagnostic tool.
- **School Administration & Import Engine (US-SCH-01 – 07, US-IMP-01 – 05)**:
  - Executive school dashboard with 7-day active user count, token usage, and counselor safety alerts.
  - Directory search across Arabic and English names with status toggles and instant code regeneration.
  - Class sections management with teacher subject assignments.
  - 4-step Excel import wizard (`.xlsx` download, row-level preview with error diagnostics, single-transaction commit).
  - Instant credentials export to Excel and 8-per-page printable A4 cards with cut lines.
- **Teacher Missions (US-MIS-01 – 05)**:
  - Rapid 60-second mission creation with grade/curriculum target validation.
  - Snapshot assignment creation upon publish.
  - Lifecycle management: draft, published, closed, and reopened.
- **Student AI Tutoring (US-STU-01 – 05, US-AI-01 – 07)**:
  - "My Missions" dashboard with subject styling and due-date tracking.
  - Full-screen interactive tutoring session with Server-Sent Events (SSE) streaming.
  - Socratic tutor method: small chunks (<120 words), diagnostic questions, hint ladder.
  - LaTeX math rendering (`react-markdown` + `remark-math` + `rehype-katex`).
  - Automatic RTL/LTR text detection for Arabic and English.
  - "I'm stuck" quick-action button delivering scaffolded hints without leaking answers.
  - Automated safety marker detection (`[[SAFETY_FLAG]]`) and session completion detection (`[[SESSION_COMPLETE]]`).
- **Pedagogical Evaluation & Reporting (US-REP-01 – 05, US-AI-04)**:
  - Inline evaluation pipeline validated by Zod schema.
  - Four mastery levels: Mastered (90–100), Getting Strong (70–89), Making Progress (50–69), Needs Practice (0–49).
  - Student summary card with `MasteryMeter`, strengths chips, and actionable next steps.
  - Teacher results dashboard with aggregate scores, level distribution bar, common gap tags, and student roster.
  - Full conversation transcript inspection with teacher reply flagging (`US-AI-08`).
  - Assignment reset functionality for students who need another attempt.
  - Branded Excel and printable PDF export.
- **Platform Verification & Seed Data (US-PLT-01 – 06)**:
  - Rich demo seed script (`scripts/seed-demo.ts`) creating "Demo International School", 3 teachers, 4 classes, 40 students, 6 missions, and completed sessions.
  - 20-scenario AI test suite (`tests/ai/run-scenarios.ts`) passing with 100% success.
  - Health check endpoint at `/api/health`.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Tokens (`styles/tokens.css`) + Radix UI Primitives + Lucide Icons
- **Database**: PostgreSQL (Neon Serverless / standard Postgres) with Drizzle ORM
- **AI Engine**: Provider abstraction supporting Groq / OpenAI-compatible APIs and deterministic Mock mode
- **Math & Markdown**: `react-markdown`, `remark-math`, `rehype-katex`, `katex`
- **Spreadsheets & Documents**: `exceljs`

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Review the variables in `.env`:
- `DATABASE_URL`: Your PostgreSQL / Neon connection string (e.g. `postgres://postgres:postgres@localhost:5432/rafiq` or `postgres://...neon.tech/...`)
- `SESSION_SECRET`: 32+ character random string for signing JWT cookies
- `CODE_PEPPER`: 32+ character random string for HMAC hashing access codes
- `AI_PROVIDER`: `mock` (default for offline/demo use) or `openai_compatible`
- `AI_API_KEY`: Groq or OpenAI-compatible API key (when using `openai_compatible`)

### 2. Database Migrations

Apply the database schema:

```bash
npm run db:push
```

### 3. Seed Demo Data

Seed "Demo International School" with teachers, classes, students, and missions:

```bash
npm run seed
```

This will print the generated access codes directly to the terminal.

### 4. Run AI Scenario Suite

Verify the 20 pedagogical, safety, and language scenarios:

```bash
npm run test:ai
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
