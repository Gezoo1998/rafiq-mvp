"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  triggerCelebrationConfetti,
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
  HoverSpring,
} from "@/components/ui/motion";
import { RafiqMascot } from "@/components/ui/mascot";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Building2,
  BarChart3,
  CheckCircle2,
  Calculator,
  FlaskConical,
  Globe,
  Lock,
  FileSpreadsheet,
  HelpCircle,
  ChevronDown,
  Layers,
  Award,
  Zap,
  RotateCcw,
  Lightbulb,
  Check,
  Send,
  Star,
  Flame,
  ArrowRight,
  Smile,
  Heart,
  Trophy,
  Rocket,
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
      subjectIcon: any;
      headerColor: string;
      dialogue: ChatScenarioStep[];
      interactivePrompts: { label: string; actionStep: number; icon: any }[];
    }
  > = {
    math: {
      title: "Math Adventure: Two-Step Equations",
      grade: "Grade 6 • Fun Algebra",
      subjectIcon: Calculator,
      headerColor: "from-amber-400 via-orange-400 to-amber-500",
      dialogue: [
        {
          sender: "rafiq",
          text: "Salam Omar! 🌟 Welcome to our math quest! How should we begin solving for x here?",
          mathFormula: "4x - 5 = 19",
        },
        {
          sender: "student",
          text: "Can you just give me the answer directly please?",
        },
        {
          sender: "rafiq",
          text: "I want you to feel that awesome 'Aha!' moment! Look at the - 5. What is the opposite operation that can cancel out subtracting 5?",
        },
        {
          sender: "student",
          text: "We add 5 to both sides of the balance scale!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "YAY! بطل يا عمر! Exactly! 19 + 5 = 24, giving 4x = 24. What is the final step to find x?",
          mathFormula: "4x = 24 \\implies x = 6",
        },
      ],
      interactivePrompts: [
        { label: "Give me the answer!", actionStep: 2, icon: HelpCircle },
        { label: "💡 Hint 1: What cancels - 5?", actionStep: 3, icon: Lightbulb },
        { label: "✨ Add 5 to both sides!", actionStep: 4, icon: Star },
      ],
    },
    science: {
      title: "Science Discovery: Plant Superpowers",
      grade: "Grade 7 • Nature & Cells",
      subjectIcon: FlaskConical,
      headerColor: "from-emerald-400 via-teal-400 to-emerald-500",
      dialogue: [
        {
          sender: "rafiq",
          text: "Marhaban Sara! 🌿 Plants make their own food using sunlight. What special green factory inside the leaf catches solar energy?",
          mathFormula: "6CO_2 + 6H_2O \\xrightarrow{\\text{Light}} C_6H_{12}O_6 + 6O_2",
        },
        {
          sender: "student",
          text: "Is it the cell wall?",
        },
        {
          sender: "rafiq",
          text: "The cell wall keeps the cell strong, but look at that emerald green pigment called chlorophyll! Which organelle holds it?",
        },
        {
          sender: "student",
          text: "Chloroplasts capture the green light spectrum!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "SUPERSTAR! ممتاز جداً! 🌟 Chloroplasts turn sunlight, water, and air into delicious glucose energy!",
        },
      ],
      interactivePrompts: [
        { label: "Is it the cell wall?", actionStep: 2, icon: HelpCircle },
        { label: "💡 Hint 1: Think green pigment", actionStep: 3, icon: Lightbulb },
        { label: "✨ Chloroplasts absorb light!", actionStep: 4, icon: Star },
      ],
    },
    english: {
      title: "Language Magic: Irregular Past Verbs",
      grade: "Grade 6 • Grammar Adventure",
      subjectIcon: BookOpen,
      headerColor: "from-sky-400 via-blue-400 to-indigo-500",
      dialogue: [
        {
          sender: "rafiq",
          text: "Hello Khalid! 🎈 In English, some tricky verbs change their whole sound. What is the past tense of 'I catch the ball'?",
        },
        {
          sender: "student",
          text: "I catched the ball yesterday?",
        },
        {
          sender: "rafiq",
          text: "Super smart guess! But 'catch' has an irregular sound shift, just like 'teach' becomes 'taught'. Can you guess the rhyme?",
        },
        {
          sender: "student",
          text: "I caught the ball!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "YES! أحسنت يا خالد! 🏆 'Catch' becomes 'caught' (C-A-U-G-H-T). You mastered the irregular verb sound!",
        },
      ],
      interactivePrompts: [
        { label: "I catched the ball?", actionStep: 2, icon: HelpCircle },
        { label: "💡 Hint: Rhymes with taught", actionStep: 3, icon: Lightbulb },
        { label: "✨ I caught the ball!", actionStep: 4, icon: Star },
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
      title: "Student Explorer (Class 6A)",
      code: "S-ZJD0-1BXZ-40",
      icon: GraduationCap,
      color: "bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 text-neutral-950",
      cardBorder: "border-amber-300 hover:border-amber-400 bg-amber-50/40",
      badge: "Student Quest Portal",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      description: "Chat with Rafiq your friendly AI tutor! Ask questions, unlock progressive clues, solve equations with LaTeX formulas, and collect mastery stars.",
      features: [
        "Friendly Socratic Chat Companion",
        "Step-by-Step Star Progress",
        "3-Stage 'I'm Stuck' Clue Ladder",
        "Celebration Confetti & Stickers",
      ],
    },
    {
      role: "teacher",
      name: "Ms. Huda Al-Ghamdi",
      title: "Math Guide & Teacher",
      code: "T-W05C-X6TS-PG",
      icon: BookOpen,
      color: "bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white",
      cardBorder: "border-emerald-300 hover:border-emerald-400 bg-emerald-50/40",
      badge: "Teacher Mission Control",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "See what your students truly understand! Monitor live mission progress, view class mastery meters, inspect chat transcripts, and download reports.",
      features: [
        "Live Class Mastery Gauges",
        "1-Click Mission Creator",
        "Student Thought Transcript Viewer",
        "1-Click Excel & PDF Downloads",
      ],
    },
    {
      role: "school_admin",
      name: "Dr. Mona Al-Ahmad",
      title: "School Principal",
      code: "A-KBXZ-9GS6-F1",
      icon: Building2,
      color: "bg-sky-500 hover:bg-sky-400 border-b-4 border-sky-700 text-white",
      cardBorder: "border-sky-300 hover:border-sky-400 bg-sky-50/40",
      badge: "School Captain Suite",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
      description: "Easily enroll whole grades with our 4-step Excel spreadsheet wizard, manage teachers & classes, and print cute physical card codes for kids.",
      features: [
        "4-Step Excel Bulk Roster Wizard",
        "Printable Cute Credential Cards",
        "Teachers & Classes Directory",
        "Zero Emails or Passwords Required",
      ],
    },
    {
      role: "system_admin",
      name: "System Operations",
      title: "Platform Command",
      code: "Y-8164-RC0Z-T4",
      icon: BarChart3,
      color: "bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 text-white",
      cardBorder: "border-indigo-300 hover:border-indigo-400 bg-indigo-50/40",
      badge: "Platform Control",
      badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
      description: "Multi-tenant school governance, daily AI token consumption tracking, cost estimation, and live AI model ping & test scenario diagnostics.",
      features: [
        "Multi-School Network Governance",
        "Daily AI Token Budget & Caps",
        "Live AI Diagnostics & Ping",
        "20-Scenario Automated Test Suite",
      ],
    },
  ];

  const faqs = [
    {
      q: "Why do kids love learning with Rafiq?",
      a: "Rafiq isn't like a boring lecture or a silent calculator. It behaves like a patient, playful friend who asks gentle questions, celebrates every breakthrough with stars and confetti, and encourages children to discover answers on their own without fear of making mistakes.",
    },
    {
      q: "Does Rafiq ever give students the direct answers to homework?",
      a: "Never! Rafiq uses Socratic pedagogy. If a student is stuck, Rafiq provides progressive clues: first a conceptual hint, then a guided step, and finally a parallel twin puzzle — so the child always does the real thinking.",
    },
    {
      q: "How do young children log in without passwords?",
      a: "Kids don't need emails or complex passwords. Every student gets a colorful card with a simple code (like S-ZJD0-1BXZ-40). They type their code once and start learning instantly!",
    },
    {
      q: "How is student privacy and safety guaranteed?",
      a: "In compliance with Section 10 of the PRD, student names and private data are never sent to external AI providers. All chats are monitored for student well-being and safety, with instant alerts for teachers.",
    },
    {
      q: "Which school grades and curriculums are supported?",
      a: "Rafiq supports the Saudi Ministry of Education curriculum, American Common Core & NGSS, and Cambridge IGCSE for Math, Science, and English.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-neutral-900 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-900 antialiased relative overflow-hidden">
      {/* Floating Cloud & Sparkle Background Decors */}
      <div className="absolute top-10 left-8 w-64 h-64 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 rounded-full bg-sky-200/35 blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] left-1/3 w-96 h-96 rounded-full bg-emerald-200/25 blur-3xl pointer-events-none" />

      {/* 1. Cheerful Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b-2 border-amber-200/70 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <RafiqMascot size="sm" expression="waving" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-neutral-900">
                  Rafiq
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Kids MVP
                </span>
              </div>
              <span className="text-xs font-black text-amber-600 font-sans tracking-wide" dir="rtl">
                رفيق • صديقك الذكي والمرح
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Fun Badges */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-black text-neutral-700">
            <a
              href="#simulator"
              className="hover:text-amber-600 transition-colors flex items-center gap-1.5"
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Play Socratic Chat</span>
            </a>
            <a
              href="#demo"
              className="hover:text-amber-600 transition-colors flex items-center gap-1.5"
            >
              <Star className="h-4 w-4 text-sky-500 fill-sky-500" />
              <span>1-Click Personas</span>
            </a>
            <a
              href="#how-it-works"
              className="hover:text-amber-600 transition-colors flex items-center gap-1.5"
            >
              <Rocket className="h-4 w-4 text-emerald-500" />
              <span>How It Works</span>
            </a>
            <a
              href="#curriculum"
              className="hover:text-amber-600 transition-colors"
            >
              Curriculums
            </a>
            <a
              href="#faq"
              className="hover:text-amber-600 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Try Demo Roles</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-neutral-900 bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 shadow-md transition-all hover:scale-102"
            >
              <span>Enter with Code</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Matching Concept 1 (Playful Mascot & Vibrant Colors) */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Arabic, and Chunky 3D Action Buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Encouraging Vision Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-amber-300 text-amber-800 text-xs sm:text-sm font-black shadow-sm"
              >
                <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-ping" />
                <span>🇸🇦 Saudi Vision 2030 • Socratic AI Learning Adventure</span>
              </motion.div>

              {/* Cheerful Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-[1.12]"
              >
                Learning is Fun When You{" "}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                  Discover Answers
                </span>{" "}
                Yourself! 🚀
              </motion.h1>

              {/* Arabic Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-2xl sm:text-3xl font-black text-amber-700 font-sans tracking-wide"
                dir="rtl"
              >
                رفيق • رفيقك الذكي والمرح في الدراسة والتفوق
              </motion.p>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
              >
                Rafiq is the patient AI study buddy that guides kids step-by-step through homework with gentle Socratic clues. No direct answers given away — just confidence, understanding, and fun!
              </motion.p>

              {/* Chunky 3D Action Buttons (Duolingo Press Effect) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <a
                  href="#simulator"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black text-neutral-950 bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 shadow-lg hover:shadow-xl transition-all"
                >
                  <Zap className="h-5 w-5 text-neutral-900 fill-neutral-900" />
                  <span>Play Socratic Chat 🎮</span>
                </a>

                <a
                  href="#demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-black text-white bg-sky-500 hover:bg-sky-400 border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 shadow-lg hover:shadow-xl transition-all"
                >
                  <Star className="h-5 w-5 text-amber-200 fill-amber-200" />
                  <span>1-Click Explorer Roles ⭐</span>
                </a>
              </motion.div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-black text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Zero Student PII to LLMs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-indigo-500" />
                  <span>No Passwords or Emails Needed</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>100% Socratic Inquiry</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Mascot Spotlight & Visual Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative w-full max-w-md p-6 rounded-3xl bg-white border-4 border-amber-300 shadow-2xl space-y-4"
              >
                {/* Floating Mascot Header Badge */}
                <div className="flex items-center justify-between bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <RafiqMascot size="sm" expression="waving" />
                    <div>
                      <h4 className="text-sm font-black text-neutral-900">Rafiq Mascot</h4>
                      <p className="text-[11px] font-bold text-amber-600">Always Cheerful & Ready!</p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Online 🟢
                  </span>
                </div>

                {/* Concept 1 Hero Visual Embed */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 shadow-inner group">
                  <img
                    src="/images/rafiq-hero.jpg"
                    alt="Rafiq - The Fun Socratic AI Study Companion Hero"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl text-center shadow-md">
                    <p className="text-xs font-black text-neutral-900">
                      Concept 1: Playful Learning Adventure ⭐
                    </p>
                  </div>
                </div>

                {/* 3 Metric Pills with AnimatedCounter */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-lg font-black text-amber-600">
                      <AnimatedCounter value={100} duration={1.2} suffix="%" />
                    </span>
                    <p className="text-[10px] font-black text-neutral-600">Socratic</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-lg font-black text-sky-600">
                      <AnimatedCounter value={3} duration={0.8} />
                    </span>
                    <p className="text-[10px] font-black text-neutral-600">Curriculums</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-lg font-black text-emerald-600">0 Leak</span>
                    <p className="text-[10px] font-black text-neutral-600">Private</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Socratic Chat Simulator (Playful Duolingo / Khan Kids style) */}
      <section id="simulator" className="py-20 bg-white border-y-4 border-amber-200 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-300">
              🎮 Live Socratic Quest Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900">
              Try Rafiq's Guiding Clues Right Here!
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-medium">
              Pick a subject and click the fun buttons below to see how Rafiq helps kids reach the breakthrough without spoiling the answer.
            </p>
          </div>

          {/* Subject Switcher Tabs (Chunky 3D Buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => {
                setSelectedSubject("math");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                selectedSubject === "math"
                  ? "bg-amber-400 text-neutral-950 border-b-4 border-amber-600 shadow-md translate-y-0"
                  : "bg-white text-neutral-700 border-2 border-neutral-200 hover:bg-neutral-50 shadow-xs"
              }`}
            >
              <Calculator className="h-4 w-4 text-amber-700" />
              <span>Math Quest: 4x - 5 = 19</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("science");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                selectedSubject === "science"
                  ? "bg-emerald-500 text-white border-b-4 border-emerald-700 shadow-md translate-y-0"
                  : "bg-white text-neutral-700 border-2 border-neutral-200 hover:bg-neutral-50 shadow-xs"
              }`}
            >
              <FlaskConical className="h-4 w-4 text-emerald-600" />
              <span>Science Lab: Photosynthesis</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("english");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                selectedSubject === "english"
                  ? "bg-sky-500 text-white border-b-4 border-sky-700 shadow-md translate-y-0"
                  : "bg-white text-neutral-700 border-2 border-neutral-200 hover:bg-neutral-50 shadow-xs"
              }`}
            >
              <BookOpen className="h-4 w-4 text-sky-600" />
              <span>Language Magic: Irregular Verbs</span>
            </button>
          </div>

          {/* Chat Window Frame (Rounded 3D Window) */}
          <div className="rounded-3xl border-4 border-amber-300 bg-[#FFFDF7] shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className={`px-6 py-4 bg-gradient-to-r ${currentScenario.headerColor} text-neutral-900 flex items-center justify-between`}>
              <div className="flex items-center gap-3.5">
                <RafiqMascot size="sm" expression="happy" />
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    {currentScenario.title}
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-white/80 text-neutral-900 border border-neutral-300">
                      {currentScenario.grade}
                    </span>
                  </h3>
                  <p className="text-xs font-extrabold text-neutral-800/80 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Rafiq Socratic Tutor Active • Step-by-Step Clues</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatSteps(1)}
                className="p-2 bg-white/80 hover:bg-white text-neutral-700 rounded-xl transition-colors shadow-2xs"
                title="Restart this quest"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="p-6 sm:p-7 space-y-4 max-h-[460px] overflow-y-auto bg-white/70">
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
                      <div className="bg-sky-500 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-md shadow-md text-sm font-bold border-b-4 border-sky-700">
                        <div className="flex items-center gap-1.5 text-[11px] font-black opacity-90 uppercase tracking-wider mb-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>Omar (Student)</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="bg-white text-neutral-850 border-2 border-amber-200 rounded-3xl rounded-tl-sm px-5.5 py-4 max-w-lg shadow-sm space-y-2.5 text-sm">
                        <div className="flex items-center gap-2 font-black text-xs">
                          {msg.isPraise ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <Trophy className="h-4 w-4 text-emerald-500" />
                              <span>Mastery Recognition • أحسنت يا بطل! 🌟</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-700">
                              <RafiqMascot size="sm" expression="waving" />
                              <span>Rafiq Friendly Tutor</span>
                            </div>
                          )}
                        </div>
                        <p className="leading-relaxed text-neutral-900 font-bold">
                          {msg.text}
                        </p>
                        {msg.mathFormula && (
                          <div className="p-3 bg-amber-50 rounded-2xl text-center font-mono font-black text-amber-900 text-base border-2 border-amber-200">
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
                  <div className="bg-white border-2 border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-2 text-neutral-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Actions Bar with Chunky Buttons */}
            <div className="p-5 bg-amber-50/70 border-t-2 border-amber-200 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span>Click a student reply to test the Socratic clue:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {currentScenario.interactivePrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.actionStep + 1)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-white hover:bg-amber-100 text-neutral-900 border-2 border-amber-300 border-b-4 border-b-amber-400 active:border-b-2 active:translate-y-0.5 transition-all shadow-xs"
                    >
                      <Icon className="h-4 w-4 text-amber-600" />
                      <span>{prompt.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setChatSteps(1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Quest</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 1-Click Interactive Persona Studio */}
      <section id="demo" className="py-24 bg-[#FFFDF7] border-b-4 border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-300">
              🌟 1-Click Interactive Explorer Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900">
              Launch Any Role With One Click!
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-medium">
              No registration or setup needed. Click any card below to test the live cloud database with pre-loaded classes, assignments, and student achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoRoles.map((item) => {
              const Icon = item.icon;
              const isLoading = loggingInRole === item.role;

              return (
                <div
                  key={item.role}
                  className={`rounded-3xl border-3 ${item.cardBorder} p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-xs">
                        <Icon className="h-6 w-6 text-neutral-900" />
                      </div>
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-neutral-100 border-2 border-neutral-200 text-neutral-800">
                        {item.code}
                      </span>
                    </div>

                    <div>
                      <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                      <h3 className="text-lg font-black text-neutral-900 mt-2">
                        {item.name}
                      </h3>
                      <p className="text-xs font-bold text-amber-700">
                        {item.title}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      {item.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 pt-3 border-t border-neutral-100">
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Chunky Launch Button */}
                  <div className="pt-6">
                    <button
                      onClick={() => handleQuickLogin(item.code, item.role)}
                      disabled={isLoading || loggingInRole !== null}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${item.color}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Entering Quest...</span>
                        </>
                      ) : (
                        <>
                          <span>Launch {item.title.split(" ")[0]} Portal</span>
                          <ArrowRight className="h-4 w-4" />
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

      {/* 5. How It Works (Bento Adventure Grid) */}
      <section id="how-it-works" className="py-24 bg-white border-b-4 border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border-2 border-emerald-300">
              🚀 How Rafiq Helps Kids Learn
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900">
              Built for Confidence, Logic & Real Mastery
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-medium">
              Generic AI spoils homework with direct answers. Rafiq is designed like a friendly tutor who scaffolds every step until the student says "I get it!"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: 3-Stage Hint Ladder */}
            <div className="md:col-span-2 rounded-3xl border-3 border-amber-300 bg-amber-50/50 p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-400 border-2 border-amber-600 text-neutral-900 flex items-center justify-center shadow-md">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900">
                  The 3-Stage "I'm Stuck" Mystery Clue Ladder
                </h3>
                <p className="text-sm text-neutral-700 max-w-xl leading-relaxed font-medium">
                  When young learners get stuck, Rafiq provides progressive clues that train logical thinking without ever revealing the final answer:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-2xl bg-white border-2 border-amber-200 shadow-2xs">
                    <span className="text-xs font-black text-amber-700">Clue 1</span>
                    <h4 className="text-sm font-black text-neutral-900 mt-1">Conceptual Spark</h4>
                    <p className="text-xs text-neutral-600 mt-1 font-medium">Reminds the student of the key rule or rule of balance.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border-2 border-teal-200 shadow-2xs">
                    <span className="text-xs font-black text-teal-700">Clue 2</span>
                    <h4 className="text-sm font-black text-neutral-900 mt-1">Guided Next Action</h4>
                    <p className="text-xs text-neutral-600 mt-1 font-medium">Breaks the problem into the single immediate next calculation.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border-2 border-purple-200 shadow-2xs">
                    <span className="text-xs font-black text-purple-700">Clue 3</span>
                    <h4 className="text-sm font-black text-neutral-900 mt-1">Twin Puzzle</h4>
                    <p className="text-xs text-neutral-600 mt-1 font-medium">Solves a twin problem with altered numbers so the child solves their own.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 4-Tier Star Mastery */}
            <div className="rounded-3xl border-3 border-emerald-300 bg-emerald-50/50 p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500 border-2 border-emerald-700 text-white flex items-center justify-center shadow-md">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900">
                  Star Mastery Ratings
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                  Upon finishing a mission, Rafiq evaluates student logic with positive feedback and clear next steps:
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800 bg-emerald-100 p-2.5 rounded-xl border border-emerald-300">
                    <span>⭐⭐⭐⭐ Super Star Mastered</span>
                    <span>100%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-black text-sky-800 bg-sky-100 p-2.5 rounded-xl border border-sky-300">
                    <span>⭐⭐⭐ Rising Star (Proficient)</span>
                    <span>85%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-black text-amber-800 bg-amber-100 p-2.5 rounded-xl border border-amber-300">
                    <span>⭐⭐ Trailblazer (Developing)</span>
                    <span>65%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Zero Student PII Privacy */}
            <div className="rounded-3xl border-3 border-sky-300 bg-sky-50/50 p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-500 border-2 border-sky-700 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-900">
                  Zero Student PII to LLMs
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                  Student names, school IDs, and private details are never passed to external AI models.
                </p>
                <ul className="text-xs space-y-2 text-neutral-700 pt-2 font-bold">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Passwordless Crockford Card Codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>No Third-Party AI Model Training</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Tenant-Isolated Database Schemas</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 4: Excel Batch Roster Import */}
            <div className="md:col-span-2 rounded-3xl border-3 border-indigo-300 bg-gradient-to-br from-indigo-900 to-neutral-950 text-white p-8 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit text-xs font-black text-amber-300">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>4-Step Roster Wizard for Principals</span>
                </div>
                <h3 className="text-2xl font-black">
                  Enroll 500+ Students in Under 10 Seconds
                </h3>
                <p className="text-sm text-neutral-300 max-w-xl leading-relaxed font-medium">
                  School administrators can drop their existing school Excel (.xlsx) file, preview classes and students with automated validation, and print out cute card credentials instantly.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <span className="font-black text-amber-300">Step 1</span>
                    <p className="text-neutral-200 mt-1">Download Template</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <span className="font-black text-emerald-300">Step 2</span>
                    <p className="text-neutral-200 mt-1">Upload & Validate</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <span className="font-black text-sky-300">Step 3</span>
                    <p className="text-neutral-200 mt-1">Preview & Commit</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                    <span className="font-black text-pink-300">Step 4</span>
                    <p className="text-neutral-200 mt-1">Print Cute Cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Curriculums Supported */}
      <section id="curriculum" className="py-20 bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-4 py-1.5 rounded-full border-2 border-purple-300">
              📚 Curriculum Alignment
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900">
              Tailored for Leading School Frameworks
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              Rafiq’s pedagogical prompt engine adjusts dynamically to match curriculum terminologies and national educational standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border-3 border-amber-300 space-y-3.5 shadow-sm">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                National Standard 🇸🇦
              </span>
              <h3 className="text-lg font-black text-neutral-900">
                Saudi Ministry of Education
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                Full alignment with Saudi standard textbooks, learning outcomes, and bilingual terminology for middle and high school grades.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border-3 border-emerald-300 space-y-3.5 shadow-sm">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                American Standard 🇺🇸
              </span>
              <h3 className="text-lg font-black text-neutral-900">
                Common Core & NGSS
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                Grade-level standards for Math, Next Generation Science Standards (NGSS), and AP-track analytical reasoning frameworks.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border-3 border-sky-300 space-y-3.5 shadow-sm">
              <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                British Framework 🇬🇧
              </span>
              <h3 className="text-lg font-black text-neutral-900">
                Cambridge International (IGCSE)
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                Structured inquiry for Cambridge Lower Secondary and IGCSE examination preparation in Sciences and Mathematics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Cheerful FAQ Accordion */}
      <section id="faq" className="py-20 bg-white border-t-4 border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-neutral-900">
              Frequently Asked Questions 🤔
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              Everything kids, parents, and educators need to know about Rafiq.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-black text-sm text-neutral-900 hover:text-amber-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-700 leading-relaxed border-t border-amber-200/80 pt-3 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner (Joyful Yellow Gradient) */}
      <section className="py-20 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-neutral-950 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <RafiqMascot size="lg" expression="celebrating" className="mx-auto mb-2" />
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Start Your Learning Adventure?
          </h2>
          <p className="text-base sm:text-lg text-neutral-900 max-w-2xl mx-auto font-bold">
            Test the live student AI chat, teacher mission control, and school spreadsheets right now with 1 click.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black bg-white text-neutral-900 border-b-4 border-neutral-300 hover:bg-neutral-50 active:border-b-0 active:translate-y-1 shadow-xl transition-all"
            >
              Choose a Character Above ⭐
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black bg-neutral-950 text-white border-b-4 border-neutral-800 hover:bg-neutral-900 active:border-b-0 active:translate-y-1 shadow-xl transition-all"
            >
              Enter with Card Code 🔑
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Cheerful Footer */}
      <footer className="bg-neutral-950 text-neutral-400 text-xs py-14 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <RafiqMascot size="sm" expression="waving" />
            <div>
              <p className="text-sm font-black text-white">Rafiq • رفيق</p>
              <p className="text-[11px] text-neutral-400 font-medium">The Socratic AI Study Companion for Kids & Schools</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-bold">
            <a href="#simulator" className="hover:text-amber-400 transition-colors">Socratic Chat</a>
            <a href="#demo" className="hover:text-amber-400 transition-colors">Demo Roles</a>
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a>
            <a href="#curriculum" className="hover:text-amber-400 transition-colors">Curriculums</a>
            <Link href="/login" className="hover:text-amber-400 transition-colors">Portal Login</Link>
          </div>

          <p className="text-[11px] text-neutral-400 font-medium">
            &copy; 2026 Rafiq MVP. All rights reserved. Built for Saudi Vision 2030.
          </p>
        </div>
      </footer>
    </div>
  );
}
