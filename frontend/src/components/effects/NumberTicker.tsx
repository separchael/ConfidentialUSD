import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { cn } from "../../lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(direction === "down" ? value : 0, {
    damping: 60,
    stiffness: 100,
  });

  const displayValue = useTransform(springValue, (current) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(current)
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setTimeout(() => {
        springValue.set(direction === "down" ? 0 : value);
        setHasAnimated(true);
      }, delay * 1000);
    }
  }, [isInView, delay, value, direction, springValue, hasAnimated]);

  return (
    <motion.span
      ref={ref}
      className={cn("tabular-nums", className)}
    >
      {displayValue}
    </motion.span>
  );
}

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  from,
  to,
  duration = 2,
  className,
  formatter = (v) => v.toLocaleString(),
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = from + (to - from) * eased;
      setCount(current);

      if (now < endTime) {
        requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {formatter(Math.round(count))}
    </span>
  );
}
