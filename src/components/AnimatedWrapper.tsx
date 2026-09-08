"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  delay = 0,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
