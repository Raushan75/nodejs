import { io } from "socket.io-client";

// Connect to the chat server through the same /api proxy as every other call
// (Nginx in production, Vite in development). The login cookie is sent along,
// and the server uses it to know who we are.
export const createSocketConnection = () =>
  io(window.location.origin, {
    path: "/api/socket.io",
    withCredentials: true,
  });
