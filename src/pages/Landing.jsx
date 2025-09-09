/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import StarsBackground from "../components/Starbackground";
import {
  Users,
  BookOpen,
  TrendingUp,
  Search,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import MotionHighlight from "../components/MotionHighlight";
import InfiniteScrollCards from "../UIvault/infinitescroll/infinitescroll";
import logoimg from "../assets/logo transparrent.png";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Connect with Professionals",
    description:
      "Follow developers, educators, and learners to grow your professional network.",
  },
  {
    icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    title: "Share Learning Resources",
    description:
      "Post tutorials, articles, or courses and contribute to the learning community.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-green-400" />,
    title: "Engage & Collaborate",
    description:
      "Like, comment, and collaborate on trending posts from global developers.",
  },
  {
    icon: <Search className="w-6 h-6 text-pink-400" />,
    title: "Powerful Search",
    description:
      "Find resources and users easily with smart search functionality.",
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-yellow-400" />,
    title: "Interactive Discussions",
    description:
      "Comment and engage in discussions to deepen your understanding.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
    title: "Secure & Private",
    description:
      "Your data is protected with secure authentication and privacy controls.",
  },
];

function Landing() {
  return (
    <div className="relative overflow-hidden">
      <StarsBackground className="h-screen flex gap-3 flex-col align-middle justify-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center pt-10"
        >
          <div className="bg-neutral-800/80 text-xs md:text-sm px-4 py-1 rounded-full flex items-center gap-2 shadow-lg border border-neutral-700 text-neutral-200 font-medium backdrop-blur mt-5">
            <span className="text-green-400 text-base">🚀</span>
            <span className="ml-0 text-neutral-300">New SkillSync is here</span>
            <span className="ml-0 text-neutral-400">&rarr;</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center font-bold text-[2.5rem] sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl bg-gradient-to-b from-neutral-100  via-neutral-400 to-purple-300 bg-clip-text text-transparent mt-10 md:mt-15 px-4 lg:leading-22 flex justify-center align-middle "
        >
          Learn. Share. Grow. <br className="hidden md:block" /> All in One
          Platform
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center text-neutral-400 text-sm sm:text-sm md:text-md font-medium mt-6 md:mt-8 px-4 max-w-2xl mx-auto"
        >
          SkillSync empowers developers and learners to connect, share
          resources, follow creators, explore knowledge, and build professional
          networks — all in one place. Share insights, <br /> post content,
          follow peers, and grow your skills collaboratively.
        </motion.p>

        {/* CTA Button - Simple link to register */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="flex justify-center mt-10 md:mt-14"
        >
          <Link
            to="/register"
            className="bg-white text-neutral-900 font-semibold px-7 py-3 rounded-2xl shadow-lg hover:bg-neutral-100 transition flex items-center justify-center gap-2 text-sm md:text-l z-2"
          >
            Join SkillSync Now &rarr;
          </Link>
        </motion.div>
      </StarsBackground>

      <section className="py-16 px-4 bg-[radial-gradient(ellipse_at_top,_#261230_0%,_#000_100%)] flex justify-center">
        <div className="max-w-6xl w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-10">
            Why Choose SkillSync?
          </h2>
          <MotionHighlight items={features} hover />
        </div>
      </section>

      <section className="py-16 px-4 bg-black">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-5">
          What Our Users Say
        </h2>
        <InfiniteScrollCards />
      </section>

      <footer className="bg-black border-t border-neutral-800 py-10 px-4 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Tagline */}
          <div>
            <img
              src={logoimg}
              alt="SkillSync Logo"
              className="h-20 mb-3"
            />
            <p className="text-sm text-gray-400 max-w-xs">
              SkillSync — Connect, Share & Learn. The collaborative hub for
              developers and learners.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="#features"
                  className="hover:text-purple-400 transition"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="hover:text-purple-400 transition"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-purple-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-purple-400 transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact and Social */}
          <div>
            <h4 className="text-white font-semibold mb-3">Connect With Us</h4>
            <p className="text-sm text-gray-400 mb-3">contact@skillsync.com</p>
            <div className="flex space-x-4 text-lg text-gray-400">
              <a href="#" className="hover:text-purple-400">
                GitHub
              </a>
              <a href="#" className="hover:text-purple-400">
                LinkedIn
              </a>
              <a href="#" className="hover:text-purple-400">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Landing;