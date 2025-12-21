import React from "react";
import "../styles/chat.css";

export default function Sidebar({ chats = [], onSelect, onLogout, isOpen, onClose }) {
  // Ensure chats is always an array
  const chatList = Array.isArray(chats) ? chats : [];

  // Function to get display title from chat
  const getDisplayTitle = (chat) => {
    // If chat has a custom title, use it
    if (chat.title && chat.title.trim()) {
      return chat.title;
    }
    
    // Otherwise, get the first user message
    if (chat.messages && chat.messages.length > 0) {
      const firstMessage = chat.messages.find(msg => msg.role === "user");
      if (firstMessage && firstMessage.content) {
        return firstMessage.content;
      }
    }
    
    // Fallback
    return "New Chat";
  };

  return (
    <div className={"sidebar" + (isOpen ? " open" : "")}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className="sidebar-title">History</h3>
        {/* Close button visible on mobile */}
        <button className="close-btn" onClick={onClose} aria-label="Close history">✕</button>
      </div>

      <div className="chat-list">
        {chatList.length === 0 ? (
          <p className="empty-message">No chats yet</p>
        ) : (
          chatList.map((chat) => {
            const displayTitle = getDisplayTitle(chat);
            const truncatedTitle = displayTitle.length > 30
              ? displayTitle.slice(0, 30) + "..."
              : displayTitle;
            
            return (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => onSelect(chat.id)}
                title={displayTitle}
              >
                💬 {truncatedTitle}
              </div>
            );
          })
        )}
      </div>

      <div style={{ padding: 12 }}>
        <a href="/documents" style={{ color: 'white', textDecoration: 'none' }}>📁 Documents</a>
      </div>

      {/* LOGOUT BUTTON (BOTTOM-LEFT) */}
      <button className="logout-btn" onClick={onLogout}>
        🔒 Logout
      </button>
    </div>
  );
}
