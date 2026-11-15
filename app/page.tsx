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
  Sparkles,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Building2,
  BarChart3,
  CheckCircle2,
  Calculator,
  FlaskConical,
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
  Star,
  ArrowRight,
  Trophy,
  Rocket,
  Globe,
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
      dialogue: ChatScenarioStep[];
      interactivePrompts: { label: string; actionStep: number; icon: any }[];
    }
  > = {
    math: {
      title: "Math Adventure: Two-Step Equations",
      grade: "Grade 6 • Algebra",
      subjectIcon: Calculator,
      dialogue: [
        {
          sender: "rafiq",
          text: "Hey Omar! 🌟 Let's solve 4x - 5 = 19 together! What happens if we add 5 to both sides?",
          mathFormula: "4x - 5 = 19",
        },
        {
          sender: "student",
          text: "Can you just give me the answer directly please?",
        },
        {
          sender: "rafiq",
          text: "I want you to discover the joy of uncovering it yourself! Look at 4x - 5 = 19. What operation cancels out subtracting 5?",
        },
        {
          sender: "student",
          text: "We add 5 to both sides of the balance scale!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "YAY! أحسنت يا عمر! Spot on! When we add 5 to both sides: 19 + 5 = 24, giving 4x = 24. What is your final step to isolate x?",
          mathFormula: "4x = 24 \\implies x = 6",
        },
      ],
      interactivePrompts: [
        { label: "Give Me a Hint!", actionStep: 2, icon: HelpCircle },
        { label: "Show Me a Clue", actionStep: 3, icon: Lightbulb },
        { label: "Add 5 to both sides! ⭐", actionStep: 4, icon: Star },
      ],
    },
    science: {
      title: "Science Discovery: Photosynthesis Power",
      grade: "Grade 7 • Biology",
      subjectIcon: FlaskConical,
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
          text: "The cell wall keeps the cell strong, but look at that emerald green pigment called chlorophyll! Which organelle houses it?",
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
        { label: "Give Me a Hint!", actionStep: 2, icon: HelpCircle },
        { label: "Show Me a Clue", actionStep: 3, icon: Lightbulb },
        { label: "Chloroplasts absorb light! ⭐", actionStep: 4, icon: Star },
      ],
    },
    english: {
      title: "Language Magic: Irregular Past Verbs",
      grade: "Grade 6 • Grammar Adventure",
      subjectIcon: BookOpen,
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
          text: "Super smart guess! But 'catch' has an irregular sound shift, just like 'teach' becomes 'taught'. Can you hear the rhyme?",
        },
        {
          sender: "student",
          text: "I caught the ball!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "YES! أحسنت يا خالد! 🏆 'Catch' becomes 'caught' (C-A-U-G-H-T). You mastered the vowel shift pattern!",
        },
      ],
      interactivePrompts: [
        { label: "Give Me a Hint!", actionStep: 2, icon: HelpCircle },
        { label: "Show Me a Clue", actionStep: 3, icon: Lightbulb },
        { label: "I caught the ball! ⭐", actionStep: 4, icon: Star },
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
      btnColor: "bg-[#FFC72C] hover:bg-[#F2B81A] text-[#1E293B]",
      accent: "text-amber-600",
      badge: "Student Quest",
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
      btnColor: "bg-[#38BDF8] hover:bg-[#0EA5E9] text-white",
      accent: "text-sky-600",
      badge: "Teacher Control",
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
      btnColor: "bg-[#A855F7] hover:bg-[#9333EA] text-white",
      accent: "text-purple-600",
      badge: "School Captain",
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
      btnColor: "bg-[#1E293B] hover:bg-[#0F172A] text-white",
      accent: "text-slate-700",
      badge: "Platform Ops",
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
    <div className="min-h-screen bg-gradient-to-b from-[#85C9EE] via-[#BAE3F9] to-[#E8F6FD] text-[#1E293B] flex flex-col font-sans selection:bg-[#FFC72C] selection:text-[#1E293B] antialiased relative overflow-hidden">
      {/* 3D Floating Clouds & Candy Sparkle Shapes */}
      <div className="absolute top-12 left-10 w-72 h-36 rounded-full bg-white/40 blur-2xl pointer-events-none" />
      <div className="absolute top-48 right-12 w-96 h-48 rounded-full bg-white/45 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[600px] h-60 rounded-full bg-white/60 blur-3xl pointer-events-none" />

      {/* 1. Exact Floating White Pill Top Navbar */}
      <header className="sticky top-4 z-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-full bg-white/95 backdrop-blur-md shadow-[0_12px_36px_rgba(56,189,248,0.18)] px-5 sm:px-7 py-3 flex items-center justify-between border border-white/80 transition-all">
          {/* Logo matching the mockup */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/rafiq-avatar.png"
              alt="Rafiq"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl shadow-xs object-cover group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#1E293B] tracking-tight leading-none">
                Rafiq
              </span>
              <span className="text-xs font-black text-[#1E293B] leading-none mt-1" dir="rtl">
                رفيق
              </span>
            </div>
          </Link>

          {/* Center Navigation Pills (Exact as Mockup) */}
          <nav className="hidden md:flex items-center gap-2">
            <a
              href="#missions"
              className="px-4 py-2 rounded-full bg-[#EDF5FF] hover:bg-[#DEECFF] text-[#2D3F5C] font-extrabold text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>🌐</span>
              <span>Missions</span>
            </a>
            <a
              href="#subjects"
              className="px-4 py-2 rounded-full bg-[#EDF5FF] hover:bg-[#DEECFF] text-[#2D3F5C] font-extrabold text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>📚</span>
              <span>Subjects</span>
            </a>
            <a
              href="#badges"
              className="px-4 py-2 rounded-full bg-[#EDF5FF] hover:bg-[#DEECFF] text-[#2D3F5C] font-extrabold text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>🏅</span>
              <span>Badges</span>
            </a>
          </nav>

          {/* Right Golden Yellow CTA (Exact as Mockup) */}
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full bg-[#EBF5FF] hover:bg-[#DDEBFC] text-[#1E293B] transition-all"
            >
              <span>⭐</span>
              <span>Demo Roles</span>
            </a>

            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-[#FFC72C] hover:bg-[#F2B81A] text-[#1E293B] font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Exactly Matching Concept 1 */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Exact Headline and Arabic Subtitle */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {/* Main Headline Exactly Matching the Image */}
                <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-[#1E293B] leading-[1.08]">
                  Learning is Fun<br />
                  When You<br />
                  Discover the<br />
                  Answers<br />
                  Yourself!
                </h1>

                {/* Arabic Subtitle Exactly Matching the Image */}
                <p className="text-2xl sm:text-3xl font-black text-[#1E293B] font-sans tracking-wide pt-2" dir="rtl">
                  رفيق • رفيقك الذكي والمرح في الدراسة
                </p>

                {/* Kid-Friendly Subtitle */}
                <p className="text-base sm:text-lg text-[#334155] font-bold leading-relaxed max-w-md mx-auto lg:mx-0">
                  Step-by-step Socratic clues that train your brain without spoiling homework answers!
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-black text-[#1E293B] bg-[#FFC72C] hover:bg-[#F2B81A] shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Rocket className="h-5 w-5" />
                  <span>Start Learning Now</span>
                </Link>

                <a
                  href="#missions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-black text-white bg-[#38BDF8] hover:bg-[#0EA5E9] shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="h-5 w-5" />
                  <span>Play Quest Simulator</span>
                </a>
              </motion.div>

              {/* Key Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-black text-[#334155]">
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full shadow-2xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Saudi Vision 2030 Aligned</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full shadow-2xs">
                  <Lock className="h-4 w-4 text-sky-600" />
                  <span>100% Student Privacy (Zero PII)</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full shadow-2xs">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>No Password Needed (Card Codes)</span>
                </span>
              </div>
            </div>

            {/* Right Column: Exact 3D Window + Mascot Stage from Concept 1 */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative w-full max-w-lg select-none"
              >
                {/* The Exact Clean Hero Stage from Concept 1 Image */}
                <div className="relative rounded-[36px] overflow-hidden shadow-[0_24px_60px_-10px_rgba(56,189,248,0.3)] transition-transform hover:scale-[1.02] duration-300">
                  <img
                    src="/images/hero-stage-clean.png"
                    alt="Rafiq Socratic AI Tutor & Mascot"
                    className="w-full h-auto object-cover"
                  />
                  {/* Interactive Hotspot Links overlaid on the buttons */}
                  <div className="absolute bottom-[23%] left-[7%] flex gap-2">
                    <a
                      href="#missions"
                      className="px-4 py-2 rounded-2xl bg-[#38BDF8] text-white font-black text-xs shadow-sm hover:brightness-110 active:scale-95 transition-transform"
                    >
                      Give Me a Hint!
                    </a>
                    <a
                      href="#missions"
                      className="px-4 py-2 rounded-2xl bg-[#A855F7] text-white font-black text-xs shadow-sm hover:brightness-110 active:scale-95 transition-transform"
                    >
                      Show Me a Clue
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Socratic Chat Simulator (#missions) */}
      <section id="missions" className="py-20 bg-white/85 backdrop-blur-md border-y border-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D3F5C] bg-[#EDF5FF] px-4 py-1.5 rounded-full border border-sky-200">
              🎮 Interactive Socratic Quest
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
              Experience Rafiq's Guiding Clues Right Here
            </h2>
            <p className="text-sm sm:text-base text-[#475569] font-bold">
              Select a subject and click the clue buttons below to see how Rafiq guides young minds step-by-step.
            </p>
          </div>

          {/* Subject Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => {
                setSelectedSubject("math");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition-all ${
                selectedSubject === "math"
                  ? "bg-[#FFC72C] text-[#1E293B] shadow-md scale-105"
                  : "bg-white text-[#475569] border border-sky-200 hover:bg-[#F0F8FF]"
              }`}
            >
              <Calculator className="h-4 w-4 text-[#1E293B]" />
              <span>Math Quest: 4x - 5 = 19</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("science");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition-all ${
                selectedSubject === "science"
                  ? "bg-[#38BDF8] text-white shadow-md scale-105"
                  : "bg-white text-[#475569] border border-sky-200 hover:bg-[#F0F8FF]"
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>Science Lab: Photosynthesis</span>
            </button>

            <button
              onClick={() => {
                setSelectedSubject("english");
                setChatSteps(1);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition-all ${
                selectedSubject === "english"
                  ? "bg-[#A855F7] text-white shadow-md scale-105"
                  : "bg-white text-[#475569] border border-sky-200 hover:bg-[#F0F8FF]"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>English Magic: Irregular Verbs</span>
            </button>
          </div>

          {/* Chat Window Frame in the exact Sky Blue Card style */}
          <div className="rounded-[36px] border-2 border-white bg-[#EBF5FF] shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Window Header with 3 Control Dots */}
            <div className="flex items-center justify-between pb-4 border-b border-sky-200/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
                  <span className="h-3 w-3 rounded-full bg-[#FFD93D]" />
                  <span className="h-3 w-3 rounded-full bg-[#6BCB77]" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <img
                    src="/images/rafiq-avatar.png"
                    alt="Rafiq"
                    className="h-8 w-8 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-black text-[#1E293B]">
                      {currentScenario.title}
                    </h3>
                    <p className="text-[11px] font-bold text-sky-700">
                      Grade: {currentScenario.grade} • Socratic Active
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setChatSteps(1)}
                className="p-2 bg-white text-[#475569] hover:text-[#1E293B] rounded-full transition-colors shadow-2xs"
                title="Restart quest"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
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
                      <div className="bg-[#38BDF8] text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-md shadow-md text-sm font-bold">
                        <div className="flex items-center gap-1.5 text-[11px] font-black opacity-90 uppercase tracking-wider mb-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>Omar (Student)</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="bg-white text-[#1E293B] rounded-3xl rounded-tl-sm px-5.5 py-4 max-w-lg shadow-sm space-y-2.5 text-sm border border-sky-100">
                        <div className="flex items-center gap-2 font-black text-xs">
                          {msg.isPraise ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              <Trophy className="h-4 w-4 text-emerald-500" />
                              <span>Mastery Recognition • أحسنت يا بطل! 🌟</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sky-700">
                              <img
                                src="/images/rafiq-avatar.png"
                                alt="Rafiq"
                                className="h-5 w-5 rounded-md object-cover"
                              />
                              <span>Rafiq Socratic Tutor</span>
                            </div>
                          )}
                        </div>
                        <p className="leading-relaxed font-bold">
                          {msg.text}
                        </p>
                        {msg.mathFormula && (
                          <div className="p-3 bg-[#F0F8FF] rounded-2xl text-center font-mono font-black text-[#1E293B] text-base border border-sky-200">
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
                  <div className="bg-white border border-sky-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-2 text-neutral-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8] animate-bounce" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8] animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar (Exact as Concept 1 buttons and Star step bar) */}
            <div className="pt-4 border-t border-sky-200/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {currentScenario.interactivePrompts.map((prompt, idx) => {
                    const btnClass =
                      idx === 0
                        ? "bg-[#38BDF8] text-white hover:bg-[#0EA5E9]"
                        : idx === 1
                        ? "bg-[#A855F7] text-white hover:bg-[#9333EA]"
                        : "bg-[#FFC72C] text-[#1E293B] hover:bg-[#F2B81A]";

                    return (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(prompt.actionStep + 1)}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 ${btnClass}`}
                      >
                        {prompt.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setChatSteps(1)}
                  className="text-xs font-bold text-[#475569] hover:text-[#1E293B] transition-colors"
                >
                  Reset Quest
                </button>
              </div>

              {/* Exact Star Progress Bar Matching Concept 1 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">⭐</span>
                  <span className="text-xs font-black text-[#1E293B]">Step 1</span>
                </div>
                <div className={`h-1.5 w-14 rounded-full transition-colors ${chatSteps >= 2 ? "bg-emerald-400" : "bg-neutral-200"}`} />
                <div className="flex items-center gap-2">
                  <span className={`text-lg transition-colors ${chatSteps >= 3 ? "text-amber-400" : "text-neutral-300"}`}>⭐</span>
                  <span className="text-xs font-black text-[#1E293B]">Step 2</span>
                </div>
                <div className={`h-1.5 w-14 rounded-full transition-colors ${chatSteps >= 4 ? "bg-emerald-400" : "bg-neutral-200"}`} />
                <div className="flex items-center gap-2">
                  <span className={`text-lg transition-colors ${chatSteps >= 4 ? "text-emerald-500" : "text-neutral-300"}`}>✅</span>
                  <span className="text-xs font-black text-emerald-700">Solved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 1-Click Interactive Persona Studio (#demo) */}
      <section id="demo" className="py-20 bg-gradient-to-b from-white/90 to-[#E8F6FD] border-b border-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-4 py-1.5 rounded-full border border-sky-300">
              ⭐ 1-Click Explorer Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
              Launch Any Role With One Click
            </h2>
            <p className="text-sm sm:text-base text-[#475569] font-bold">
              No registration or passwords required. Choose any role below to explore the live cloud database instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoRoles.map((item) => {
              const Icon = item.icon;
              const isLoading = loggingInRole === item.role;

              return (
                <div
                  key={item.role}
                  className="rounded-3xl border-2 border-white bg-white/90 p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(56,189,248,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-[#EDF5FF] flex items-center justify-center shadow-xs">
                        <Icon className="h-6 w-6 text-[#1E293B]" />
                      </div>
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-[#F0F8FF] border border-sky-200 text-[#1E293B]">
                        {item.code}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EDF5FF] text-[#1E293B]">
                        {item.badge}
                      </span>
                      <h3 className="text-lg font-black text-[#1E293B] mt-2">
                        {item.name}
                      </h3>
                      <p className={`text-xs font-bold ${item.accent}`}>
                        {item.title}
                      </p>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed font-bold">
                      {item.description}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-neutral-100">
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-[#334155]">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleQuickLogin(item.code, item.role)}
                      disabled={isLoading || loggingInRole !== null}
                      className={`w-full py-3 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:scale-105 active:scale-95 ${item.btnColor}`}
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

      {/* 5. Subjects Explorer (#subjects) */}
      <section id="subjects" className="py-20 bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-4 py-1.5 rounded-full border border-sky-300">
              📚 Curriculum & Subjects
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
              Aligned for Saudi & Global School Excellence
            </h2>
            <p className="text-sm text-[#475569] font-bold">
              Rafiq dynamically adapts to standard terminology and pedagogical objectives across core subjects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#EDF5FF] p-7 rounded-[32px] border-2 border-white space-y-3.5 shadow-sm">
              <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                National Standard 🇸🇦
              </span>
              <h3 className="text-lg font-black text-[#1E293B]">
                Saudi Ministry of Education
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-bold">
                Fully aligned with Saudi textbook curricula, bilingual Arabic/English scientific terms, and middle school learning outcomes.
              </p>
            </div>

            <div className="bg-[#EDF5FF] p-7 rounded-[32px] border-2 border-white space-y-3.5 shadow-sm">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                American Standard 🇺🇸
              </span>
              <h3 className="text-lg font-black text-[#1E293B]">
                Common Core & NGSS
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-bold">
                Grade-level standards for Math equations, Next Generation Science Standards (NGSS), and analytical thinking rubrics.
              </p>
            </div>

            <div className="bg-[#EDF5FF] p-7 rounded-[32px] border-2 border-white space-y-3.5 shadow-sm">
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider">
                British Framework 🇬🇧
              </span>
              <h3 className="text-lg font-black text-[#1E293B]">
                Cambridge International (IGCSE)
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-bold">
                Structured inquiry for Cambridge Lower Secondary and IGCSE examination preparation in Sciences and Mathematics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Badges & Star Achievements (#badges) */}
      <section id="badges" className="py-20 bg-gradient-to-b from-[#EDF5FF] to-white border-t border-sky-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-4 py-1.5 rounded-full border border-purple-300">
              🏅 Star Badges & Mastery
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
              Every Breakthrough is Celebrated
            </h2>
            <p className="text-sm text-[#475569] font-bold">
              Students earn star badges that reward logical thinking, trying again, and reaching mastery.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-sky-200 text-center space-y-2 shadow-sm">
              <div className="text-3xl">⭐⭐⭐⭐</div>
              <h4 className="text-sm font-black text-[#1E293B]">Super Star</h4>
              <p className="text-[11px] font-bold text-emerald-600">Exceeds Mastery (100%)</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sky-200 text-center space-y-2 shadow-sm">
              <div className="text-3xl">⭐⭐⭐</div>
              <h4 className="text-sm font-black text-[#1E293B]">Rising Star</h4>
              <p className="text-[11px] font-bold text-sky-600">Meets Standards (85%)</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sky-200 text-center space-y-2 shadow-sm">
              <div className="text-3xl">⭐⭐</div>
              <h4 className="text-sm font-black text-[#1E293B]">Trailblazer</h4>
              <p className="text-[11px] font-bold text-amber-600">Approaching (65%)</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-sky-200 text-center space-y-2 shadow-sm">
              <div className="text-3xl">⭐</div>
              <h4 className="text-sm font-black text-[#1E293B]">Practice Hero</h4>
              <p className="text-[11px] font-bold text-purple-600">Making Progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section id="faq" className="py-20 bg-white border-t border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-[#1E293B]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#475569] font-bold">
              Everything students, parents, and educators need to know about Rafiq.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-sky-200 bg-[#F9FBFF] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-black text-sm text-[#1E293B] hover:text-sky-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-sky-100 pt-3 font-bold">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Call to Action Banner (Matching Yellow Palette) */}
      <section className="py-20 bg-gradient-to-r from-[#FFC72C] via-[#FDBA12] to-[#FFC72C] text-[#1E293B] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <img
            src="/images/rafiq-avatar.png"
            alt="Rafiq"
            className="h-16 w-16 rounded-3xl mx-auto shadow-md object-cover"
          />
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Start Your Learning Adventure?
          </h2>
          <p className="text-base sm:text-lg max-w-xl mx-auto font-bold text-[#1E293B]/90">
            Join thousands of students building real mastery with step-by-step Socratic inquiry.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black bg-white text-[#1E293B] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Start Learning with Card Code 🔑
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black bg-[#1E293B] text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Try 1-Click Demo Roles ⭐
            </a>
          </div>
        </div>
      </section>

      {/* 9. Cloud-White Footer */}
      <footer className="bg-white text-[#475569] text-xs py-14 border-t border-sky-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/rafiq-avatar.png"
              alt="Rafiq"
              className="h-10 w-10 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-black text-[#1E293B]">Rafiq • رفيق</p>
              <p className="text-[11px] font-bold text-[#64748B]">The Socratic AI Study Companion for Saudi & Global Schools</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-bold">
            <a href="#missions" className="hover:text-sky-600 transition-colors">Missions</a>
            <a href="#subjects" className="hover:text-sky-600 transition-colors">Subjects</a>
            <a href="#badges" className="hover:text-sky-600 transition-colors">Badges</a>
            <a href="#demo" className="hover:text-sky-600 transition-colors">Demo Roles</a>
            <Link href="/login" className="hover:text-sky-600 transition-colors">Portal Login</Link>
          </div>

          <p className="text-[11px] font-bold text-[#64748B]">
            &copy; 2026 Rafiq MVP. All rights reserved. Built for Saudi Vision 2030.
          </p>
        </div>
      </footer>
    </div>
  );
}
