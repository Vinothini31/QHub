import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import "../styles/chat.css";

export default function ChatWindow({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
}) {
  const bottomRef = useRef();

  // Auto scroll when messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-window">

      {/* MESSAGES LIST */}
      <div className="messages-box">
        {messages.length === 0 && (
          <p style={{ color: "#999", textAlign: "center" }}>Start a conversation...</p>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
          />
        ))}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT BOX AT BOTTOM */}
      <div className="input-area">
        <input
          type="text"
          value={newMessage}
          placeholder="Send a message..."
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}
