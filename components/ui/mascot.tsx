"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  expression?: "happy" | "waving" | "thinking" | "celebrating";
  className?: string;
  animate?: boolean;
}

export function RafiqMascot({
  size = "md",
  expression = "waving",
  className,
  animate = true,
}: MascotProps) {
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        sizeMap[size],
        animate && "transition-transform hover:scale-110 duration-300",
        className
      )}
      title="Rafiq • رفيقك الذكي"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-full drop-shadow-md",
          animate && "animate-[bounce_3s_ease-in-out_infinite]"
        )}
      >
        <defs>
          {/* Body Gradient */}
          <linearGradient id="bodyGrad" x1="50" y1="40" x2="150" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>

          {/* Belly Gradient */}
          <linearGradient id="bellyGrad" x1="100" y1="90" x2="100" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#BAE6FD" />
          </linearGradient>

          {/* Eye Gradient */}
          <radialGradient id="eyePupil" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          {/* Cap Gradient */}
          <linearGradient id="capGrad" x1="50" y1="15" x2="150" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1B4B" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>

          {/* Gold Tassel Gradient */}
          <linearGradient id="tasselGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>

          {/* Wing Gradient */}
          <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* Floating Sparkle Stars */}
        <path
          d="M30 65 L33 55 L43 52 L33 49 L30 39 L27 49 L17 52 L27 55 Z"
          fill="#FDE047"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />
        <path
          d="M175 60 L178 52 L186 50 L178 48 L175 40 L172 48 L164 50 L172 52 Z"
          fill="#38BDF8"
          className="animate-[pulse_2.5s_ease-in-out_infinite]"
        />

        {/* Little Tail Feathers */}
        <path
          d="M85 165 C75 180 80 190 90 185 C100 192 110 180 100 165 Z"
          fill="#D97706"
        />

        {/* Main Chubby Body */}
        <circle cx="100" cy="115" r="58" fill="url(#bodyGrad)" />

        {/* Fluffy Sky-Blue Belly */}
        <ellipse cx="100" cy="125" rx="36" ry="42" fill="url(#bellyGrad)" />

        {/* Belly Feather Fluffs */}
        <path
          d="M90 115 C95 120 105 120 110 115"
          stroke="#7DD3FC"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M85 132 C93 138 107 138 115 132"
          stroke="#7DD3FC"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Left Wing (Resting) */}
        <path
          d="M48 100 C35 110 32 135 52 145 C56 130 54 115 48 100 Z"
          fill="url(#wingGrad)"
        />

        {/* Right Wing (Waving or Resting based on expression) */}
        {expression === "waving" || expression === "celebrating" ? (
          <path
            d="M152 100 C175 80 185 95 168 125 C160 115 155 108 152 100 Z"
            fill="url(#wingGrad)"
            className="origin-[150px_110px] animate-[wiggle_1.5s_ease-in-out_infinite]"
          />
        ) : (
          <path
            d="M152 100 C165 110 168 135 148 145 C144 130 146 115 152 100 Z"
            fill="url(#wingGrad)"
          />
        )}

        {/* Large Sparkly Eyes */}
        {/* Left Eye */}
        <ellipse cx="80" cy="98" rx="14" ry="17" fill="#FFFFFF" />
        <ellipse cx="82" cy="98" rx="10" ry="13" fill="url(#eyePupil)" />
        <circle cx="78" cy="92" r="5" fill="#FFFFFF" />
        <circle cx="85" cy="104" r="2.5" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="120" cy="98" rx="14" ry="17" fill="#FFFFFF" />
        <ellipse cx="118" cy="98" rx="10" ry="13" fill="url(#eyePupil)" />
        <circle cx="114" cy="92" r="5" fill="#FFFFFF" />
        <circle cx="121" cy="104" r="2.5" fill="#FFFFFF" />

        {/* Cute Blushing Cheeks */}
        <ellipse cx="64" cy="115" rx="8" ry="5" fill="#FB7185" opacity="0.6" />
        <ellipse cx="136" cy="115" rx="8" ry="5" fill="#FB7185" opacity="0.6" />

        {/* Friendly Golden Beak */}
        <path
          d="M93 107 C93 103 107 103 107 107 L102 120 C101 122 99 122 98 120 Z"
          fill="#EA580C"
        />
        <path
          d="M95 107 C97 109 103 109 105 107"
          stroke="#C2410C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Adorable Baby Falcon Head Feather Tuft / Crown */}
        <path
          d="M100 58 C96 45 104 42 100 35 C108 42 108 48 100 58 Z"
          fill="#D97706"
        />

        {/* Graduation Cap (Mortarboard) */}
        <g id="graduationCap">
          {/* Cap Skull Cap */}
          <path
            d="M80 50 C80 40 120 40 120 50 Z"
            fill="#1E1B4B"
          />
          {/* Diamond Top */}
          <polygon
            points="100,24 148,38 100,52 52,38"
            fill="url(#capGrad)"
            stroke="#4338CA"
            strokeWidth="1.5"
          />
          {/* Golden Center Button */}
          <circle cx="100" cy="38" r="4" fill="#FDE047" />

          {/* Swinging Golden Tassel */}
          <path
            d="M100 38 Q125 42 128 58"
            stroke="url(#tasselGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <polygon
            points="126,58 130,58 132,68 124,68"
            fill="url(#tasselGrad)"
          />
        </g>

        {/* Tiny Orange Feet */}
        <path
          d="M78 168 C74 176 80 180 86 176 C88 178 94 176 90 168 Z"
          fill="#EA580C"
        />
        <path
          d="M110 168 C106 176 112 180 118 176 C120 178 126 176 122 168 Z"
          fill="#EA580C"
        />
      </svg>
    </div>
  );
}

