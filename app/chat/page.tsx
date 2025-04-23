"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.min.css";

export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return; // Jangan kirim pesan jika sedang loading

    // Pesan user
    setMessages([...messages, { text: trimmed, isUser: true }]);
    setInputText("");
    setIsLoading(true); // Mulai status loading

    // Simulasi respons bot setelah 1 detik
    setTimeout(() => {
      const botResponse = "Ini respons dari bot"; // Simulasi respons bot
      setMessages((prevMessages) => [...prevMessages, { text: botResponse, isUser: false }]);
      setIsLoading(false); // Selesai loading, aktifkan kembali tombol
    }, 1000); // Delay 1 detik sebelum bot merespons
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="d-flex flex-column vh-100 bg-black text-light">
      <Navbar />
      {[...Array(50)].map((_, i) => (
        <span key={i} className="star"></span>
      ))}

      {/* Chat bubble container */}
      <div className="chat-container d-flex flex-column p-3 overflow-auto">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`chat-bubble ${msg.isUser ? "user-bubble" : "bot-bubble"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.text}
          </motion.div>
        ))}
        <div ref={bottomRef} />
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
        <button
          className={`btn send-button ${isLoading ? "disabled" : ""}`} // Menonaktifkan tombol jika sedang loading
          onClick={handleSend}
          disabled={isLoading} // Menonaktifkan tombol jika sedang loading
        >
          {isLoading ? (
            <i className="bi bi-arrow-clockwise text-white"></i> // Ikon loading
          ) : (
            <i className="bi bi-arrow-up text-white"></i>
          )}
        </button>
      </div>
    </div>
  );
}
