// client/src/components/animations/PageTransition.jsx
import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: "100vw",
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

// You can adjust the duration for exit animations if needed
// const pageExit = {
//     opacity: 0,
//     y: -100
// };

function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out" // Note: exit animations only work with AnimatePresence
      variants={pageVariants}
      transition={pageTransition}
      className="w-full" // Ensure it takes full width for smooth transitions
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
