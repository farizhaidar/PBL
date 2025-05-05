"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.min.css";

export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([
    { text: "Halo! Saya adalah asisten virtual. Silakan tanyakan apa saja tentang layanan kami seputar pinjaman dan perbankan. 😊", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, { text: trimmed, isUser: true }]);
    setInputText("");
    setIsLoading(true);

    try {
      // Send message to your chatbot API
      const response = await fetch("http://elchatbot.akmalnurwahid.my.id:5678/webhook/bank-chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmed // Menggunakan 'prompt' sesuai kebutuhan API
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response to chat (menggunakan 'output' dari response)
      setMessages((prevMessages) => [
        ...prevMessages, 
        { text: data.output || "Maaf, saya tidak mengerti pertanyaan Anda.", isUser: false }
      ]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prevMessages) => [
        ...prevMessages, 
        { text: "Maaf, terjadi kesalahan saat memproses permintaan Anda.", isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
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

      <div className="chat-container d-flex flex-column p-3 overflow-auto flex-grow-1">
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

      <div className="chat-input-container p-3 mb-5 d-flex align-items-center">
        <textarea
          className="chat-input flex-grow-1"
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
          className={`send-button ms-2 ${isLoading ? "disabled" : ""}`}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="bi bi-arrow-clockwise"></i>
          ) : (
            <i className="bi bi-arrow-up"></i>
          )}
        </button>
      </div>
    </div>
  );
}