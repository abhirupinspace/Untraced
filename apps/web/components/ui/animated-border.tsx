"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function AnimatedBorder({
  children,
  className,
  containerClassName,
}: AnimatedBorderProps) {
  return (
    <div className={cn("relative p-[2px] rounded-2xl overflow-hidden", containerClassName)}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(90deg, #3d0040, #5a0060, #3d0040, #5a0060)",
          backgroundSize: "300% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className={cn("relative bg-white rounded-[14px]", className)}>
        {children}
      </div>
    </div>
  );
}

export function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl bg-white p-6 overflow-hidden",
        className
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(61, 0, 64, 0.1), transparent 40%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function ShimmerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-untraced-light rounded-xl bg-untraced-dark group",
        className
      )}
      {...props}
    >
      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10" />
      <span className="relative">{children}</span>
    </button>
  );
}
