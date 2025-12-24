// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "../styles/chat.css";
import API from "../api"; // ✅ use API instance

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(
    Number(localStorage.getItem("currentChatId")) || null
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ---------------- FETCH CHATS ----------------
  const fetchChats = useCallback(async () => {
    try {
      const res = await API.get("/chat/chats/");
      const chatList = res.data?.results || res.data || [];
      setChats(chatList);

      const savedId = Number(localStorage.getItem("currentChatId"));
      if (savedId) {
        const chat = chatList.find(c => c.id === savedId);
        if (chat) {
          setCurrentChatId(chat.id);
          setMessages(chat.messages || []);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (chats.length && !currentChatId) {
      setCurrentChatId(chats[0].id);
      setMessages(chats[0].messages || []);
      localStorage.setItem("currentChatId", chats[0].id);
    }
  }, [chats, currentChatId]);

  // ---------------- NEW CHAT ----------------
  const handleNewChat = async () => {
    try {
      const res = await API.post("/chat/chats/", { title: "" });
      setChats([res.data, ...chats]);
      setCurrentChatId(res.data.id);
      localStorage.setItem("currentChatId", res.data.id);
      setMessages([]);
      setNewMessage("");
      setSidebarOpen(false);
      return res.data.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // ---------------- DOCUMENT UPLOAD ----------------
  const handleUploadClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert("File too large (max 100 MB)");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await API.post("/documents/upload/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      alert("Document uploaded successfully");

      await fetchChats();
      const chatId = res.data?.chat_id;
      if (chatId) {
        setCurrentChatId(chatId);
        localStorage.setItem("currentChatId", chatId);
        setMessages([]);
      }
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  // ---------------- SELECT CHAT ----------------
  const handleSelectChat = async (id) => {
    setCurrentChatId(id);
    localStorage.setItem("currentChatId", id);

    const chat = chats.find(c => c.id === id);
    if (chat) {
      setMessages(chat.messages || []);
    } else {
      try {
        const res = await API.get(`/chat/chats/${id}/messages/`);
        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    }
    setNewMessage("");
    setSidebarOpen(false);
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    let chatId = currentChatId;
    if (!chatId) chatId = await handleNewChat();

    const userMsg = { id: Date.now(), role: "user", content: newMessage };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");

    const placeholderId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      { id: placeholderId, role: "assistant", content: "Thinking..." },
    ]);

    try {
      const res = await API.post(`/chat/chats/${chatId}/messages/`, {
        content: userMsg.content,
      });

      setMessages(prev =>
        prev.map(msg =>
          msg.id === placeholderId ? res.data.assistant_message : msg
        )
      );
    } catch (err) {
      console.error(err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === placeholderId
            ? { ...msg, content: "Error: Could not get response" }
            : msg
        )
      );
    }
  };

  return (
    <div className="chat-layout">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        chats={chats}
        onSelect={handleSelectChat}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="chat-main">
        <div className="chat-top-bar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open history">☰</button>
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>

          <button
            className="new-chat-btn"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "📁 Upload Document"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </div>

        {uploading && (
          <div className="upload-progress-container">
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}

        <ChatWindow
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
