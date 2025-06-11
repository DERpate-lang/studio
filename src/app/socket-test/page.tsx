
"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { PageContainer } from "@/components/page-container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import DecorativeBorder from "@/components/decorative-border";

// Define socket outside component to maintain instance across re-renders
// and to ensure it's only initialized once on the client.
let socket: Socket | undefined;

export default function SocketTestPage() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== "undefined") {
        console.log("SocketTestPage: useEffect attempting to establish socket connection.");
        setConnectionError(null); // Clear previous errors on new attempt

        if (!socket) {
            console.log("SocketTestPage: No active socket instance. Creating new connection to http://localhost:3001");
            socket = io("http://localhost:3001", {
                reconnectionAttempts: 3, // Limit reconnection attempts to avoid spamming
                reconnectionDelay: 2000, // Slightly longer delay
            });

            socket.on("connect", () => {
                console.log("Connected to Socket.IO server:", socket?.id);
                setChatLog(prev => [...prev, "System: Connected to chat server."]);
                setIsConnected(true);
                setConnectionError(null); // Clear error on successful connection
            });

            socket.on("chat message", (msg: string) => {
                setChatLog((prevChatLog) => [...prevChatLog, msg]);
            });

            socket.on("disconnect", (reason) => {
                console.log("Disconnected from Socket.IO server:", reason);
                if (socket?.active || reason === "io client disconnect") { 
                    // No explicit message if socket is being undefined in cleanup.
                } else {
                    const errorMsg = `System: Disconnected from chat server (${reason}). Potential issue or server restart.`;
                    setChatLog(prev => [...prev, errorMsg]);
                    setConnectionError(errorMsg);
                    setIsConnected(false);
                }
            });

            socket.on("connect_error", (err) => {
                console.error("Socket.IO connection error details:", err); // Log the full error object
                const errorMsg = `System: Connection error - "${err.message}". This usually means the Socket.IO server (run with 'npm run socket:dev') is not running or is unreachable. Please CHECK THE TERMINAL where you started 'npm run socket:dev' for any errors (like 'EADDRINUSE' if port 3001 is busy).`;
                setChatLog(prev => [...prev, errorMsg]);
                setConnectionError(errorMsg);
                setIsConnected(false);
            });
        } else {
             console.log("SocketTestPage: Attempting to use existing socket instance. ID:", socket.id, "Connected:", socket.connected);
             if (!socket.connected) {
                console.log("SocketTestPage: Existing socket not connected. Calling socket.connect().");
                socket.connect(); // Attempt to reconnect if instance exists but isn't connected
             } else {
                setIsConnected(true);
                setConnectionError(null);
             }
        }
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        console.log("SocketTestPage: Cleaning up socket (disconnecting and removing instance) on unmount. ID:", socket.id);
        socket.disconnect();
        socket = undefined; // Make sure a new socket is created if the page is revisited
        setIsConnected(false); // Update UI state
      }
    };
  }, []); 

  useEffect(() => {
    // Auto-scroll to the bottom of the chat log
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && socket?.connected) {
      socket.emit("chat message", message);
      setMessage("");
    } else if (!socket?.connected) {
        const notConnectedMsg = "System: You are not connected. Message not sent.";
        setChatLog(prev => [...prev, notConnectedMsg]);
        setConnectionError(notConnectedMsg + " Please ensure the Socket.IO server is running.");
    }
  };

  return (
    <PageContainer title="Real-Time Chat Room">
      <DecorativeBorder>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Live Chat</CardTitle>
          <CardDescription className="font-body text-foreground/80">
            Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? "Connected" : "Disconnected"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectionError && !isConnected && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm font-body">
                <p className="font-semibold">Connection Issue!</p>
                <p>{connectionError}</p>
                <p className="mt-2"><strong>Troubleshooting Steps:</strong></p>
                <ol className="list-decimal list-inside ml-4 text-xs">
                    <li>Is the Socket.IO server running? In a separate terminal, execute: <code>npm run socket:dev</code></li>
                    <li>Check the terminal output of <code>npm run socket:dev</code> for any errors (e.g., "EADDRINUSE" if port 3001 is already taken).</li>
                    <li>Ensure no firewall is blocking connections to port 3001 on your machine.</li>
                    <li>Open your browser's developer console (Ctrl+Shift+J or Cmd+Opt+J) and look for more detailed network error messages in the "Console" or "Network" tabs when the page tries to connect.</li>
                </ol>
              </div>
            )}
            <ScrollArea className="h-72 w-full rounded-md border bg-muted/30 p-4">
              <div ref={chatLogRef} className="space-y-2">
                {chatLog.map((msg, index) => (
                  <p key={index} className={`text-sm font-body ${msg.startsWith('System:') ? 'text-accent' : 'text-foreground/90'}`}>
                    {msg}
                  </p>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow font-body"
                disabled={!isConnected}
              />
              <Button type="submit" className="font-body" disabled={!isConnected || !message.trim()}>
                Send
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground font-body">
                This is a basic chat. Messages are broadcast to everyone in this room.
            </p>
        </CardFooter>
      </DecorativeBorder>
      <div className="mt-6 text-sm text-muted-foreground p-4 bg-card/50 rounded-md border border-primary/10">
        <p className="font-headline text-lg text-primary mb-2">How to use this chat:</p>
        <ol className="list-decimal list-inside space-y-1 font-body">
          <li>Start the main Next.js app: <code>npm run dev</code> (if not already running).</li>
          <li>In a <strong>separate terminal window</strong>, start the Socket.IO server: <code>npm run socket:dev</code>. Watch this terminal for success or error messages from the server.</li>
          <li>Open this page in multiple browser tabs or on different devices connected to your local network (if your firewall allows connections to port 3001) to see real-time communication.</li>
        </ol>
      </div>
    </PageContainer>
  );
}
