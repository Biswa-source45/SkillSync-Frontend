/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const logos = [
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
];

const Orbitlogo = () => {
  const outerRadius = 60;
  const innerRadius = 35;

  return (
    <div className="relative w-32 h-32">
      {/* Outer Circle - AntiClockwise */}
      <motion.div
        className="absolute border border-neutral-700 rounded-full w-32 h-32"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ animationDirection: "reverse" }}
      >
        {logos.map((logo, index) => {
          const angle = (360 / logos.length) * index;
          const x = outerRadius * Math.cos((angle * Math.PI) / 180);
          const y = outerRadius * Math.sin((angle * Math.PI) / 180);
          return (
            <motion.img
              key={`outer-${index}`}
              src={logo}
              alt={`logo-${index}`}
              className="absolute w-6 h-6 object-contain"
              style={{
                left: `calc(50% + ${x}px - 0.75rem)`,
                top: `calc(50% + ${y}px - 0.75rem)`,
              }}
            />
          );
        })}
      </motion.div>

      {/* Inner Circle - Clockwise */}
      <motion.div
        className="absolute border border-neutral-700 rounded-full w-20 h-20 top-[25%] left-[25%]"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {logos.map((logo, index) => {
          const angle = (360 / logos.length) * index;
          const x = innerRadius * Math.cos((angle * Math.PI) / 180);
          const y = innerRadius * Math.sin((angle * Math.PI) / 180);
          return (
            <motion.img
              key={`inner-${index}`}
              src={logo}
              alt={`logo-inner-${index}`}
              className="absolute w-4 h-4 object-contain"
              style={{
                left: `calc(50% + ${x}px - 0.5rem)`,
                top: `calc(50% + ${y}px - 0.5rem)`,
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default Orbitlogo;
