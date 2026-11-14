import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--neutral-50)",
        surface: "var(--neutral-0)",
        foreground: "var(--neutral-900)",
        border: "var(--neutral-200)",
        muted: {
          DEFAULT: "var(--neutral-100)",
          foreground: "var(--neutral-600)",
        },
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          300: "var(--primary-300)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          DEFAULT: "var(--primary-600)",
          foreground: "#FFFFFF",
        },
        navy: {
          900: "var(--navy-900)",
          DEFAULT: "var(--navy-900)",
        },
        accent: {
          100: "var(--accent-100)",
          500: "var(--accent-500)",
          DEFAULT: "var(--accent-500)",
        },
        neutral: {
          0: "var(--neutral-0)",
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          400: "var(--neutral-400)",
          600: "var(--neutral-600)",
          900: "var(--neutral-900)",
        },
        semantic: {
          success: "var(--success)",
          "success-bg": "var(--success-bg)",
          warning: "var(--warning)",
          "warning-bg": "var(--warning-bg)",
          danger: "var(--danger)",
          "danger-bg": "var(--danger-bg)",
          info: "var(--info)",
          "info-bg": "var(--info-bg)",
        },
        level: {
          mastered: "var(--lvl-mastered)",
          "mastered-bg": "var(--lvl-mastered-bg)",
          proficient: "var(--lvl-proficient)",
          "proficient-bg": "var(--lvl-proficient-bg)",
          developing: "var(--lvl-developing)",
          "developing-bg": "var(--lvl-developing-bg)",
          needs_support: "var(--lvl-needs-support)",
          "needs_support-bg": "var(--lvl-needs-support-bg)",
        },
        subject: {
          math: "var(--subj-math)",
          science: "var(--subj-science)",
          english: "var(--subj-english)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-plex-arabic)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
