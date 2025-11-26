import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface GridPatternProps {
  className?: string;
  numSquares?: number;
}

export function AnimatedGridPattern({
  className,
  numSquares = 30,
}: GridPatternProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="grid-pattern absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}

interface BeamProps {
  className?: string;
}

export function BackgroundBeams({ className }: BeamProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
            <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,100 Q250,50 500,100 T1000,100"
          fill="none"
          stroke="url(#beam-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>
    </div>
  );
}

interface SparklesProps {
  className?: string;
  particleCount?: number;
}

export function SparklesCore({ className, particleCount = 50 }: SparklesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className =
        "absolute w-1 h-1 bg-cyan-400 rounded-full opacity-0";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = `sparkle ${2 + Math.random() * 2}s ease-in-out ${
        Math.random() * 2
      }s infinite`;
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [particleCount]);

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div ref={containerRef} className={cn("absolute inset-0", className)} />
    </>
  );
}

interface MeteorsProps {
  number?: number;
}

export function Meteors({ number = 20 }: MeteorsProps) {
  const meteors = Array.from({ length: number }, (_, i) => ({
    id: i,
    style: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${1 + Math.random()}s`,
    },
  }));

  return (
    <>
      <style>{`
        @keyframes meteor {
          0% {
            transform: rotate(215deg) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-500px);
            opacity: 0;
          }
        }
      `}</style>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-[meteor_linear_infinite] rounded-full bg-cyan-400 shadow-[0_0_0_1px_#ffffff10]"
          style={{
            ...meteor.style,
            boxShadow: "0 0 0 1px #ffffff10",
          }}
        >
          <div className="absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-transparent" />
        </span>
      ))}
    </>
  );
}

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1.5,
  colorFrom = "#0EA5E9",
  colorTo = "#06B6D4",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={
          {
            "--size": size,
            "--duration": duration,
            "--border-width": borderWidth,
            "--color-from": colorFrom,
            "--color-to": colorTo,
          } as React.CSSProperties
        }
      >
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            maskComposite: "exclude",
            padding: borderWidth,
          }}
        />
        <motion.div
          className="absolute h-full w-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
            borderRadius: "inherit",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
}
