import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL, getErrorMessage } from "../libs/utils/constants";
import useToast from "../libs/utils/useToast";

const MAX_LENGTH = 2000; // same limits as the backend (routes/ai.js)
const MAX_HISTORY = 20;

const GREETING =
  "Hi! I'm the DevTinder assistant. I can help you write your bio, pick skills, think of a first message for a new connection, or answer coding questions.";

const SUGGESTIONS = [
  "Improve my profile bio",
  "Which skills should I list?",
  "Suggest a first message to a new connection",
];

// Floating AI chat box (bottom-right), shown on every page when logged in.
const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  // { role: "user" | "assistant", content: string }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, open]);

  const send = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || thinking) return;

    const next = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setText("");
    setThinking(true);
    try {
      // only the latest turns are sent; the backend rejects longer conversations
      let history = next.slice(-MAX_HISTORY);
      // the API needs the conversation to start with a user message
      while (history.length && history[0].role !== "user") history = history.slice(1);

      const res = await axios.post(
        BASE_URL + "/ai/chat",
        { messages: history },
        { withCredentials: true },
      );
      setMessages((current) => [
        ...current,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      // take the failed message back out and put it in the box to retry
      setMessages((current) => current.slice(0, -1));
      setText(trimmed);
    } finally {
      setThinking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(text);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="card bg-base-100 shadow-2xl w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-6rem)] flex flex-col border border-base-300">
          <div className="flex items-center justify-between p-3 border-b border-base-300">
            <div>
              <h2 className="font-semibold">✨ AI Assistant</h2>
              <p className="text-xs text-base-content/60">Powered by Claude</p>
            </div>
            <div className="flex gap-1">
              {messages.length > 0 && (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setMessages([])}
                  disabled={thinking}
                >
                  New chat
                </button>
              )}
              <button
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 text-sm">
            <div className="chat chat-start">
              <div className="chat-bubble">{GREETING}</div>
            </div>
            {messages.length === 0 && (
              <div className="flex flex-col items-start gap-2 mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="btn btn-outline btn-xs h-auto py-1 text-left normal-case"
                    onClick={() => send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat ${m.role === "user" ? "chat-end" : "chat-start"}`}>
                <div
                  className={`chat-bubble whitespace-pre-wrap wrap-break-word ${m.role === "user" ? "chat-bubble-primary" : ""}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="chat chat-start">
                <div className="chat-bubble">
                  <span className="loading loading-dots loading-sm" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-base-300">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input input-sm flex-1"
              placeholder="Ask anything..."
              maxLength={MAX_LENGTH}
              aria-label="Message to the AI assistant"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={thinking || !text.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className="btn btn-primary btn-circle btn-lg shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        title="AI Assistant"
      >
        {open ? "✕" : "✨"}
      </button>
    </div>
  );
};

export default AiAssistant;
