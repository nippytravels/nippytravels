"use client";

import { motion } from "motion/react";

const routePath = `
  M 15 82
  C 42 58, 48 115, 73 91
  C 94 70, 103 48, 124 77
  C 145 108, 157 118, 178 84
  C 197 54, 216 65, 229 91
  C 245 121, 265 113, 280 82
  C 296 51, 319 56, 332 83
  C 348 116, 370 122, 389 86
  C 408 51, 438 59, 452 84
  C 466 108, 480 104, 492 88
`;

type Props = {
  className?: string;
};

export default function Squiggle({ className }: Props) {
  return (
    <motion.svg
      viewBox="0 0 500 160"
      width="500"
      height="160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Existing handwritten route */}
      <motion.path
        id="travel-route"
        d={routePath}
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Moving dot */}
      <motion.circle
        r="6"
        fill="currentColor"
        initial={{
          offsetDistance: "0%",
          opacity: 0,
        }}
        animate={{
          offsetDistance: "100%",
          opacity: 1,
        }}
        transition={{
          offsetDistance: {
            duration: 3,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: {
            duration: 0.2,
          },
        }}
        style={{
          offsetPath: `path("${routePath}")`,
        }}
      />
    </motion.svg>
  );
}
