"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  triggerCelebrationConfetti,
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
  HoverSpring,
} from "@/components/ui/motion";
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
  Eye,
  Sliders,
  Compass,
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
        triggerCelebrationConfetti();
        setTimeout(() => {
          router.push(data.redirectTo || "/missions");
          router.refresh();
        }, 350);
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
      if (targetStep >= currentScenario.dialogue.length) {
        triggerCelebrationConfetti();
      }
    }, 350);
  };

  const demoRoles = [
    {
      role: "student",
      name: "Omar Al-Otaibi",
      title: "Student (Class 6A)",
      code: "S-ZJD0-1BXZ-40",
      icon: GraduationCap,
      color: "from-blue-600 via-indigo-600 to-purple-600",
      glow: "shadow-indigo-500/25",
      border: "border-indigo-200/80 hover:border-indigo-500 dark:border-indigo-900",
      accent: "text-indigo-600 dark:text-indigo-400",
      badge: "Learner Portal",
      badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
      description: "Experience the interactive Socratic AI tutor. Ask questions, receive progressive hints, solve equations with LaTeX formulas, and earn instant mastery evaluations.",
      features: [
        "Socratic Questioning Engine",
        "LaTeX Math Equation Rendering",
        "3-Stage 'I'm Stuck' Hint Ladder",
        "Objective 4-Tier Rubric Scoring",
      ],
    },
    {
      role: "teacher",
      name: "Ms. Huda Al-Ghamdi",
      title: "Math Teacher",
      code: "T-W05C-X6TS-PG",
      icon: BookOpen,
      color: "from-emerald-600 via-teal-600 to-cyan-600",
      glow: "shadow-emerald-500/25",
      border: "border-emerald-200/80 hover:border-emerald-500 dark:border-emerald-900",
      accent: "text-emerald-600 dark:text-emerald-400",
      badge: "Mission Control",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
      description: "Monitor live class missions, track mastery distribution (Exceeds, Meets, Approaching, Needs Support), inspect student transcripts, and export Excel & PDF reports.",
      features: [
        "Live Class Mastery Meter",
        "Instant Mission Creator",
        "Student Transcript Drill-Down",
        "1-Click Excel & PDF Exports",
      ],
    },
    {
      role: "school_admin",
      name: "Dr. Mona Al-Ahmad",
      title: "School Principal",
      code: "A-KBXZ-9GS6-F1",
      icon: Building2,
      color: "from-purple-600 via-fuchsia-600 to-pink-600",
      glow: "shadow-purple-500/25",
      border: "border-purple-200/80 hover:border-purple-500 dark:border-purple-900",
      accent: "text-purple-600 dark:text-purple-400",
      badge: "Principal Suite",
      badgeBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
      description: "Manage classes, teachers, and student rosters. Run the 4-step Excel spreadsheet bulk import wizard and generate printable access credential cards for entire grades.",
      features: [
        "4-Step Excel Roster Import",
        "Printable Card Credentials Generator",
        "Teacher & Class Roster Control",
        "School Performance Overview",
      ],
    },
    {
      role: "system_admin",
      name: "System Admin",
      title: "Platform Operations",
      code: "Y-8164-RC0Z-T4",
      icon: BarChart3,
      color: "from-amber-600 via-orange-600 to-red-600",
      glow: "shadow-amber-500/25",
      border: "border-amber-200/80 hover:border-amber-500 dark:border-amber-900",
      accent: "text-amber-600 dark:text-amber-400",
      badge: "Operations Command",
      badgeBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
      description: "Multi-tenant school governance, daily AI token consumption tracking, cost estimation, and live AI model ping & test scenario diagnostics.",
      features: [
        "Multi-Tenant Governance",
        "Daily Token Caps & Budgeting",
        "AI Diagnostics & Ping",
        "20-Scenario Test Suite",
      ],
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
    <div className="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* 1. Modern Glassmorphic Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Rafiq
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 to-primary-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-700/60">
                  MVP v0.1
                </span>
              </div>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-sans tracking-wide" dir="rtl">
                رفيق • رفيقك الذكي
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-neutral-600 dark:text-neutral-300">
            <a
              href="#simulator"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Interactive Chat</span>
            </a>
            <a
              href="#demo"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>1-Click Personas</span>
            </a>
            <a
              href="#features"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Features & Architecture
            </a>
            <a
              href="#curriculum"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Curriculums
            </a>
            <a
              href="#faq"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-neutral-700 hover:shadow-sm hover:scale-102 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Live Personas</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-primary-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-102 active:scale-98"
            >
              <span>Enter Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Ambient Glow & Animated Counters */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft Ambient Mesh Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.22),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.14),transparent)] pointer-events-none" />
        <div className="absolute top-28 right-10 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="absolute top-44 left-10 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Vision Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-indigo-200/90 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-extrabold shadow-sm backdrop-blur-md"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span>Saudi Vision 2030 Aligned • Socratic AI Learning Companion</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.12]"
            >
              Transform Homework into{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-primary-500 to-teal-500 bg-clip-text text-transparent">
                Deep Understanding
              </span>
              , Never Direct Answers.
            </motion.h1>

            {/* Arabic Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 font-sans tracking-wide"
              dir="rtl"
            >
              رفيقك الذكي نحو الفهم العميق والتميز الدراسي
            </motion.p>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto"
            >
              Rafiq guides students step-by-step through Socratic inquiry instead of giving answers away. Teachers receive real-time class mastery intelligence and 1-click reports, while schools manage everything without emails or passwords.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <HoverSpring>
                <a
                  href="#simulator"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-600 via-primary-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all"
                >
                  <Zap className="h-5 w-5 text-amber-300" />
                  <span>Play with Socratic Chat</span>
                </a>
              </HoverSpring>

              <HoverSpring>
                <a
                  href="#demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300/90 dark:border-neutral-700 shadow-sm transition-all"
                >
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <span>1-Click Live Role Test</span>
                </a>
              </HoverSpring>
            </motion.div>

            {/* 3 Metric Pills with AnimatedCounter */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 text-center shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  <AnimatedCounter value={100} duration={1.2} suffix="%" />
                </div>
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
                  Socratic Adherence
                </p>
                <span className="text-[11px] text-neutral-500">Zero Direct Answers</span>
              </div>

              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 text-center shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  <AnimatedCounter value={3} duration={0.8} /> Curriculums
                </div>
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
                  National & Global
                </p>
                <span className="text-[11px] text-neutral-500">Saudi MoE, CC, IGCSE</span>
              </div>

              <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 text-center shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  0 PII Leak
                </div>
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-1">
                  Cryptographic Isolation
                </p>
                <span className="text-[11px] text-neutral-500">Section 10 PRD Compliant</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Socratic Chat Simulator */}
      <section id="simulator" className="py-20 bg-white dark:bg-neutral-900/90 border-y border-neutral-200/90 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Live Socratic Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
              Try Rafiq's Socratic Method Right Here
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Select a subject and click the interactive student responses below to experience how Rafiq scaffolds learning without giving away answers.
            </p>
          </div>

          {/* Subject Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
            <button
              onClick={() => {
                setSelectedSubject("math");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "math"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Mathematics (Two-Step Equations)</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("science");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "science"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                  : "bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>Science (Photosynthesis)</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("english");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === "english"
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25"
                  : "bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>English (Irregular Verbs)</span>
            </button>
          </div>

          {/* Chat Window Frame */}
          <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Window Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-white via-indigo-50/25 to-white dark:from-neutral-850 dark:to-neutral-900 border-b border-neutral-200/90 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                    {currentScenario.title}
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${currentScenario.badgeClass}`}>
                      {currentScenario.grade}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Rafiq Socratic Tutor Active • Real-Time Dialogue</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatSteps(1)}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                title="Restart this interactive scenario"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="p-6 sm:p-7 space-y-4.5 max-h-[460px] overflow-y-auto bg-white/60 dark:bg-neutral-950/40">
              <AnimatePresence mode="popLayout">
                {currentScenario.dialogue.slice(0, chatSteps).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "student" ? (
                      <div className="bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-md shadow-md shadow-indigo-500/15 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>Omar (Student)</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-neutral-850 text-neutral-850 dark:text-neutral-200 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl rounded-tl-sm px-5.5 py-4 max-w-lg shadow-sm space-y-2.5 text-sm">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                          {msg.isPraise ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Mastery Recognition • أحسنت</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-4 w-4" />
                              <span>Rafiq Socratic Tutor</span>
                            </div>
                          )}
                        </div>
                        <p className="leading-relaxed text-neutral-800 dark:text-neutral-200 font-medium">
                          {msg.text}
                        </p>
                        {msg.mathFormula && (
                          <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-2xl text-center font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm border border-neutral-200/70 dark:border-neutral-800">
                            {msg.mathFormula}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-2 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Actions Bar */}
            <div className="p-5 bg-white dark:bg-neutral-850 border-t border-neutral-200/90 dark:border-neutral-800 space-y-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>Test Student Reactions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {currentScenario.interactivePrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.actionStep + 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-indigo-50 dark:bg-neutral-800 dark:hover:bg-indigo-950/60 text-neutral-700 hover:text-indigo-700 dark:text-neutral-200 dark:hover:text-indigo-300 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 transition-all hover:scale-102 active:scale-98"
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{prompt.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setChatSteps(1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Conversation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 1-Click Interactive Persona Studio */}
      <section id="demo" className="py-24 bg-neutral-50/70 dark:bg-neutral-950 border-b border-neutral-200/90 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Interactive Persona Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
              Launch Any Persona with 1 Click
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
              No registration or setup needed. Click any role card below to log straight into our live cloud database with pre-configured classes, assignments, and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoRoles.map((item) => {
              const Icon = item.icon;
              const isLoading = loggingInRole === item.role;

              return (
                <div
                  key={item.role}
                  className={`rounded-3xl border ${item.border} bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="space-y-4.5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-lg ${item.glow} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {item.code}
                      </span>
                    </div>

                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                        {item.badge}
                      </span>
                      <h3 className="text-lg font-black text-neutral-900 dark:text-white mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className={`text-xs font-bold ${item.accent}`}>
                        {item.title}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
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
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${item.color} hover:opacity-95 shadow-md ${item.glow} transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98`}
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

      {/* 5. Bento Grid of Features & Technical Capabilities */}
      <section id="features" className="py-24 bg-white dark:bg-neutral-900 border-b border-neutral-200/90 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
              Engineered for Modern Pedagogy & Scale
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
              Every feature in Rafiq is purpose-built to adhere to Section 10 of the PRD: Socratic inquiry, zero-friction administration, and absolute student data protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: 3-Stage Hint Ladder */}
            <div className="md:col-span-2 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:to-neutral-900 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                  The 3-Stage "I'm Stuck" Hint Ladder
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                  Generic AI gives answers directly, robbing students of learning. Rafiq scaffolds the cognitive struggle with an intelligent three-stage escalation protocol:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Level 1</span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Conceptual Hint</h4>
                    <p className="text-xs text-neutral-500 mt-1">Focuses on underlying rules or definitions without solving.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400">Level 2</span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Guided Step</h4>
                    <p className="text-xs text-neutral-500 mt-1">Breaks the equation down into the immediate next mathematical action.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700">
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400">Level 3</span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Parallel Example</h4>
                    <p className="text-xs text-neutral-500 mt-1">Walks through a twin problem with altered numbers so the student solves their own.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 4-Tier Rubric Scoring */}
            <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                  4-Tier Mastery Evaluation
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Upon completion, Rafiq grades student understanding against rigorous rubrics: Exceeds (4), Meets (3), Approaching (2), and Needs Support (1).
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl">
                    <span>Exceeds Mastery (Tier 4)</span>
                    <span>100%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-xl">
                    <span>Meets Standards (Tier 3)</span>
                    <span>85%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl">
                    <span>Approaching (Tier 2)</span>
                    <span>65%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Zero-PII Cryptographic Isolation */}
            <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                  Zero Student PII to LLMs
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Student names, school IDs, and emails are never passed to external AI models. Prompts use cryptographically isolated session tokens.
                </p>
                <ul className="text-xs space-y-2 text-neutral-500 pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Passwordless Crockford Base32 Codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>No Third-Party AI Model Training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Tenant-Isolated Database Schemas</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 4: Excel Batch Roster Import */}
            <div className="md:col-span-2 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-gradient-to-br from-neutral-900 via-indigo-950 to-neutral-900 text-white p-8 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit text-xs font-bold text-emerald-400">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>4-Step Roster Wizard</span>
                </div>
                <h3 className="text-2xl font-black">
                  Enroll 500+ Students in Under 10 Seconds
                </h3>
                <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
                  School administrators can drop their existing school Excel (.xlsx) file, preview parsed classes and students with automated validation, and print out card credentials instantly.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-bold text-indigo-400">Step 1</span>
                    <p className="text-neutral-300 mt-1">Download Template</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-bold text-emerald-400">Step 2</span>
                    <p className="text-neutral-300 mt-1">Upload & Check</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-bold text-purple-400">Step 3</span>
                    <p className="text-neutral-300 mt-1">Preview & Commit</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-bold text-amber-400">Step 4</span>
                    <p className="text-neutral-300 mt-1">Print Card Codes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Curriculums Supported */}
      <section id="curriculum" className="py-20 bg-neutral-50/70 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              Curriculum Alignment
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
              Tailored for Leading School Frameworks
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Rafiq’s pedagogical prompt engine adjusts dynamically to match curriculum terminologies and national educational standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                National Standard
              </span>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Saudi Ministry of Education
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Full alignment with Saudi standard textbooks, learning outcomes, and bilingual terminology for middle and high school grades.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                American Framework
              </span>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Common Core & NGSS
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Grade-level standards for Math, Next Generation Science Standards (NGSS), and AP-track analytical reasoning frameworks.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                British Framework
              </span>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Cambridge International (IGCSE)
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Structured inquiry for Cambridge Lower Secondary and IGCSE examination preparation in Sciences and Mathematics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive FAQ Accordion */}
      <section id="faq" className="py-20 bg-white dark:bg-neutral-900 border-t border-neutral-200/90 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white">
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
                  className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-850 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-neutral-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/70 dark:border-neutral-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-primary-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Experience Rafiq in Action?
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto">
            Test the live student AI chat, teacher mission dashboard, and school admin spreadsheet imports right now with 1 click.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <HoverSpring>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white text-indigo-700 hover:bg-neutral-100 shadow-xl transition-all"
              >
                Select a Demo Role Above
              </a>
            </HoverSpring>
            <HoverSpring>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-indigo-950/40 hover:bg-indigo-950/60 border border-white/20 text-white transition-all"
              >
                Enter with Code
              </Link>
            </HoverSpring>
          </div>
        </div>
      </section>

      {/* 9. Modern SaaS Footer */}
      <footer className="bg-neutral-950 text-neutral-400 text-xs py-14 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Rafiq • رفيق</p>
              <p className="text-[11px] text-neutral-500">The Socratic AI Study Companion for Saudi & Arab Schools</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo Roles</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Curriculums</a>
            <Link href="/login" className="hover:text-white transition-colors">Portal Login</Link>
          </div>

          <p className="text-[11px] text-neutral-500">
            &copy; 2026 Rafiq MVP. All rights reserved. Built for Saudi Vision 2030.
          </p>
        </div>
      </footer>
    </div>
  );
}
