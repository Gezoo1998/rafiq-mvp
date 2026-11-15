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
  ArrowLeft,
  Trophy,
  Rocket,
  Globe,
  Play,
  Phone,
  MapPin,
  Mail,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface ChatScenarioStep {
  sender: "student" | "rafiq";
  text: string;
  mathFormula?: string;
  isPraise?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  // Language toggle: default "ar" as requested ("واهتم بالنسخة العربية"), with instant switch to "en"
  const [lang, setLang] = React.useState<"ar" | "en">("ar");
  const [loggingInRole, setLoggingInRole] = React.useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<"math" | "science" | "english">("math");
  const [chatSteps, setChatSteps] = React.useState<number>(1);
  const [isTyping, setIsTyping] = React.useState(false);
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);

  const isAr = lang === "ar";

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
        alert(
          data.error?.message ||
            (isAr
              ? "تعذر تسجيل الدخول بالرمز التجريبي. يرجى التحقق من الاتصال."
              : "Could not log in with demo code. Please verify database connection.")
        );
        setLoggingInRole(null);
      }
    } catch {
      alert(
        isAr
          ? "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت."
          : "Network error. Please check your connection."
      );
      setLoggingInRole(null);
    }
  };

  // Interactive Live Chat Simulator Scenarios (Bilingual AR / EN)
  const scenarios: Record<
    "math" | "science" | "english",
    {
      title: string;
      titleAr: string;
      grade: string;
      gradeAr: string;
      subjectIcon: any;
      dialogueEn: ChatScenarioStep[];
      dialogueAr: ChatScenarioStep[];
      interactivePromptsEn: { label: string; actionStep: number; icon: any }[];
      interactivePromptsAr: { label: string; actionStep: number; icon: any }[];
    }
  > = {
    math: {
      title: "Math: Two-Step Equations",
      titleAr: "الرياضيات: معادلات من خطوتين",
      grade: "Grade 6 • Algebra",
      gradeAr: "الصف السادس • الجبر",
      subjectIcon: Calculator,
      dialogueEn: [
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
      dialogueAr: [
        {
          sender: "rafiq",
          text: "مرحباً يا عمر! 🌟 هيا نحل المعادلة 4x - 5 = 19 معاً! ماذا يحدث عندما نضيف 5 لكلا الطرفين؟",
          mathFormula: "4x - 5 = 19",
        },
        {
          sender: "student",
          text: "هل يمكنك إعطائي الإجابة مباشرة من فضلك؟",
        },
        {
          sender: "rafiq",
          text: "أريدك أن تكتشف سر الحل بنفسك يا بطل! انظر إلى (طرح 5). ما هي العملية المعاكسة التي تلغي الطرح وتزن المعادلة؟",
        },
        {
          sender: "student",
          text: "نضيف 5 إلى كلا الطرفين في كفتي الميزان!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "ممتاز جداً يا عمر! 🌟 أحسنت! بإضافة 5 للطرفين: 19 + 5 = 24، فتصبح 4x = 24. ما هي الخطوة الأخيرة لإيجاد قيمة x؟",
          mathFormula: "4x = 24 \\implies x = 6",
        },
      ],
      interactivePromptsEn: [
        { label: "Give Me a Hint!", actionStep: 2, icon: HelpCircle },
        { label: "Show Me a Clue", actionStep: 3, icon: Lightbulb },
        { label: "Add 5 to both sides! ⭐", actionStep: 4, icon: Star },
      ],
      interactivePromptsAr: [
        { label: "أعطني تلميحاً ذكياً!", actionStep: 2, icon: HelpCircle },
        { label: "أرني الخطوة التالية", actionStep: 3, icon: Lightbulb },
        { label: "نضيف 5 للطرفين! ⭐", actionStep: 4, icon: Star },
      ],
    },
    science: {
      title: "Science: Photosynthesis Power",
      titleAr: "العلوم: أسرار البناء الضوئي",
      grade: "Grade 7 • Biology",
      gradeAr: "الصف الأول متوسط • الأحياء",
      subjectIcon: FlaskConical,
      dialogueEn: [
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
      dialogueAr: [
        {
          sender: "rafiq",
          text: "أهلاً يا سارة! 🌿 النباتات تصنع غذاءها باستخدام ضوء الشمس. ما هو المصنع الأخضر داخل الخلية النباتية الذي يمتص الطاقة الشمسية؟",
          mathFormula: "6CO_2 + 6H_2O \\xrightarrow{\\text{ضوء الشمس}} C_6H_{12}O_6 + 6O_2",
        },
        {
          sender: "student",
          text: "هل هو جدار الخلية؟",
        },
        {
          sender: "rafiq",
          text: "جدار الخلية يحميها، ولكن تذكري الصبغة الخضراء (الكلوروفيل)! أين توجد هذه الصبغة التي تمتص الفوتونات؟",
        },
        {
          sender: "student",
          text: "البلاستيدات الخضراء تمتص الضوء!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "رائعة يا سارة! 🌟 إجابة علمية متقنة! تقوم البلاستيدات الخضراء بتحويل الضوء والماء وثاني أكسيد الكربون إلى سكر الجلوكوز والأكسجين!",
        },
      ],
      interactivePromptsEn: [
        { label: "Give Me a Hint!", actionStep: 2, icon: HelpCircle },
        { label: "Show Me a Clue", actionStep: 3, icon: Lightbulb },
        { label: "Chloroplasts absorb light! ⭐", actionStep: 4, icon: Star },
      ],
      interactivePromptsAr: [
        { label: "أعطني تلميحاً", actionStep: 2, icon: HelpCircle },
        { label: "توضيح الصبغة الخضراء", actionStep: 3, icon: Lightbulb },
        { label: "البلاستيدات الخضراء! ⭐", actionStep: 4, icon: Star },
      ],
    },
    english: {
      title: "Language Magic: Irregular Verbs",
      titleAr: "اللغة الإنجليزية: تصريف الأفعال الشاذة",
      grade: "Grade 6 • Grammar Adventure",
      gradeAr: "الصف السادس • قواعد اللغة الإنجليزية",
      subjectIcon: BookOpen,
      dialogueEn: [
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
      dialogueAr: [
        {
          sender: "rafiq",
          text: "مرحباً يا خالد! 🎈 في اللغة الإنجليزية تتغير بعض الأفعال الشاذة كلياً في صيغة الماضي. ما هو الماضي من الفعل 'catch' في جملة: 'I catch the ball'؟",
        },
        {
          sender: "student",
          text: "هل نقول I catched the ball؟",
        },
        {
          sender: "rafiq",
          text: "محاولة ذكية جداً! ولكن الفعل catch غير منتظم ويشبه الفعل teach الذي يتحول إلى taught. هل تتذكر النغمة الصوتية؟",
        },
        {
          sender: "student",
          text: "نقول: I caught the ball!",
        },
        {
          sender: "rafiq",
          isPraise: true,
          text: "أصبت الهدف يا بطل! 🏆 أحسنت! الفعل يتحول إلى 'caught' (تُنطق كوت). لقد أتقنت قاعدة التصريف بنجاح!",
        },
      ],
      interactivePromptsEn: [
        { label: "Give Me a Hint!", actionStep: 2, icon: HelpCircle },
        { label: "Show Me a Clue", actionStep: 3, icon: Lightbulb },
        { label: "I caught the ball! ⭐", actionStep: 4, icon: Star },
      ],
      interactivePromptsAr: [
        { label: "أعطني تلميحاً", actionStep: 2, icon: HelpCircle },
        { label: "أرني قاعدة النغمة", actionStep: 3, icon: Lightbulb },
        { label: "I caught the ball! ⭐", actionStep: 4, icon: Star },
      ],
    },
  };

  const currentScenario = scenarios[selectedSubject];
  const dialogue = isAr ? currentScenario.dialogueAr : currentScenario.dialogueEn;
  const interactivePrompts = isAr
    ? currentScenario.interactivePromptsAr
    : currentScenario.interactivePromptsEn;

  const handlePromptClick = (targetStep: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setChatSteps(targetStep);
      setIsTyping(false);
      if (targetStep >= dialogue.length) {
        triggerCelebrationConfetti();
      }
    }, 350);
  };

  // Demo Roles
  const demoRoles = [
    {
      role: "student",
      name: isAr ? "عمر العتيبي" : "Omar Al-Otaibi",
      title: isAr ? "طالب مستكشف (الصف 6-أ)" : "Student Explorer (Class 6A)",
      code: "S-ZJD0-1BXZ-40",
      icon: GraduationCap,
      color: "from-blue-600 to-indigo-600",
      pillBg: "bg-blue-50 text-blue-700 border-blue-200",
      badge: isAr ? "بوابة الطالب" : "Student Quest",
      description: isAr
        ? "محادثة سقراطية ممتعة مع رفيق الذكي! أسئلة توجيهية، تلميحات تدريجية، حل معادلات ومسائل دون كشف الإجابات، وجمع النجوم."
        : "Chat with Rafiq your friendly AI tutor! Ask questions, unlock progressive clues, solve equations, and collect stars.",
      btnText: isAr ? "دخول فوري كطالب" : "Login as Student",
    },
    {
      role: "teacher",
      name: isAr ? "أ. هدى الغامدي" : "Ms. Huda Al-Ghamdi",
      title: isAr ? "معلمة الرياضيات المتميزة" : "Math Guide & Teacher",
      code: "T-W05C-X6TS-PG",
      icon: BookOpen,
      color: "from-teal-600 to-emerald-600",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: isAr ? "لوحة المعلم" : "Teacher Control",
      description: isAr
        ? "متابعة فورية لاستيعاب الفصل، خرائط المفاهيم الخاطئة قبل الاختبارات، سجل المحادثات وسلسلة أفكار الطلاب، وتصدير التقارير."
        : "Live class mastery gauges, misconception heatmaps, student thought transcripts, and instant Excel reports.",
      btnText: isAr ? "دخول فوري كمعلم" : "Login as Teacher",
    },
    {
      role: "school_admin",
      name: isAr ? "د. منى الأحمد" : "Dr. Mona Al-Ahmad",
      title: isAr ? "مديرة المدرسة" : "School Principal",
      code: "A-KBXZ-9GS6-F1",
      icon: Building2,
      color: "from-purple-600 to-violet-600",
      pillBg: "bg-purple-50 text-purple-700 border-purple-200",
      badge: isAr ? "إدارة المدرسة" : "School Captain",
      description: isAr
        ? "استيراد ملفات الإكسل المدرسية في 4 خطوات سهلة، إدارة المعلمين والفصول، وطباعة بطاقات الرموز الملونة للطلاب دون الحاجة لإيميلات."
        : "4-step Excel roster wizard, teachers & classes directory, printable physical card codes without emails or passwords.",
      btnText: isAr ? "دخول فوري كمديرة" : "Login as Principal",
    },
    {
      role: "system_admin",
      name: isAr ? "إدارة المنصة المركزية" : "System Operations",
      title: isAr ? "التحكم السحابي للمنظومة" : "Platform Command",
      code: "Y-8164-RC0Z-T4",
      icon: BarChart3,
      color: "from-slate-800 to-slate-900",
      pillBg: "bg-slate-100 text-slate-800 border-slate-300",
      badge: isAr ? "إشراف المنصة" : "Platform Ops",
      description: isAr
        ? "حوكمة المدارس المتعددة، تتبع استهلاك الرموز الذكية والتكلفة اليومية، واختبار نماذج الذكاء الاصطناعي بسيناريوهات فورية."
        : "Multi-tenant school governance, daily AI token budgets, model health ping, and automated test scenarios.",
      btnText: isAr ? "دخول فوري للمشرف" : "Login as Ops",
    },
  ];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white antialiased relative overflow-x-hidden"
    >
      {/* 1. Header / Navbar Matching Image Exactly */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Matching Exact Image Emblem + Arabic & English Text */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <img
                src="/images/new-design/rafiq-logo.png"
                alt="Rafiq رفيق"
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  رفيق
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#2563EB] tracking-tight">
                  Rafiq
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 -mt-1 tracking-wider">
                {isAr ? "الرفيق التعليمي الذكي" : "AI Learning Companion"}
              </span>
            </div>
          </Link>

          {/* Navigation Links with Caret Drops (Exact from Image) */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#for-schools"
              className="text-sm font-bold text-slate-700 hover:text-[#2563EB] flex items-center gap-1 transition-colors"
            >
              <span>{isAr ? "للمدارس" : "For Schools"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </a>
            <a
              href="#for-students"
              className="text-sm font-bold text-slate-700 hover:text-[#2563EB] flex items-center gap-1 transition-colors"
            >
              <span>{isAr ? "لأولياء الأمور" : "For Parents"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </a>
            <a
              href="#features"
              className="text-sm font-bold text-slate-700 hover:text-[#2563EB] flex items-center gap-1 transition-colors"
            >
              <span>{isAr ? "المصادر والمميزات" : "Resources"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </a>
            <a
              href="#demo-sandbox"
              className="text-sm font-bold text-slate-700 hover:text-[#2563EB] transition-colors"
            >
              <span>{isAr ? "من نحن والتجربة" : "About Us"}</span>
            </a>
          </nav>

          {/* Right Action Buttons: Language Switcher + Royal Blue "Book a Demo ->" */}
          <div className="flex items-center gap-3">
            {/* Interactive Language Switcher Toggle */}
            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-black text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-2xs"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="h-4 w-4 text-[#2563EB]" />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>

            {/* Quick Login Shortcut */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-black text-[#2563EB] bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span>{isAr ? "دخول برمز الطالب" : "Card Login"}</span>
            </Link>

            {/* Exact Pill Button: "Book a Demo ->" in Royal Blue */}
            <a
              href="#demo-sandbox"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-sm font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>{isAr ? "احجز عرضاً تجريبياً" : "Book a Demo"}</span>
              {isAr ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Exactly Matching Concept & Image Layout */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white overflow-hidden">
        {/* Soft background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headlines & Call-to-Actions (in RTL, Right Column) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-xs font-black text-[#1D4ED8] shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#1D4ED8]" />
                  <span>
                    {isAr
                      ? "الذكاء الاصطناعي الأذكى لمدارس المملكة 🇸🇦"
                      : "Saudi Arabia's #1 AI Learning Platform 🇸🇦"}
                  </span>
                </div>

                {/* Main Headline Exactly Matching the Image */}
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#0F172A] leading-[1.12]">
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#2563EB] bg-clip-text text-transparent">
                    {isAr ? "رفيق - " : "Rafiq - "}
                  </span>
                  {isAr
                    ? "رفيقك الذكي للتعلم الممتع!"
                    : "Your AI Learning Companion!"}
                </h1>

                {/* Subtitle Matching Image */}
                <p className="text-lg sm:text-xl text-slate-600 font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {isAr
                    ? "تعليم ذكي، موجه، ومتوافق تماماً مع المناهج التعليمية لطلاب التعليم العام (K-12)"
                    : "Smart, guided, and curriculum-aligned tutoring for K-12 students"}
                </p>
              </motion.div>

              {/* Exact Hero Buttons: "For Schools ->" + "▶ Watch Video" */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <a
                  href="#for-schools"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-base font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{isAr ? "للمدارس والمعلمين" : "For Schools"}</span>
                  {isAr ? (
                    <ArrowLeft className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </a>

                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-base font-black text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-md shadow-slate-200/50 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </div>
                  <span>{isAr ? "شاهد الفيديو التوضيحي" : "Watch Video"}</span>
                </button>
              </motion.div>

              {/* Key Trust Checkmarks */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "رؤية المملكة 2030" : "Vision 2030 Aligned"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "منهج سقراطي دون إجابات جاهزة" : "Socratic No-Cheat AI"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "حماية خصوصية 100%" : "Zero Student PII"}</span>
                </span>
              </div>
            </div>

            {/* Right Column: 3D Saudi Boy + Mascot Illustration (Exact from Image) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative max-w-[480px] w-full"
              >
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-violet-400/20 rounded-3xl blur-2xl transform -rotate-1" />

                {/* Hero Cropped Asset */}
                <div className="relative rounded-3xl overflow-hidden border border-blue-100/80 shadow-2xl shadow-blue-500/10 bg-white">
                  <img
                    src="/images/new-design/hero-boy-robot.png"
                    alt="Rafiq AI Learning Mascot and Saudi Student"
                    className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Floating Overlay Badge matching mockup */}
                  <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                      <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        {isAr ? "استيعاب مفاهيمي فائق" : "98% Mastery Breakthrough"}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">
                        {isAr ? "أسئلة سقراطية تبني العقل" : "Guided Socratic Steps"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Metrics Proof Bar Matching Mockup Exactly */}
      <section className="relative -mt-6 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white border border-slate-100 shadow-xl shadow-blue-500/5 p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center text-center">
            {/* Stat 1 */}
            <div className="space-y-1 sm:border-e border-slate-100 last:border-none px-2">
              <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                7,337+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                {isAr ? "مدرسة أهلية وعالمية بالمملكة" : "Private Schools in Saudi Arabia"}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1 sm:border-e border-slate-100 last:border-none px-2">
              <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                1.1M+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                {isAr ? "طالب وطالبة في التعليم العام" : "Students in Saudi Arabia"}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1 sm:border-e border-slate-100 last:border-none px-2">
              <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                82,000+
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-500">
                {isAr ? "معلم ومعلمة في الميدان" : "Teachers in Saudi Arabia"}
              </div>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1 px-2">
              <div className="flex items-center justify-center gap-1 text-amber-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-800">
                {isAr ? "موثوق من كبرى المدارس" : "Trusted by Leading Schools"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "For Schools" Section Matching Image Exactly */}
      <section id="for-schools" className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: 3D Teacher Dashboard Hologram Asset (In LTR) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-[480px] w-full rounded-3xl overflow-hidden border border-slate-100 shadow-2xl shadow-blue-500/5 bg-slate-50/50">
                <img
                  src="/images/new-design/teacher-dashboard.png"
                  alt="Teacher Dashboard Class Overview"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right: Copy & Bullets */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-black text-[#1D4ED8]">
                <span>{isAr ? "للمدارس والمعلمين" : "For Schools"}</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0F172A] tracking-tight leading-tight">
                {isAr ? "تدريس أذكى. نتائج أفضل." : "Smarter Teaching. Better Results."}
              </h2>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "مكّن معلميك من رؤية تشخيصية حقيقية لاستيعاب كل طالب، وحدد الفجوات المفاهيمية قبل وصول موعد الاختبارات مع توافق تام للمناهج."
                  : "Empower your teachers with deep diagnostic insights, closing learning gaps before exams while staying 100% aligned with official standards."}
              </p>

              {/* 3 Bullets with Green Checkmarks */}
              <div className="space-y-4 pt-2">
                {/* Bullet 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? "توافق تام مع المناهج الوطنية (RAG)" : "Curriculum-Aligned RAG"}
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {isAr
                        ? "مبني بدقة وفق المعايير الوطنية ومخرجات التعلم المعتمدة لوزارة التعليم."
                        : "Tailored to national standards and educational requirements."}
                    </p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? "خرائط المفاهيم الخاطئة والتشخيص المبكر" : "Misconception Heatmaps"}
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {isAr
                        ? "اكتشاف الفجوات ونقاط الصعوبة لدى الطلاب ومعالجتها خطوة بخطوة."
                        : "Identify and address student learning gaps before exams."}
                    </p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? "تقارير واتساب الذكية لأولياء الأمور" : "Parent WhatsApp Reports"}
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {isAr
                        ? "تحديثات دورية آلية لإشراك الأسرة وإبقائهم على دراية تامة بمستوى أبنائهم."
                        : "Automated weekly updates keeping parents actively informed."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="pt-4">
                <a
                  href="#demo-sandbox"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{isAr ? "اكتشف حلول المدارس" : "Discover More"}</span>
                  {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "For Students" Section Matching Image Exactly */}
      <section id="for-students" className="py-20 lg:py-28 bg-[#F8FAFC] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Copy & Bullets */}
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-xs font-black text-violet-700">
                <span>{isAr ? "للطلاب والطالبات" : "For Students"}</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0F172A] tracking-tight leading-tight">
                {isAr ? "تعلم بسرعتك الخاصة ودون ضغط!" : "Learn at Your Own Pace!"}
              </h2>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "مع رفيق، لا يوجد خوف من ارتكاب الأخطاء! يقدم لك رفيق صديقاً صبوراً يشجعك بالنجوم، ويعطيك تلميحات تدريجية تقودك لحل أصعب المسائل بنفسك."
                  : "With Rafiq, there's zero fear of mistakes. A patient friend who celebrates every milestone with stars and progressive clues that train your brain."}
              </p>

              {/* 3 Bullets with Green Checkmarks */}
              <div className="space-y-4 pt-2">
                {/* Bullet 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? "تعليم سقراطي تفاعلي خطوة بخطوة" : "Socratic Step-by-Step Learning"}
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {isAr
                        ? "أسئلة ذكية تبني التفكير النقدي وتمنع التلقين أو إعطاء الإجابات الجاهزة."
                        : "Guided questions that build critical thinking, never just giving the direct answer."}
                    </p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? "دعم كامل للغتين العربية والإنجليزية" : "Bilingual Support (Arabic & English)"}
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {isAr
                        ? "شروحات دقيقة ومعادلات رياضية باللغتين لكافة مواد الرياضيات والعلوم."
                        : "Seamless learning in Arabic and English across Math, Science, and more."}
                    </p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isAr ? "مهام تفاعلية ممتعة وجوائز تحفيزية" : "Engaging Gamified Missions"}
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {isAr
                        ? "اجمع النجوم، وافتح الأوسمة، واكتشف متعة التغلب على التحديات الدراسية."
                        : "Collect stars, unlock badges, and discover the joy of problem solving."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{isAr ? "ابدأ التعلم الآن" : "Start Learning"}</span>
                  {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Link>
              </div>
            </div>

            {/* Right: 3D Student Girl with Laptop Solving 1/2 + 1/4 (In LTR) */}
            <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
              <div className="relative max-w-[460px] w-full rounded-3xl overflow-hidden border border-slate-100 shadow-2xl shadow-blue-500/5 bg-white">
                <img
                  src="/images/new-design/student-girl.png"
                  alt="Student girl studying math equation with Rafiq"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Features Grid Matching Mockup */}
      <section id="features" className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-black text-[#1D4ED8]">
              <span>{isAr ? "لماذا يفضل الجميع رفيق؟" : "Why Choose Rafiq"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0F172A] tracking-tight">
              {isAr ? "لماذا تختار المدارس والعائلات منصة رفيق؟" : "Why Schools and Families Choose Rafiq"}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              {isAr
                ? "منصة تعليمية متطورة صُممت بضوابط تربوية صارمة لخدمة مدارس المملكة والشرق الأوسط."
                : "Engineered specifically for K-12 education in Saudi Arabia and the MENA region."}
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-black mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                {isAr ? "ضوابط بيداغوجية صارمة" : "Pedagogical Guardrails"}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "منهج سقراطي موجه يرفض تقديم الحلول المباشرة ويحث الطالب على التفكير الذاتي خطوة بخطوة."
                  : "Strict Socratic pedagogy that refuses to do homework for students, fostering true conceptual mastery."}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mb-5">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                {isAr ? "توافق تام مع المناهج الوطنية" : "Curriculum-Aligned RAG"}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "استرجاع دقيق من كتب ومقررات وزارة التعليم السعودية مع عزو وإسناد للمصادر دون هلوسة."
                  : "Grounded in official textbook standards with strict citation retrieval and zero hallucinations."}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                {isAr ? "تقارير ذكية لأولياء الأمور" : "Smart Parent Reports"}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "ملخصات أسبوعية تصل لأولياء الأمور تبرز المهارات المتقنة وتوصيات للمراجعة الدقيقة."
                  : "Automated weekly WhatsApp summaries highlighting mastered skills, strengths, and review topics."}
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black mb-5">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                {isAr ? "رؤى وتحليلات فورية للمعلم" : "Actionable Insights"}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {isAr
                  ? "لوحات تحكم مباشرة ترصد نسبة استيعاب الصف، وخرائط المفاهيم الخاطئة وتطور الإنجاز."
                  : "Real-time teacher dashboards tracking class mastery meters, misconception heatmaps, and trends."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonial Section with Golden Trophy Asset */}
      <section className="py-16 bg-[#F8FAFC] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Quote & Author Info */}
              <div className="md:col-span-8 space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>

                {/* Quote text */}
                <p className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                  {isAr
                    ? "«غيّر رفيق طريقة تفكير طلابي في حل المسائل تماماً. لم يعودوا يطلبون الإجابات الجاهزة، بل أصبحوا يطرحون أسئلة أذكى ويبحثون عن الحل بأنفسهم!»"
                    : '“Rafiq has completely changed how my students approach problem solving. They no longer ask for answers — they ask better questions!”'}
                </p>

                {/* Author Info */}
                <div className="pt-2">
                  <div className="text-base font-black text-slate-900">
                    {isAr ? "أ. فاطمة العتيبي" : "Ms. Fatimah Al-Otaibi"}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500">
                    {isAr ? "معلمة رياضيات متميزة • مدارس الرياض" : "Math Teacher • Riyadh, KSA"}
                  </div>
                </div>
              </div>

              {/* Golden Trophy Asset */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative max-w-[200px] w-full">
                  <img
                    src="/images/new-design/trophy.png"
                    alt="Golden Trophy and Academic Books"
                    className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive 1-Click Demo Sandbox & Live Socratic Simulator */}
      <section id="demo-sandbox" className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-black text-[#1D4ED8]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAr ? "تجربة المنصة الفورية" : "Instant Live Sandbox"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0F172A] tracking-tight">
              {isAr ? "جرّب رفيق الآن بضغطة زر واحدة" : "Experience Rafiq in Action"}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              {isAr
                ? "اختر أي دور أدناه لتسجيل الدخول السحابي المباشر وتجربة كافة الميزات دون الحاجة لتسجيل حساب جديد."
                : "Select any role below to test the full live application instantly with pre-configured demo credentials."}
            </p>
          </div>

          {/* 4 Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoRoles.map((role) => {
              const Icon = role.icon;
              const isLoggingIn = loggingInRole === role.role;
              return (
                <div
                  key={role.role}
                  className="rounded-3xl p-6 bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${role.color} text-white flex items-center justify-center shadow-md`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${role.pillBg}`}>
                        {role.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900">{role.name}</h3>
                      <div className="text-xs font-bold text-slate-500">{role.title}</div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {role.description}
                    </p>

                    <div className="pt-2 pb-1">
                      <div className="text-[10px] font-bold text-slate-400">
                        {isAr ? "رمز الدخول التجريبي:" : "Demo Access Code:"}
                      </div>
                      <code className="text-xs font-black font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {role.code}
                      </code>
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      onClick={() => handleQuickLogin(role.code, role.role)}
                      disabled={isLoggingIn}
                      className="w-full py-2.5 px-4 rounded-full text-xs font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      {isLoggingIn ? (
                        <span>{isAr ? "جارٍ تسجيل الدخول..." : "Signing in..."}</span>
                      ) : (
                        <>
                          <span>{role.btnText}</span>
                          {isAr ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Socratic Simulator Interactive Widget */}
          <div className="rounded-3xl bg-[#F8FAFC] border border-slate-200/80 p-6 sm:p-10 shadow-sm">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div>
                  <div className="text-xs font-black text-[#1D4ED8] uppercase tracking-wider">
                    {isAr ? "المحاكي السقراطي المباشر" : "Interactive Socratic Simulator"}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {isAr ? currentScenario.titleAr : currentScenario.title}
                  </h3>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">
                    {isAr ? currentScenario.gradeAr : currentScenario.grade}
                  </div>
                </div>

                {/* Subject Switchers */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-2xs">
                  <button
                    onClick={() => {
                      setSelectedSubject("math");
                      setChatSteps(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      selectedSubject === "math"
                        ? "bg-[#1D4ED8] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isAr ? "الرياضيات 📐" : "Math 📐"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubject("science");
                      setChatSteps(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      selectedSubject === "science"
                        ? "bg-[#1D4ED8] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isAr ? "العلوم 🌿" : "Science 🌿"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSubject("english");
                      setChatSteps(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      selectedSubject === "english"
                        ? "bg-[#1D4ED8] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isAr ? "الإنجليزية 📚" : "English 📚"}
                  </button>
                </div>
              </div>

              {/* Chat Log Window */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 min-h-[260px] max-h-[380px] overflow-y-auto">
                {dialogue.slice(0, chatSteps).map((step, idx) => {
                  const isRafiq = step.sender === "rafiq";
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isRafiq ? "justify-start" : "justify-end"}`}
                    >
                      {isRafiq && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                          🤖
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 text-sm font-semibold leading-relaxed ${
                          isRafiq
                            ? step.isPraise
                              ? "bg-emerald-50 text-emerald-950 border border-emerald-200"
                              : "bg-blue-50 text-blue-950 border border-blue-100"
                            : "bg-[#1D4ED8] text-white"
                        }`}
                      >
                        <div>{step.text}</div>
                        {step.mathFormula && (
                          <div className="mt-2 p-2 bg-white/80 rounded-lg text-xs font-mono text-slate-800 border border-slate-200">
                            {step.mathFormula}
                          </div>
                        )}
                      </div>
                      {!isRafiq && (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                          👦
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-2 items-center text-xs text-slate-400 font-bold p-2">
                    <div className="h-2 w-2 rounded-full bg-[#1D4ED8] animate-ping" />
                    <span>{isAr ? "رفيق يفكر ويكتب..." : "Rafiq is thinking..."}</span>
                  </div>
                )}
              </div>

              {/* Interactive Student Prompt Options */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {interactivePrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.actionStep)}
                      className="px-4 py-2 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-xs font-black text-slate-800 hover:text-[#1D4ED8] shadow-2xs hover:border-blue-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#1D4ED8]" />
                      <span>{prompt.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setChatSteps(1)}
                  className="px-3 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                  title={isAr ? "إعادة المحاكاة" : "Reset Simulator"}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isAr ? "إعادة" : "Reset"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Bottom Call to Action Banner (Exact Royal Blue & Character Asset) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] p-8 sm:p-12 lg:p-16 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
          {/* Subtle Background Rings */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Heading, Subtitle, Amber CTA Button */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight leading-tight">
                {isAr
                  ? "هل أنت مستعد لنقل تجربة التعلم في مدرستك إلى المستقبل؟"
                  : "Ready to Transform Your School's Learning Experience?"}
              </h2>

              <p className="text-base sm:text-xl text-blue-100 font-semibold max-w-xl mx-auto lg:mx-0">
                {isAr
                  ? "انضم إلى المدارس الرائدة ومكّن طلابك ومعلميك مع رفيق الذكي اليوم."
                  : "Join hundreds of forward-thinking schools empowering students with Rafiq AI."}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {/* Yellow / Golden Amber CTA Button (Exact from Mockup) */}
                <a
                  href="#demo-sandbox"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-black text-slate-900 bg-[#F59E0B] hover:bg-[#D97706] shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{isAr ? "احجز عرضاً تجريبياً الآن" : "Book a Demo"}</span>
                  {isAr ? (
                    <ArrowLeft className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </a>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                >
                  <span>{isAr ? "تجربة رمز الطالب" : "Student Card Login"}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Celebrating Student and Mascot Illustration (Exact from Image) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-[360px] w-full">
                <img
                  src="/images/new-design/cta-characters.png"
                  alt="Student and Robot Celebrating Learning"
                  className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer Matching Image Exactly */}
      <footer className="bg-[#F8FAFC] border-t border-slate-200/80 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Logo & Vision 2030 Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/new-design/rafiq-logo.png"
                  alt="Rafiq رفيق"
                  className="h-10 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-slate-900">رفيق</span>
                    <span className="text-xl font-black text-[#2563EB]">Rafiq</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {isAr ? "تعلم. افهم. تفوق." : "Learn. Understand. Excel."}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
                {isAr
                  ? "المنصة التعليمية الأولى المدعومة بالذكاء الاصطناعي التوليدي والسقراطي لطلاب التعليم العام في المملكة العربية السعودية."
                  : "The premier curriculum-aligned Socratic AI learning companion empowering K-12 students in the Kingdom of Saudi Arabia."}
              </p>

              {/* Contact Information */}
              <div className="space-y-2 pt-2 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#2563EB]" />
                  <span dir="ltr">+966 55 044 2094</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#2563EB]" />
                  <span>{isAr ? "الرياض، المملكة العربية السعودية" : "Riyadh, Kingdom of Saudi Arabia"}</span>
                </div>
              </div>
            </div>

            {/* Column 2: For Schools */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {isAr ? "حلول المدارس" : "For Schools"}
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li>
                  <a href="#for-schools" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "لوحة تحكم المعلم" : "Teacher Command"}
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "خرائط المفاهيم الخاطئة" : "Misconception Maps"}
                  </a>
                </li>
                <li>
                  <a href="#for-schools" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "تقارير واتساب الأسبوعية" : "Parent WhatsApp Reports"}
                  </a>
                </li>
                <li>
                  <a href="#demo-sandbox" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "استيراد ملفات الإكسل" : "Excel Roster Wizard"}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: For Students */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {isAr ? "للطلاب والأسرة" : "For Students"}
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li>
                  <Link href="/login" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "دخول برمز البطاقة" : "Card Code Login"}
                  </Link>
                </li>
                <li>
                  <a href="#demo-sandbox" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "المحادثة السقراطية" : "Socratic Chat"}
                  </a>
                </li>
                <li>
                  <a href="#for-students" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "مهام الرياضيات والعلوم" : "Math & Science Quests"}
                  </a>
                </li>
                <li>
                  <a href="#for-students" className="hover:text-[#2563EB] transition-colors">
                    {isAr ? "سلم التلميحات والأوسمة" : "Clue Ladders & Badges"}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform & Security */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {isAr ? "المنصة والخصوصية" : "Platform & Trust"}
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{isAr ? "أمان وخصوصية 100%" : "Zero PII Guarantee"}</span>
                </li>
                <li>
                  <span className="text-slate-500">
                    {isAr ? "رؤية المملكة 2030" : "Saudi Vision 2030"}
                  </span>
                </li>
                <li>
                  <span className="text-slate-500">
                    {isAr ? "معايير وزارة التعليم" : "MoE Standards"}
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => setLang(isAr ? "en" : "ar")}
                    className="text-[#2563EB] hover:underline"
                  >
                    {isAr ? "English Version" : "النسخة العربية"}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-slate-200/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
            <div>
              © 2026 {isAr ? "منصة رفيق التعليمية. جميع الحقوق محفوظة." : "Rafiq AI Learning Companion. All rights reserved."}
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-700 cursor-pointer">{isAr ? "شروط الاستخدام" : "Terms"}</span>
              <span className="hover:text-slate-700 cursor-pointer">{isAr ? "سياسة الخصوصية" : "Privacy"}</span>
              <span className="hover:text-slate-700 cursor-pointer">{isAr ? "المساعدة والدعم" : "Support"}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal Simulation */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-[#1D4ED8]" />
                  <h3 className="text-lg font-black text-slate-900">
                    {isAr ? "جولة تعريفية في منصة رفيق" : "Rafiq Platform Walkthrough"}
                  </h3>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-black"
                >
                  ✕
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-[#1D4ED8] flex items-center justify-center shadow-lg mb-3">
                  <Play className="h-8 w-8 fill-current ml-1 text-white" />
                </div>
                <h4 className="text-lg font-black mb-1">
                  {isAr ? "عرض حي لتجربة الطالب والمعلم" : "Live Demo of Student & Teacher Experience"}
                </h4>
                <p className="text-xs text-slate-300 max-w-md">
                  {isAr
                    ? "شاهد كيف يساعد رفيق الطلاب في حل المسائل بطريقة سقراطية ممتعة، وكيف تتابع المعلمة استيعاب الفصل لحظة بلحظة."
                    : "See how Rafiq guides students Socratically through difficult problems and provides actionable analytics to educators."}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-xs font-black bg-[#1D4ED8] text-white hover:bg-[#1E40AF]"
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
