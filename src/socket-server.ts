
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

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  console.error('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! Socket.IO HTTP Server Error                   !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(err);
  if (err.code === 'EADDRINUSE') {
    console.error(`\nError: Port ${PORT} is already in use.`);
    console.error('Another application might be using this port, or another instance of this socket server might already be running.');
    console.error('Please check your running processes or try a different port.');
  }
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
  process.exit(1); // Exit if the server can't start
});

httpServer.listen(PORT, () => {
  console.log('\n===================================================');
  console.log(`✅ Socket.IO server successfully started.`);
  console.log(`👂 Listening on: http://localhost:${PORT}`);
  console.log('Ensure your Next.js app (usually on http://localhost:3000) can reach this address.');
  console.log('To start this server, run "npm run socket:dev" in a separate terminal.');
  console.log('===================================================\n');
});

// Graceful shutdown (optional but good practice)
process.on('SIGINT', () => {
  console.log('\nShutting down Socket.IO server...');
  io.close(() => {
    console.log('Socket.IO server connections closed.');
    httpServer.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
});

