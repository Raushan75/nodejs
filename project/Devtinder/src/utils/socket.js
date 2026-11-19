const { Server } = require("socket.io");
const { getUserFromToken } = require("../middleware/auth");
const { areConnected, getRoomId, saveMessage } = require("./chat");

// read one cookie from the raw "Cookie" header of the socket handshake
const readCookie = (header = "", name) => {
  const part = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + "="));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : undefined;
};

// Real-time chat. The user is identified from the login cookie on connect,
// never from data the browser sends, so nobody can send messages as someone else.
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // runs once per connection, before any event is handled
  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "token");
      socket.user = await getUserFromToken(token);
      next();
    } catch (err) {
      next(new Error(err.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;

    // open a chat window with one connection
    socket.on("joinChat", async ({ targetUserId } = {}, ack) => {
      const reply = typeof ack === "function" ? ack : () => {};
      try {
        if (!(await areConnected(userId, targetUserId))) {
          return reply({ error: "You can only chat with your connections" });
        }
        socket.join(getRoomId(userId, targetUserId));
        reply({ ok: true });
      } catch {
        reply({ error: "Could not open the chat" });
      }
    });

    // send a message; both people in the room receive "messageReceived"
    socket.on("sendMessage", async ({ targetUserId, text } = {}, ack) => {
      const reply = typeof ack === "function" ? ack : () => {};
      try {
        const message = await saveMessage(userId, targetUserId, text);
        io.to(getRoomId(userId, targetUserId)).emit("messageReceived", message);
        reply({ ok: true });
      } catch (err) {
        reply({ error: err.message });
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
