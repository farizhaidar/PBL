"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.min.css";

export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([
    { text: `
      <p>Halo! Saya adalah asisten virtual. Silakan tanyakan apa saja tentang layanan kami seputar pinjaman dan perbankan :blush:. Berikut adalah pertanyaan yang dapat membantu Anda:</p>
      <ul>
        <li>Apa itu <strong>[Nama pinjaman]</strong>?</li>
        <li>Apa saja syarat dan dokumen yang diperlukan untuk pinjaman <strong>[Nama pinjaman]</strong>?</li>
        <li>Apakah pengajuan peminjaman <strong>[Nama pinjaman]</strong> saya akan diterima dengan data diri saya berikut ini <em>[data diri anda (umur, pekerjaan, penghasilan, dll)]</em>?</li>
      </ul>
    `, isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { text: trimmed, isUser: true }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("https://n8n.akmalnurwahid.my.id/webhook/bank-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: data.output || "Maaf, saya tidak mengerti pertanyaan Anda.", isUser: false }
      ]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prev) => [...prev, { text: "Maaf, terjadi kesalahan saat memproses permintaan Anda.", isUser: false }]);
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
    <div className="d-flex flex-column vh-100 text-light">
      <div className="navbar-always-scrolled">
        <Navbar />
      </div>

      <div className="chat-container d-flex flex-column p-3 overflow-auto flex-grow-1">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`chat-bubble ${msg.isUser ? "user-bubble" : "bot-bubble"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.isUser ? (
              msg.text
            ) : (
              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div className="chat-bubble bot-bubble" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
              <motion.span
                style={{ display: 'inline-block', fontSize: '20px' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                •
              </motion.span>
              <motion.span
                style={{ display: 'inline-block', fontSize: '20px', marginLeft: '6px' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              >
                •
              </motion.span>
              <motion.span
                style={{ display: 'inline-block', fontSize: '20px', marginLeft: '6px' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
              >
                •
              </motion.span>
            </div>
          </motion.div>
        )}

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