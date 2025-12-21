import React from "react";
import ReactMarkdown from "react-markdown";   // ✅ ADD THIS
import "../styles/chat.css";

export default function ChatMessage({ role, content }) {
  return (
    <div className={`message-row ${role === "user" ? "user-msg" : "bot-msg"}`}>
      <div className="message-bubble">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
