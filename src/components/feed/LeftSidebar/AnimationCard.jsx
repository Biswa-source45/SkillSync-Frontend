/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Cities + Gradient + Country Flags
const cities = [
  {
    name: "London",
    timeZone: "Europe/London",
    flag: "https://flagcdn.com/gb.svg",
    gradient: "from-indigo-700 to-purple-800"
  },
  {
    name: "India",
    timeZone: "Asia/Kolkata",
    flag: "https://flagcdn.com/in.svg",
    gradient: "from-yellow-600 to-orange-700"
  },
  {
    name: "New York",
    timeZone: "America/New_York",
    flag: "https://flagcdn.com/us.svg",
    gradient: "from-rose-700 to-red-800"
  },
  {
    name: "Moscow",
    timeZone: "Europe/Moscow",
    flag: "https://flagcdn.com/ru.svg",
    gradient: "from-emerald-700 to-green-800"
  }
];

// ✅ Format to 12-hour with AM/PM
const getTime = (timeZone) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone
  }).format(new Date());
};

const AnimationCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [times, setTimes] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes = {};
      cities.forEach((city) => {
        newTimes[city.name] = getTime(city.timeZone);
      });
      setTimes(newTimes);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % cities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-2xl shadow-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={cities[activeIndex].name}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${cities[activeIndex].gradient} text-white rounded-2xl`}
        >
          <img
            src={cities[activeIndex].flag}
            alt={`${cities[activeIndex].name} flag`}
            className="w-6 h-4 mb-2 rounded-sm shadow"
          />
          <h2 className="text-lg font-semibold tracking-wide">{cities[activeIndex].name}</h2>
          <p className="text-2xl font-mono mt-1 tracking-wider">
            {times[cities[activeIndex].name] || "--:--:--"}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimationCard;
