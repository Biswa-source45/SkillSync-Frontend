// src/services/aiAPI.js
import apiClient from "./apiClient";

/**
 * Non-streaming chat: returns axios response with { reply, raw }
 * body: { message: string, history: [{role, content}, ...] }
 */
export const freezyChat = ({ message, history = [] }) => {
  return apiClient.post("/ai/freezy/", { message, history });
};

/**
 * Streaming helper (optional). Calls POST /api/ai/freezy/stream/ and parses SSE-ish lines.
 * onMessage receives each parsed data string (raw JSON string or partial).
 * Returns an AbortController so caller can cancel.
 *
 * Usage:
 *   const controller = freezyChatStream({ message, history, onMessage, onError, onDone });
 *   controller.abort(); // to cancel
 */
export const freezyChatStream = async ({ message, history = [], onMessage, onError, onDone }) => {
  const controller = new AbortController();
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/freezy/stream/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify({ message, history }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      onError?.(err);
      return controller;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // parse SSE-like "data: ..." lines
      let parts = buf.split(/\n\n/);
      buf = parts.pop(); // remainder
      for (const part of parts) {
        const lines = part.split("\n").map(l => l.trim()).filter(Boolean);
        for (const l of lines) {
          if (l.startsWith("data:")) {
            const payload = l.slice("data:".length).trim();
            onMessage?.(payload);
          } else {
            onMessage?.(l);
          }
        }
      }
    }

    onDone?.();
    return controller;
  } catch (err) {
    if (err.name === "AbortError") {
      // aborted, call onDone
      onDone?.();
      return controller;
    }
    onError?.(err);
    return controller;
  }
};
