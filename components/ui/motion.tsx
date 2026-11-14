"use client";

import * as React from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import confetti from "canvas-confetti";

/**
 * Fires celebration confetti bursts across the screen
 */
export function triggerCelebrationConfetti() {
  // Center blast
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.65 },
    colors: ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#6366F1"],
  });

  // Left & right cannons with slight delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#10B981", "#3B82F6", "#6366F1"],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#F59E0B", "#EC4899", "#8B5CF6"],
    });
  }, 250);
}

/**
 * Smooth entrance animation: Fade In
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Spring entrance animation: Slide Up
 */
export function SlideUp({
  children,
  delay = 0,
  distance = 18,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -distance }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 260,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale in spring animation (great for badges, cards, modals)
 */
export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Container for list of cards or rows
 */
export function StaggerContainer({
  children,
  delay = 0,
  staggerChildren = 0.08,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  staggerChildren?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger item child
 */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            damping: 22,
            stiffness: 280,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Interactive Hover Card with micro spring elevation
 */
export function HoverSpring({
  children,
  scale = 1.02,
  y = -4,
  className,
  onClick,
}: {
  children: React.ReactNode;
  scale?: number;
  y?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale, y }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/**
 * Smooth Animated Counter for numbers
 */
export function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startValue + (endValue - startValue) * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

