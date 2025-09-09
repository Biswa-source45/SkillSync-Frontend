/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiSmile } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { freezyChat } from "../../../services/aiAPI";
import botimg from "../../../assets/botimg.png";
import { toast } from "sonner";

/* Code block renderer */
const CodeBlock = ({ inline, className, children, ...props }) => {
  const code = String(children).replace(/\n$/, "");
  const language = /language-(\w+)/.exec(className || "")?.[1] || "text";

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => alert("Copy failed"));
  };

  if (inline) {
    return (
      <code
        className={`${className} bg-neutral-700 px-1 py-0.5 rounded text-xs`}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-2">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 bg-neutral-700 text-white px-2 py-1 rounded cursor-pointer z-10 hover:bg-neutral-600 transition text-[10px]"
        type="button"
      >
        Copy
      </button>
      <SyntaxHighlighter
        language={language}
        style={materialDark}
        PreTag="div"
        className="!text-xs custom-scrollbar"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

/* Typing dots animation */
const TypingDots = () => (
  <motion.div className="flex gap-1 items-center text-neutral-400">
    <motion.span
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 0.4, delay: 0 }}
      className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
    />
    <motion.span
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 0.4, delay: 0.15 }}
      className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
    />
    <motion.span
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 0.4, delay: 0.3 }}
      className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
    />
  </motion.div>
);

/* Streaming text effect */
const streamMessage = async (fullText, setMessages, setIsStreaming) => {
  setIsStreaming(true);
  let current = "";
  for (let i = 0; i < fullText.length; i++) {
    current += fullText[i];
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { sender: "assistant", text: current };
      return copy;
    });
    await new Promise((r) => setTimeout(r, 12));
  }
  setIsStreaming(false);
};

/* Build history */
const buildHistory = (messages) =>
  messages.map((m) => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.text,
  }));

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "👋 Hi — I'm **Freezy** ❄️ your friendly AI from SkillSync. I can help with posts, profiles, code snippets, and more. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || isStreaming) return;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: trimmed },
      { sender: "assistant", text: "" }, // empty bubble immediately
    ]);
    setLoading(true);

    try {
      const history = buildHistory([
        ...messages,
        { sender: "user", text: trimmed },
      ]);
      const res = await freezyChat({ message: trimmed, history });
      const reply =
        res?.data?.reply ??
        (res?.data?.raw ? JSON.stringify(res.data.raw) : "⚠️ No reply.");

      await streamMessage(reply, setMessages, setIsStreaming);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Freezy failed to respond. Try again.");
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          sender: "assistant",
          text: "❌ Something went wrong.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 border-l border-neutral-700 rounded-l-xl">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b rounded-t-xl border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-900">
        <div className="relative">
          <img src={botimg} alt="Freezy" className="w-7 h-7 rounded-full" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs text-white">Freezy • SkillSync</p>
          <p className="text-[10px] text-green-400">Online • AI Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-2 ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender !== "user" && (
              <img
                src={botimg}
                alt="bot"
                className="w-6 h-6 rounded-full object-cover mt-1"
              />
            )}
            <div
              className={`px-3 py-2 rounded-2xl break-words max-w-[75%] ${
                m.sender === "user"
                  ? "bg-neutral-800 text-white rounded-br-md"
                  : "bg-neutral-800 text-white rounded-bl-md border border-neutral-700/50"
              }`}
            >
              {m.sender === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 last:mb-0 space-y-1 ml-4 list-disc">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 last:mb-0 space-y-1 ml-4 list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {m.text || ""}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="leading-relaxed">{m.text}</p>
              )}
            </div>
            {m.sender === "user" && (
              <img
                src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
                alt="User avatar"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-400 mt-1"
              />
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {(loading || isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2"
          >
            <img
              src={botimg}
              alt="bot"
              className="w-6 h-6 rounded-full object-cover mt-1"
            />
            <div className="bg-neutral-800 text-white rounded-2xl rounded-bl-md border border-neutral-700/50 px-3 py-2">
              <TypingDots />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-2 py-2 border-t border-neutral-700 bg-neutral-800/50">
        <div className="flex items-center gap-2">
          <button type="button" className="text-neutral-400 p-1">
            <FiSmile size={14} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Freezy..."
            className="flex-1 resize-none bg-transparent text-white placeholder:text-neutral-500 outline-none px-2 py-1 rounded text-xs"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || isStreaming}
            className="p-2 text-white disabled:text-neutral-500"
          >
            <FiSend size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
