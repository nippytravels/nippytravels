import { motion } from "motion/react";

const routePath = `
M21 3 3 10.5l6.5 2 2 6.5L14 15l4.5 4.5L21 3Z`;

export default function Plane() {
  return (
    <motion.svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d={routePath}
        fill="currentColor"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </motion.svg>
  );
}
