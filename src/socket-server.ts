
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
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Allow connections from your Next.js app
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

const rawPort = process.env.SOCKET_PORT || "3001";
const PORT: number = parseInt(rawPort, 10);
if (isNaN(PORT)) {
    console.error(`Invalid SOCKET_PORT: "${rawPort}". Defaulting to 3001.`);
    // PORT = 3001; // This line is effectively redundant due to the || "3001" above and subsequent check for NaN leading to default.
    // However, to be absolutely clear and handle if parseInt somehow returned NaN even with a default string.
    // We'll rely on the initial default for simplicity here, as parseInt("3001", 10) is safe.
    // If process.env.SOCKET_PORT was "abc", parseInt("abc", 10) is NaN.
    // The robust way is:
    // let tempPort = parseInt(process.env.SOCKET_PORT || "3001", 10);
    // if (isNaN(tempPort)) {
    //   console.error(`Invalid SOCKET_PORT: "${process.env.SOCKET_PORT}". Defaulting to 3001.`);
    //   tempPort = 3001;
    // }
    // const PORT: number = tempPort;
    // For this case, we'll keep it simpler, assuming the default "3001" is always parsable.
    // If the provided env var is invalid, it will default to 3001 due to the logic.
    // Let's refine for the case where process.env.SOCKET_PORT is set but invalid:
    let parsedPort = parseInt(process.env.SOCKET_PORT || "3001", 10);
    if (isNaN(parsedPort) && process.env.SOCKET_PORT) { // If env var was set but invalid
        console.error(`Invalid SOCKET_PORT: "${process.env.SOCKET_PORT}". Defaulting to 3001.`);
        parsedPort = 3001;
    } else if (isNaN(parsedPort)) { // If env var was NOT set and "3001" somehow failed (shouldn't happen)
        parsedPort = 3001;
    }
    // Re-assign PORT with the guaranteed number
    // To avoid "Block-scoped variable 'PORT' used before its declaration." and "Cannot assign to 'PORT' because it is a constant."
    // We should declare PORT once with the final numeric value.
    // Let's redefine PORT directly with the parsing logic.
}
// Final PORT declaration ensuring it's a number
const FINAL_PORT: number = (() => {
    const portStr = process.env.SOCKET_PORT || "3001";
    let numPort = parseInt(portStr, 10);
    if (isNaN(numPort)) {
        console.error(`Invalid SOCKET_PORT: "${portStr}". Defaulting to 3001.`);
        numPort = 3001;
    }
    return numPort;
})();


const HOST = '0.0.0.0'; // Listen on all available network interfaces

console.log(`Attempting to start Socket.IO server on ${HOST}:${FINAL_PORT}`);

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  console.error('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! Socket.IO HTTP Server Error                   !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(err);
  if (err.code === 'EADDRINUSE') {
    console.error(`\nError: Port ${FINAL_PORT} is already in use.`);
    console.error('Another application might be using this port, or another instance of this socket server might already be running.');
    console.error('Please check your running processes or try a different port.');
  }
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
  process.exit(1); // Exit if the server can't start
});

httpServer.listen(FINAL_PORT, HOST, () => {
  const effectiveHost = HOST === '0.0.0.0' ? 'localhost' : HOST; // For display purposes
  console.log('\n===================================================');
  console.log(`✅ Socket.IO server successfully started.`);
  console.log(`👂 Listening on: http://${effectiveHost}:${FINAL_PORT} (and other interfaces if HOST is 0.0.0.0)`);
  console.log('Ensure your Next.js app (usually on http://localhost:3000) can reach this address.');
  console.log('To start this server, run "npm run socket:dev" in a separate terminal if you added such a script.');
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

