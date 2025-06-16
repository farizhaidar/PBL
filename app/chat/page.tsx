"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../component/navbar";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./chat.css";

export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { 
      text: `
        <p>Halo! Saya adalah asisten virtual. Silakan tanyakan apa saja tentang layanan kami seputar pinjaman dan perbankan 😊. Berikut adalah pertanyaan yang dapat membantu Anda:</p>
        <ul>
          <li>Apa itu <strong>[Nama pinjaman]</strong>?</li>
          <li>Apa saja syarat dan dokumen yang diperlukan untuk pinjaman <strong>[Nama pinjaman]</strong>?</li>
          <li>Apakah pengajuan peminjaman <strong>[Nama pinjaman]</strong> saya akan diterima dengan data diri saya berikut ini <em>[data diri anda (umur, pekerjaan, penghasilan, dll)]</em>?</li>
        </ul>
      `, 
      isUser: false 
    },
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
        { text: data.output || "Maaf, saya tidak mengerti pertanyaan Anda.", isUser: false },
      ]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Maaf, terjadi kesalahan saat memproses permintaan Anda.", isUser: false },
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
    <div className="chat-page" style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Navbar Transparan di Atas Konten */}
      <nav style={{ 
              position: "fixed", 
              top: 0, 
              left: 0, 
              right: 0, 
              zIndex: 1000,
              // backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(5px)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}>
              <Navbar />
      </nav>

      {/* Konten Utama */}
      <div style={{
        flex: 1,
        paddingTop: "70px", // Sesuaikan dengan tinggi navbar
        display: "flex",
        flexDirection: "column"
      }}>
        <div className="container" style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
          padding: "20px"
        }}>
          {/* Area Chat */}
          <div ref={bottomRef} style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "10px 0",
            marginBottom: "20px"
          }}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                style={{
                  alignSelf: msg.isUser ? "flex-end" : "flex-start",
                  backgroundColor: msg.isUser ? "#007bff" : "#f1f1f1",
                  color: msg.isUser ? "#fff" : "#000",
                  borderRadius: "18px",
                  borderTopRightRadius: msg.isUser ? "4px" : "18px",
                  borderTopLeftRadius: msg.isUser ? "18px" : "4px",
                  maxWidth: "85%",
                  padding: "12px 16px",
                  wordBreak: "break-word",
                }}
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
              <motion.div 
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#f1f1f1",
                  padding: "12px 16px",
                  borderRadius: "18px",
                  borderTopLeftRadius: "4px",
                  maxWidth: "85%"
                }}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
              >
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
          </div>

          {/* Input Area */}
          <div style={{
            padding: "10px 0",
            // backgroundColor: "#fff",
            position: "sticky",
            bottom: 0
          }}>
            <div className="d-flex">
              <textarea
                className="form-control me-2"
                placeholder="Tanya apapun!"
                value={inputText}
                rows={1}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{
                  borderRadius: "20px",
                  padding: "10px 15px",
                  resize: "none",
                  border: "1px solid #ddd"
                }}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleSend} 
                disabled={isLoading}
                style={{
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <i className={isLoading ? "bi bi-arrow-clockwise" : "bi bi-arrow-up"}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-light py-3 small">
        © 2025 by ElChatbot
      </footer>
    </div>
  );
}