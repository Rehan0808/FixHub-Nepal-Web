"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { Send, MessageSquare, Search, User as UserIcon, Trash2 } from "lucide-react";
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

interface UserConversation {
  _id: string;
  fullName: string;
  email: string;
  lastMessage?: string;
  unreadCount?: number;
}

export default function AdminChat() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserConversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedUserRef = useRef<UserConversation | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5050");
    socketRef.current = socket;

    socket.on("receive_message", (msg: ChatMessage) => {
      console.log(`[Admin Chat] Received message:`, msg);
      
      // Check if message belongs to currently selected user's room
      const currentUser = selectedUserRef.current;
      if (currentUser && msg.room === `chat-${currentUser._id}`) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some(m => m._id === msg._id)) {
            return prev;
          }
          return [...prev, msg];
        });
      }
      
      // Update last message in user list
      setUsers((prev) =>
        prev.map((u) =>
          msg.room === `chat-${u._id}` ? { ...u, lastMessage: msg.message } : u
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Keep ref in sync with selectedUser state
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        const allUsers = res.data.data || res.data.users || [];
        setUsers(allUsers.filter((u: any) => u.role !== "admin"));
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (chatUser: UserConversation) => {
    setSelectedUser(chatUser);
    selectedUserRef.current = chatUser; // Update ref immediately
    setMessages([]); // Clear previous messages
    const roomName = `chat-${chatUser._id}`;
    console.log(`[Admin Chat] Loading messages for user: ${chatUser.fullName}, room: ${roomName}`);
    
    if (socketRef.current) {
      socketRef.current.emit("join_room", { roomName, userId: "admin_user" });
      
      // Remove previous listener to avoid duplicates
      socketRef.current.off("chat_history");
      
      socketRef.current.on("chat_history", (history: ChatMessage[]) => {
        console.log(`[Admin Chat] Received chat history: ${history.length} messages`);
        setMessages(history);
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !socketRef.current) return;

    const roomName = `chat-${selectedUser._id}`;
    console.log(`[Admin Chat] Sending message to room: ${roomName}, message: ${newMessage}`);

    socketRef.current.emit("send_message", {
      message: newMessage,
      room: roomName,
      author: "Admin Support",
      authorId: "admin_user",
    });
    setNewMessage("");
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/chat/clear/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages([]);
      toast.success("Chat cleared!");
    } catch {
      toast.error("Failed to clear chat");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Admin Chat</h1>
        <p className="text-gray mt-1">Communicate with customers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-border overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <div className="flex h-full">
          <div className="w-80 border-r border-gray-border flex flex-col">
            <div className="p-4 border-b border-gray-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <button key={u._id} onClick={() => loadMessages(u)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-light transition-colors text-left ${selectedUser?._id === u._id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">{u.fullName?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-dark text-sm truncate">{u.fullName}</p>
                    <p className="text-xs text-gray truncate">{u.email}</p>
                  </div>
                </button>
              )) : (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="h-8 w-8 text-gray-border mx-auto mb-2" />
                  <p className="text-sm text-gray">No conversations</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b border-gray-border flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-xs">{selectedUser.fullName?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark text-sm">{selectedUser.fullName}</p>
                    <p className="text-xs text-gray">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-10 w-10 text-gray mx-auto mb-2" />
                      <p className="text-gray text-sm">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg._id} className={`flex ${msg.authorId === "admin_user" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[70%]">
                          {msg.authorId !== "admin_user" && (
                            <p className="text-xs text-gray mb-1 px-2">{msg.author}</p>
                          )}
                          <div className={`px-4 py-2 rounded-2xl text-sm ${msg.authorId === "admin_user" ? "bg-primary text-white rounded-br-sm" : "bg-white text-dark border border-gray-border rounded-bl-sm"}`}>
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.authorId === "admin_user" ? "text-white/70" : "text-gray"}`}>
                              {format(new Date(msg.createdAt), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-border">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 px-4 py-2.5 border border-gray-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    <button onClick={sendMessage} className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary-dark transition-colors">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-border mx-auto mb-4" />
                  <p className="text-gray font-medium">Select a customer to start chatting</p>
                  <p className="text-sm text-gray/60 mt-1">Choose from the list on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
