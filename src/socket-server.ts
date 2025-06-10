
import { Server } from "socket.io";
import http from "http";

// Create an HTTP server
const httpServer = http.createServer((req, res) => {
  // This basic HTTP server doesn't need to do much for Socket.IO itself
  // It's just a host for the Socket.IO server
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO server is running');
});

// Initialize Socket.IO server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allow connections from your Next.js app
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("chat message", `System: Welcome! Your ID is ${socket.id}`);


  socket.on("chat message", (msg: string) => {
    // For a simple chat, prefix with sender's ID or a generic "User"
    const messageToSend = `${socket.id.substring(0,5)}: ${msg}`;
    console.log("message from", socket.id, ":", msg);
    io.emit("chat message", messageToSend); // Broadcast to all clients including sender
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("chat message", `System: User ${socket.id.substring(0,5)} has disconnected.`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});

// Graceful shutdown (optional but good practice)
process.on('SIGINT', () => {
  console.log('Shutting down Socket.IO server...');
  io.close(() => {
    console.log('Socket.IO server closed.');
    httpServer.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
});
