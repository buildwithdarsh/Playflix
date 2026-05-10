"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () => import("@/lib/motion-features").then((m) => m.default);

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures}>
      {children}
    </LazyMotion>
  );
}
