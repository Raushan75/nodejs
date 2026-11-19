import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  BASE_URL,
  FALLBACK_PHOTO,
  getErrorMessage,
  handleImageError,
} from "../libs/utils/constants";
import { createSocketConnection } from "../libs/utils/socket";
import useToast from "../libs/utils/useToast";

const MESSAGE_MAX = 1000; // same limit as the backend (models/message.js)

// merge new messages into the list: no duplicates, oldest first
const mergeMessages = (current, incoming) => {
  const byId = new Map(current.map((m) => [m._id, m]));
  incoming.forEach((m) => byId.set(m._id, m));
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// 1-to-1 real-time chat with one connection: /chat/:targetUserId
const Chat = () => {
  const { targetUserId } = useParams();
  const user = useSelector((store) => store.user);
  const toast = useToast();

  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // load the history once
  useEffect(() => {
    let cancelled = false;
    axios
      .get(BASE_URL + "/chat/" + targetUserId, { withCredentials: true })
      .then((res) => {
        if (cancelled) return;
        setTargetUser(res.data.targetUser);
        setMessages((current) => mergeMessages(current, res.data.messages));
      })
      .catch((err) => {
        if (cancelled) return;
        const message = getErrorMessage(err);
        setLoadError(message || "Could not open this chat");
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId, toast]);

  // live connection: join this chat's room and listen for new messages
  useEffect(() => {
    const socket = createSocketConnection();
    socketRef.current = socket;

    // "connect" also fires after an automatic reconnect, so we re-join then too
    socket.on("connect", () => {
      socket.emit("joinChat", { targetUserId }, (res) => {
        if (res?.error) {
          toast.error(res.error);
          setConnected(false);
        } else {
          setConnected(true);
        }
      });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      setConnected(false);
      toast.error("Chat connection failed: " + err.message);
    });
    socket.on("messageReceived", (message) => {
      setMessages((current) => mergeMessages(current, [message]));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [targetUserId, toast]);

  // keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !socketRef.current) return;
    setSending(true);
    socketRef.current.emit(
      "sendMessage",
      { targetUserId, text: trimmed },
      (res) => {
        setSending(false);
        if (res?.error) toast.error(res.error);
        else setText("");
      },
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center my-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 px-4 text-center">
        <p className="text-error">{loadError}</p>
        <Link to="/connections" className="btn btn-outline">
          Back to connections
        </Link>
      </div>
    );
  }

  const name = `${targetUser.firstName} ${targetUser.lastName || ""}`.trim();

  return (
    <div className="max-w-3xl mx-auto px-4 my-6">
      <div className="card bg-base-100 shadow-md h-[calc(100vh-12rem)] min-h-96 flex flex-col">
        {/* header */}
        <div className="flex items-center gap-3 p-4 border-b border-base-300">
          <Link to="/connections" className="btn btn-ghost btn-sm btn-circle" aria-label="Back">
            ←
          </Link>
          <img
            src={targetUser.photoUrl || FALLBACK_PHOTO}
            alt={name}
            onError={handleImageError}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <h1 className="font-semibold truncate">{name}</h1>
            <p className="text-xs text-base-content/60 flex items-center gap-1">
              <span
                className={`inline-block w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-base-content/30"}`}
              />
              {connected ? "Connected" : "Connecting..."}
            </p>
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-center text-base-content/50 mt-10">
              No messages yet. Say hi to {targetUser.firstName}! 👋
            </p>
          )}
          {messages.map((m) => {
            const mine = m.fromUserId === user._id;
            return (
              <div key={m._id} className={`chat ${mine ? "chat-end" : "chat-start"}`}>
                <div
                  className={`chat-bubble whitespace-pre-wrap wrap-break-word ${mine ? "chat-bubble-primary" : ""}`}
                >
                  {m.text}
                </div>
                <div className="chat-footer opacity-50 text-xs mt-1">
                  {formatTime(m.createdAt)}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-base-300">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input flex-1"
            placeholder={connected ? "Type a message..." : "Connecting..."}
            maxLength={MESSAGE_MAX}
            disabled={!connected}
            aria-label="Message"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!connected || sending || !text.trim()}
          >
            {sending && <span className="loading loading-spinner loading-sm" />}
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
