/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import React from "react";

const cards = [
  {
    id: 1,
    name: "Aarav Sharma",
    handle: "@aarav_dev",
    text: "SkillSync helped me connect with brilliant developers and share my Python tutorials easily!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Neha Patel",
    handle: "@neha_codes",
    text: "The explore and search features on SkillSync have been game-changers for my learning journey.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Rohan Verma",
    handle: "@rohan_v",
    text: "Finally a platform where I can showcase my tech blogs and connect with professionals!",
    image: "https://randomuser.me/api/portraits/men/36.jpg",
  },
  {
    id: 4,
    name: "Simran Kaur",
    handle: "@simran_kaur",
    text: "I love the secure and seamless experience of sharing knowledge with SkillSync.",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    id: 5,
    name: "Vikram Singh",
    handle: "@vikram_builds",
    text: "Building my network with SkillSync has never been easier. The interface is super smooth!",
    image: "https://randomuser.me/api/portraits/men/48.jpg",
  },
];

export default function InfiniteScrollCards() {
  return (
    <div className="min-h bg-black flex flex-col gap-12 justify-center items-center px-4 py-16">
      {/* Row 1 (scroll left) */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black z-10 pointer-events-none" />
        <motion.div
          className="flex whitespace-nowrap min-w-full p-3"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration: 30,
          }}
        >
          {[...cards, ...cards].map((card, index) => (
            <motion.div
              key={`right-${index}`}
              className="bg-zinc-900 text-white p-4 md:p-6 rounded-xl w-74 mx-2 flex-shrink-0 shadow-lg transition-all duration-70 cursor-pointer"
              whileHover={{
                scale: 1.1,
                rotateX: 5,
                rotateY: 5,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
                <div className="min-w-0">
                  <div className="font-bold text-base md:text-lg break-words">
                    {card.name}
                  </div>
                  <div className="text-sm text-zinc-400 break-words">
                    {card.handle}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm md:text-base break-words whitespace-normal">
                {card.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Row 2 (scroll right) */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black z-10 pointer-events-none" />
        <motion.div
          className="flex whitespace-nowrap min-w-full p-3"
          animate={{ x: ["-100%", "0%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration: 30,
          }}
        >
          {[...cards, ...cards].map((card, index) => (
            <motion.div
              key={`right-${index}`}
              className="bg-zinc-900 text-white p-4 md:p-6 rounded-xl w-74 mx-2 flex-shrink-0 shadow-lg transition-all duration-70 cursor-pointer"
              whileHover={{
                scale: 1.1,
                rotateX: 5,
                rotateY: 5,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
                <div className="min-w-0">
                  <div className="font-bold text-base md:text-lg break-words">
                    {card.name}
                  </div>
                  <div className="text-sm text-zinc-400 break-words">
                    {card.handle}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm md:text-base break-words whitespace-normal">
                {card.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
