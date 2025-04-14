"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.min.css";
  
export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages([trimmed, ...messages]); // pesan terbaru di atas
    setInputText("");
  };

  return (
    <div className="vh-100 bg-black text-light d-flex flex-column">
      <Navbar />

      {/* Chat bubble container */}
      <div className="chat-container flex-grow-1 d-flex flex-column-reverse p-3">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className="chat-bubble user-bubble"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg}
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-container p-3 mb-5">
        <textarea
          className="chat-input"
          placeholder="Tanya apapun!"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="btn send-button" onClick={handleSend}>
          <i className="bi bi-arrow-up text-white"></i>
        </button>
      </div>
    </div>
  );
}
