import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const LETTERS = ["N", "E", "X", "Y", "R", "A"];

interface LogoIntroProps {
  onComplete: () => void;
}

export function LogoIntro({ onComplete }: LogoIntroProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  // 0 = letters animating in
  // 1 = tagline visible
  // 2 = progress bar running
  // 3 = exiting
  const completedRef = useRef(false);

  useEffect(() => {
    // letters stagger finishes ~200 + 5*90 + 500 = ~1150ms
    const t1 = setTimeout(() => setPhase(1), 1100);
    // tagline lingers a beat, then progress
    const t2 = setTimeout(() => setPhase(2), 1450);
    // progress runs 1.1s, then exit
    const t3 = setTimeout(() => setPhase(3), 2650);
    // unmount after exit transition (600ms)
    const t4 = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 3250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const exiting = phase === 3;

  return (
    <div
      role="status"
      aria-label="Loading NEXYRA"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        background: "#04040f",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.06)" : "scale(1)",
        transition: exiting ? "opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* Ambient glow behind logo */}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(147,51,234,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,51,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Shimmer layer — sweeps left-to-right once letters land */}
      {phase >= 1 && (
        <motion.div
          aria-hidden="true"
          className="absolute"
          initial={{ x: "-120%", skewX: "-15deg" }}
          animate={{ x: "220%" }}
          transition={{ duration: 0.55, ease: "easeInOut", delay: 0.05 }}
          style={{
            top: "50%",
            left: "50%",
            width: "30%",
            height: "14rem",
            transform: "translateY(-50%)",
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* NEXYRA letter row */}
      <div className="relative flex items-end" style={{ gap: "0.02em" }}>
        {LETTERS.map((letter, i) => (
          <motion.span
            key={letter + i}
            initial={{ opacity: 0, y: 48, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.18 + i * 0.09,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              fontSize: "clamp(4.5rem, 18vw, 12rem)",
              fontWeight: 900,
              letterSpacing: "0.12em",
              fontFamily: "'Inter Tight', sans-serif",
              background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            {letter}
          </motion.span>
        ))}

        {/* Underline accent — draws in after letters land */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: phase >= 1 ? 0 : 999 }}
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "2px",
            background: "linear-gradient(to right, #9333EA, #2563EB)",
            transformOrigin: "left center",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Progress bar */}
      <div
        className="absolute"
        style={{ bottom: "3rem", left: "50%", transform: "translateX(-50%)", width: "100px" }}
      >
        {/* Track */}
        <div
          style={{
            height: "1px",
            background: "rgba(147,51,234,0.2)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: phase >= 2 ? "100%" : "0%" }}
            transition={{
              duration: 1.15,
              ease: [0.4, 0, 0.2, 1],
              delay: phase >= 2 ? 0 : 999,
            }}
            style={{
              height: "100%",
              background: "linear-gradient(to right, #9333EA, #2563EB)",
              borderRadius: "1px",
            }}
          />
        </div>
      </div>

      {/* Corner accents */}
      {[
        { top: "2rem", left: "2rem", borderTop: "1px solid", borderLeft: "1px solid" },
        { top: "2rem", right: "2rem", borderTop: "1px solid", borderRight: "1px solid" },
        { bottom: "2rem", left: "2rem", borderBottom: "1px solid", borderLeft: "1px solid" },
        { bottom: "2rem", right: "2rem", borderBottom: "1px solid", borderRight: "1px solid" },
      ].map((style, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
          className="absolute"
          style={{
            ...style,
            width: "18px",
            height: "18px",
            borderColor: "rgba(147,51,234,0.35)",
          }}
        />
      ))}
    </div>
  );
}
