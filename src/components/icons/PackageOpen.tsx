"use client";

import type { Variants } from "motion";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from 'react';

const pathVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

interface PackageOpenProps extends React.SVGAttributes<SVGSVGElement> {
  strokeWidth?: number;
}

const PackageOpen = ({
  strokeWidth = 1.5,
  ...props
}: PackageOpenProps) => {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      onHoverStart={() => controls.start("visible")}
      {...props}
    >
        <motion.path
          d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
        />
        <motion.path
          d="m7.5 4.21 9 5.15"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
        />
        <motion.polyline
          points="3.29 7 12 12 20.71 7"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
        />
        <motion.line
          x1="12"
          y1="22"
          x2="12"
          y2="12"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
        />
        <motion.path
          d="M16.5 9.4a4 4 0 0 1 0 5.2"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
         />
        <motion.path 
          d="M18.8 7.8a8 8 0 0 1 0 8.4"
          variants={pathVariants}
          initial="hidden"
          animate={controls}
        />
    </motion.svg>
  );
};

export default PackageOpen;