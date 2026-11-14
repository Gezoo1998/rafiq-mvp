"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Users,
  Building2,
  BarChart3,
  CheckCircle2,
  Calculator,
  FlaskConical,
  Globe,
  Lock,
  FileSpreadsheet,
  Download,
  HelpCircle,
  ChevronDown,
  Layers,
  Award,
  Zap,
  RotateCcw,
  Lightbulb,
  Check,
  Send,
} from "lucide-react";

interface ChatScenarioStep {
  sender: "student" | "rafiq";
  text: string;
  mathFormula?: string;
  isPraise?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [loggingInRole, setLoggingInRole] = React.useState<string | null>(null);
  const [faqOpen, setFaqOpen] = React.useState<number | null>(null);

  // Interactive Live Chat Simulator State
  const [selectedSubject, setSelectedSubject] = React.useState<"math" | "science" | "english">("math");
  const [chatSteps, setChatSteps] = React.useState<number>(1);
  const [isTyping, setIsTyping] = React.useState(false);

  // 1-Click Demo Login Handler
  const handleQuickLogin = async (code: string, roleName: string) => {
    setLoggingInRole(roleName);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || "/missions");
        router.refresh();
      } else {
        alert(data.error?.message || "Could not log in with demo code. Please verify database connection.");
        setLoggingInRole(null);
      }
    } catch {
      alert("Network error. Please check your connection.");
      setLoggingInRole(null);
    }
  };

  const scenarios: Record<
    "math" | "science" | "english",
    {
      title: string;
      grade: string;
      color: string;
      badgeClass: string;
      dialogue: ChatScenarioStep[];
      interactivePrompts: { label: string; actionStep: number; icon: any }[];
    }
  > = {
    math: {
      title: "Solving Two-Step Linear Equations",
      grade: "Grade 6 • Algebra",
      color: "from-indigo-600 to-purple-600",
      badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      dialogue: [
        {
          sender: "rafiq",
          text: "Welcome, Omar! Here is our challenge today. How would we begin solving for x?",
          mathFormula: "4x - 5 = 19",
        },
        {
          sender: "student",
          text: "Can you just give me the answer directly?",
        },
        {
          sender: "rafiq",
          text: "I want you to experience the satisfaction of uncovering it! Look at 4x - 5 = 19. What operation will undo subtracting 5?",
        },
        {
          sender: "student",
          text: "We add 5 to both sides of the equation?",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "Spot on! ممتاز When we add 5 to both sides: 19 + 5 = 24, giving 4x = 24. What is your final step to isolate x?",
          mathFormula: "4x = 24 \\implies x = 6",
        },
      ],
      interactivePrompts: [
        { label: "Can you give me the answer?", actionStep: 2, icon: MessageSquare },
        { label: "Give me a hint (Level 1)", actionStep: 3, icon: Lightbulb },
        { label: "Add 5 to both sides!", actionStep: 4, icon: CheckCircle2 },
      ],
    },
    science: {
      title: "Photosynthesis & Solar Energy Conversion",
      grade: "Grade 7 • Biology",
      color: "from-emerald-600 to-teal-600",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      dialogue: [
        {
          sender: "rafiq",
          text: "Hello, Sara! How do plant leaves absorb solar radiation to synthesize food molecules?",
          mathFormula: "6CO_2 + 6H_2O \\xrightarrow{\\text{Light}} C_6H_{12}O_6 + 6O_2",
        },
        {
          sender: "student",
          text: "Is it mitochondria?",
        },
        {
          sender: "rafiq",
          text: "Mitochondria produce energy for the cell, but look at the green pigment inside the leaf. What organelle houses chlorophyll?",
        },
        {
          sender: "student",
          text: "Chloroplasts capture the green light spectrum!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "Fabulous insight! أحسنت! Chloroplasts absorb blue and red photons and reflect green, driving glucose synthesis.",
        },
      ],
      interactivePrompts: [
        { label: "Is it mitochondria?", actionStep: 2, icon: MessageSquare },
        { label: "Give me a hint on organelles", actionStep: 3, icon: Lightbulb },
        { label: "Chloroplasts absorb photons!", actionStep: 4, icon: CheckCircle2 },
      ],
    },
    english: {
      title: "Mastering Irregular Past Tense Verbs",
      grade: "Grade 6 • English Language Arts",
      color: "from-rose-600 to-pink-600",
      badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      dialogue: [
        {
          sender: "rafiq",
          text: "Hi, Khalid! In English, some verbs do not take '-ed'. What is the past tense of 'I catch the ball'?",
        },
        {
          sender: "student",
          text: "I catched the ball yesterday?",
        },
        {
          sender: "rafiq",
          text: "That is a very logical guess! But 'catch' has an irregular vowel shift similar to 'teach' becoming 'taught'. Can you hear the sound?",
        },
        {
          sender: "student",
          text: "I caught the ball!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "Perfect, Khalid! ممتاز 'Catch' becomes 'caught' (C-A-U-G-H-T). You mastered the vowel shift pattern!",
        },
      ],
      interactivePrompts: [
        { label: "I catched the ball?", actionStep: 2, icon: MessageSquare },
        { label: "Hint: rhyming with taught", actionStep: 3, icon: Lightbulb },
        { label: "I caught the ball!", actionStep: 4, icon: CheckCircle2 },
      ],
    },
  };

  const currentScenario = scenarios[selectedSubject];

  const handlePromptClick = (targetStep: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setChatSteps(targetStep);
      setIsTyping(false);
    }, 400);
  };

  const demoRoles = [
    {
      role: "student",
      name: "Omar Al-Otaibi",
      title: "Student (Class 6A)",
      code: "S-ZJD0-1BXZ-40",
      icon: GraduationCap,
      color: "from-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/20",
      border: "border-blue-400/40 hover:border-blue-500",
      accent: "text-blue-600 dark:text-blue-400",
      badge: "Learner Portal",
      description: "Experience the interactive Socratic AI tutor. Ask questions, receive progressive hints, solve equations with LaTeX formulas, and earn instant mastery evaluations.",
      features: ["Socratic Questioning Engine", "LaTeX Math Equation Rendering", "3-Stage 'I'm Stuck' Hint Ladder", "Objective 4-Tier Rubric Scoring"],
    },
    {
      role: "teacher",
      name: "Ms. Huda Al-Ghamdi",
      title: "Math Teacher",
      code: "T-W05C-X6TS-PG",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-600",
      shadow: "shadow-emerald-500/20",
      border: "border-emerald-400/40 hover:border-emerald-500",
      accent: "text-emerald-600 dark:text-emerald-400",
      badge: "Mission Control",
      description: "Monitor live class missions, track mastery distribution (Exceeds, Meets, Approaching, Needs Support), inspect student transcripts, and export Excel & PDF reports.",
      features: ["Live Class Mastery Meter", "Instant Mission Creator", "Student Transcript Drill-Down", "1-Click Excel & PDF Exports"],
    },
    {
      role: "school_admin",
      name: "Dr. Mona Al-Ahmad",
      title: "School Principal",
      code: "A-KBXZ-9GS6-F1",
      icon: Building2,
      color: "from-purple-600 to-pink-600",
      shadow: "shadow-purple-500/20",
      border: "border-purple-400/40 hover:border-purple-500",
      accent: "text-purple-600 dark:text-purple-400",
      badge: "Principal Suite",
      description: "Manage classes, teachers, and student rosters. Run the 4-step Excel spreadsheet bulk import wizard and generate printable access credential cards for entire grades.",
      features: ["4-Step Excel Roster Import", "Printable Card Credentials Generator", "Teacher & Class Roster Control", "School Performance Overview"],
    },
    {
      role: "system_admin",
      name: "System Admin",
      title: "Platform Operations",
      code: "Y-8164-RC0Z-T4",
      icon: BarChart3,
      color: "from-amber-600 to-orange-600",
      shadow: "shadow-amber-500/20",
      border: "border-amber-400/40 hover:border-amber-500",
      accent: "text-amber-600 dark:text-amber-400",
      badge: "Operations Command",
      description: "Multi-tenant school governance, daily AI token consumption tracking, cost estimation, and live AI model ping & test scenario diagnostics.",
      features: ["Multi-Tenant Governance", "Daily Token Caps & Budgeting", "AI Diagnostics & Ping", "20-Scenario Test Suite"],
    },
  ];

  const faqs = [
    {
      q: "How do students and teachers log in without passwords?",
      a: "Rafiq uses Crockford Base32 access codes (e.g., S-XXXX-XXXX-XX for students, T-XXXX-XXXX-XX for teachers). These codes are generated by the school administrator, can be printed on physical cards, and eliminate forgotten passwords or email requirements for young learners.",
    },
    {
      q: "Does Rafiq give students the direct answers to their homework?",
      a: "Never. Rafiq is built strictly on Socratic pedagogy. When a student asks 'What is x?' or 'Solve this for me', Rafiq asks guiding questions, provides analogies, breaks problems into steps, and scaffolds understanding without spoon-feeding answers.",
    },
    {
      q: "How does Rafiq protect student privacy and PII?",
      a: "Compliant with Section 10 of the PRD, student names and identifying information are never sent to external AI providers. All database access uses strict tenant isolation, sessions are cryptographically signed, and student data is never used to train third-party models.",
    },
    {
      q: "Which curriculums and subjects are supported?",
      a: "Rafiq supports the Saudi Ministry of Education curriculum, American Common Core & NGSS, and Cambridge IGCSE across Mathematics, General Science, Biology, Chemistry, Physics, and English Language Arts.",
    },
    {
      q: "Can teachers export reports for parents and administration?",
      a: "Yes! Every mission features 1-click export to formatted Excel spreadsheets (.xlsx) and clean, print-ready PDF summaries showing student completion, mastery tier, strengths, and next steps.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Executive Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-navy-900 dark:text-white flex items-center gap-2">
                Rafiq
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-primary-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  MVP v0.1
                </span>
              </span>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-sans" dir="rtl">
                رفيق • رفيقك الذكي
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-neutral-600 dark:text-neutral-300">
            <a href="#simulator" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Interactive Chat</span>
            </a>
            <a href="#demo" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              1-Click Demo
            </a>
            <a href="#pedagogy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Socratic Pedagogy
            </a>
            <a href="#curriculum" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Curriculums
            </a>
            <a href="#faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action */}
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-neutral-700 hover:shadow-sm transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Try Live Roles</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-4.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all active:scale-98"
            >
              <span>Enter Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Mesh Gradient */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-indigo-50/20 to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.2),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Vision Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-primary-500/10 to-teal-500/10 dark:from-indigo-950/60 dark:to-teal-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-extrabold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Saudi Vision 2030 Aligned • Socratic AI Learning</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-navy-900 dark:text-white leading-[1.14]">
              Transform Homework into{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-primary-500 to-teal-500 bg-clip-text text-transparent">
                Deep Understanding
              </span>
              , Never Direct Answers.
            </h1>

            {/* Arabic Tagline */}
            <p className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 font-sans" dir="rtl">
              رفيقك الذكي نحو الفهم العميق والتميز الدراسي
            </p>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto">
              Rafiq guides students step-by-step through Socratic inquiry instead of giving answers away. Teachers receive real-time class mastery intelligence and 1-click reports, while schools manage everything without emails or passwords.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap className="h-5 w-5 text-amber-300" />
                <span>Play with Socratic Chat</span>
              </a>

              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-navy-900 dark:text-white border border-neutral-300 dark:border-neutral-700 shadow-xs transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>1-Click Live Role Test</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Zero Student PII Sent to LLMs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-indigo-500" />
                <span>Passwordless Card Codes</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Real-Time SSE Streaming</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Socratic Chat Simulator */}
      <section id="simulator" className="py-16 bg-neutral-100/60 dark:bg-neutral-900/60 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Live Socratic Simulator
            </span>
            <h2 className="text-3xl font-black text-navy-900 dark:text-white">
              Try Rafiq's Socratic Method Right Here
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Select a subject and click the interactive buttons below to test how Rafiq responds to students in real time.
            </p>
          </div>

          {/* Subject Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => {
                setSelectedSubject("math");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "math"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Mathematics (Equations)</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("science");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "science"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Science (Photosynthesis)</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("english");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "english"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>English (Verbs)</span>
            </button>
          </div>

          {/* Interactive Chat Window */}
          <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-neutral-50 via-indigo-50/30 to-neutral-50 dark:from-neutral-850 dark:to-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy-900 dark:text-white flex items-center gap-2">
                    {currentScenario.title}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentScenario.badgeClass}`}>
                      {currentScenario.grade}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Rafiq Socratic Tutor Active</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatSteps(1)}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Restart this interactive scenario"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-neutral-50/40 dark:bg-neutral-900/40">
              {currentScenario.dialogue.slice(0, chatSteps).map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                  {msg.sender === "student" ? (
                    <div className="bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-2xl rounded-tr-sm px-4.5 py-3 max-w-md shadow-md text-sm font-medium">
                      <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider mb-0.5">You (Student)</p>
                      <p>{msg.text}</p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 rounded-2xl rounded-tl-sm px-5 py-3.5 max-w-lg shadow-sm text-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                        {msg.isPraise ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        <span>Rafiq Socratic Tutor</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.mathFormula && (
                        <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900/80 rounded-xl text-center font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                          {msg.mathFormula}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-xs flex items-center gap-1.5 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Prompt Actions Bar */}
            <div className="p-4 bg-white dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>Click a student response to test the Socratic reaction:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentScenario.interactivePrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.actionStep + 1)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-indigo-50 dark:bg-neutral-800 dark:hover:bg-indigo-950/50 text-neutral-700 hover:text-indigo-700 dark:text-neutral-200 dark:hover:text-indigo-300 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 transition-all hover:scale-102"
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{prompt.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setChatSteps(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 1-Click Interactive Role Playground */}
      <section id="demo" className="py-20 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Interactive Test Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-900 dark:text-white">
              Launch Any Persona with 1 Click
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
              No registration or setup needed. Click any card below to log in directly into our live Neon PostgreSQL cloud database with pre-seeded data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoRoles.map((item) => {
              const Icon = item.icon;
              const isLoading = loggingInRole === item.role;

              return (
                <div
                  key={item.role}
                  className={`rounded-3xl border ${item.border} bg-neutral-50/70 dark:bg-neutral-850 p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg ${item.shadow}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {item.code}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                        {item.badge}
                      </span>
                      <h3 className="text-lg font-black text-navy-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className={`text-xs font-bold ${item.accent}`}>
                        {item.title}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-3 border-t border-neutral-200/70 dark:border-neutral-800">
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Launch Button */}
                  <div className="pt-6">
                    <button
                      onClick={() => handleQuickLogin(item.code, item.role)}
                      disabled={isLoading || loggingInRole !== null}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${item.color} hover:opacity-95 shadow-md ${item.shadow} transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98`}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch {item.title.split(" ")[0]} Portal</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Pedagogical Pillars */}
      <section id="pedagogy" className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              The Pedagogical Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-900 dark:text-white">
              Why Rafiq is Fundamentally Different
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
              Generic LLMs act as homework cheat engines. Rafiq is engineered from the ground up as a patient Socratic mentor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                Socratic Inquiry, Never Answers
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Rafiq refuses to hand out direct answers. If a student gets stuck, it activates the 3-step hint ladder: Conceptual Hint &rarr; Guided Step &rarr; Parallel Example.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                4-Tier Mastery Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upon session completion, Rafiq grades student understanding into Exceeds (4), Meets (3), Approaching (2), or Needs Support (1) with specific strengths and next steps.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                Bilingual & Saudi Context
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Native Arabic and English support. Students can chat in Arabic, English, or mixed Arabizi; Rafiq understands colloquial expressions and Saudi educational terminology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Teacher & School Administration */}
      <section id="pillars" className="py-20 bg-white dark:bg-neutral-900 border-y border-neutral-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Teacher Mission Control
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy-900 dark:text-white">
                Live Insights Into What Your Class Understands
              </h2>
              <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Say goodbye to manually grading homework hours after students forgot what they worked on. With Rafiq, teachers see completion in real time.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900 dark:text-white">Real-Time Class Mastery Meters</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">See exactly how many students are at each tier (Exceeds, Meets, Approaching, Needs Support).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900 dark:text-white">Transparent Transcript Inspection</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Read the exact dialogue between any student and Rafiq to see their thought process and sticking points.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900 dark:text-white">1-Click Excel & PDF Exports</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Download executive reports for school principals, department heads, and parent-teacher meetings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* School Admin card */}
            <div className="bg-gradient-to-br from-navy-900 via-indigo-950 to-neutral-900 p-8 sm:p-10 rounded-3xl text-white shadow-2xl space-y-6 border border-indigo-900/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <span>Zero-Friction Administration</span>
              </div>
              <h3 className="text-2xl font-black">
                Enroll 500+ Students in Under 10 Seconds
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                School administrators can download our standard Excel template, paste their existing roster, upload it, preview changes, and commit in 4 simple steps.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                  <span>Download pre-built Excel template (.xlsx)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                  <span>Upload & validate with automatic error-checking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">3</span>
                  <span>Preview created classes, teachers, and students</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">4</span>
                  <span>Print physical credential cards with Crockford Base32 codes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Curriculums Supported */}
      <section id="curriculum" className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              Curriculum Alignment
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-900 dark:text-white">
              Tailored for Leading School Frameworks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">National Framework</span>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Saudi Ministry of Education</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Fully aligned with Saudi standard textbooks, learning outcomes, and terminology for middle and high school grades.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">International Framework</span>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">American Common Core & NGSS</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Grade-level standards for Math, Next Generation Science Standards (NGSS), and AP-track analytical frameworks.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">British Framework</span>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Cambridge International (IGCSE)</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Structured inquiry for Cambridge Lower Secondary and IGCSE examination preparation in Sciences and Mathematics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section id="faq" className="py-20 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-navy-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Everything you need to know about Rafiq's architecture, security, and rollout.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-navy-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/60 dark:border-neutral-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-primary-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience Rafiq in Action?
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto">
            Test the live student AI chat, teacher mission dashboard, and school admin spreadsheet imports right now with 1 click.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white text-indigo-700 hover:bg-neutral-100 shadow-xl transition-all"
            >
              Select a Demo Role Above
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-indigo-950/40 hover:bg-indigo-950/60 border border-white/20 text-white transition-all"
            >
              Enter with Code
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-navy-950 text-neutral-400 text-xs py-12 border-t border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Rafiq • رفيق</p>
              <p className="text-[11px] text-neutral-400">The Socratic AI Study Companion for Saudi & Arab Schools</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pedagogy" className="hover:text-white transition-colors">Pedagogy</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculums</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>

          <p className="text-[11px] text-neutral-400">
            &copy; 2026 Rafiq MVP. All rights reserved. Built for Saudi Vision 2030.
          </p>
        </div>
      </footer>
    </div>
  );
}
