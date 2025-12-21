"use client"

import { useScroll, useTransform, MotionValue } from "framer-motion"
import { useRef } from "react"

interface ParallaxOptions {
  offset?: ["start start" | "start end" | "end start" | "end end" | "center center", "start start" | "start end" | "end start" | "end end" | "center center"]
  speed?: number
}

interface ParallaxResult {
  ref: React.RefObject<HTMLDivElement | null>
  y: MotionValue<number>
  opacity?: MotionValue<number>
}

export function useParallax(speed: number = 0.5): ParallaxResult {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])

  return { ref, y }
}

export function useParallaxRange(
  inputRange: [number, number] = [0, 1],
  outputRange: [number, number] = [0, -100]
): { y: MotionValue<number>; scrollYProgress: MotionValue<number> } {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, inputRange, outputRange)

  return { y, scrollYProgress }
}

export function useElementParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5 } = options
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])

  return { ref, y, scale, opacity, scrollYProgress }
}
