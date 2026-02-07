"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import { Send, Trash2, Wrench } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface ChatMessage {
  _id: string;
  room: string;
  author: string;
  authorId: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function UserChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5050");
    socketRef.current = socket;

    const roomName = `chat-${user._id}`;

    socket.on("connect", () => {
      setIsOnline(true);
      socket.emit("join_room", { roomName, userId: user._id });
    });

    socket.on("disconnect", () => {
      setIsOnline(false);
    });

    socket.on("chat_history", (history: ChatMessage[]) => {
      console.log(`[User Chat] Received chat history: ${history.length} messages`);
      setMessages(history);
    });

    socket.on("receive_message", (msg: ChatMessage) => {
      console.log(`[User Chat] Received message:`, msg);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some(m => m._id === msg._id)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user?._id || !socketRef.current) return;

    const roomName = `chat-${user._id}`;
    console.log(`[User Chat] Sending message to room: ${roomName}, message: ${newMessage}`);

    socketRef.current.emit("send_message", {
      message: newMessage,
      room: roomName,
      author: user.fullName,
      authorId: user._id,
    });
    setNewMessage("");
  };

  const clearChat = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/chat/clear`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages([]);
      toast.success("Chat cleared!");
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark">Live Chat with Admin</h1>
        <p className="text-gray mt-1">Get instant support from our team</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-border overflow-hidden shadow-lg" style={{ height: "calc(100vh - 250px)" }}>
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">MotoFix Support</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span className="text-white/80 text-xs">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50" style={{ height: "calc(100% - 140px)" }}>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <p className="text-gray font-medium">Start a conversation</p>
              <p className="text-sm text-gray/60 mt-1">Send a message to get help from our support team</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.authorId === user?._id ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%]">
                  {msg.authorId !== user?._id && (
                    <p className="text-xs text-gray mb-1 px-2">{msg.author}</p>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.authorId === user?._id
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-white text-dark border border-gray-border rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.authorId === user?._id ? "text-white/70" : "text-gray"
                      }`}
                    >
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-border">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-3 border border-gray-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
