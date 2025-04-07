  "use client";
  import { useState } from "react";
  import { motion } from "framer-motion";
  import "bootstrap/dist/css/bootstrap.min.css";
  import Navbar from "../component/navbar";
  import "bootstrap-icons/font/bootstrap-icons.min.css"; // Import Bootstrap Icons

  export default function ChatPage() {
    const [inputText, setInputText] = useState(""); 
    const [messages, setMessages] = useState([]);

    return (
      <div className="vh-100 bg-black text-light d-flex flex-column">
        <Navbar />
        
        <div className="chat-container flex-grow-1 d-flex flex-column p-3">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className="chat-bubble"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg}
            </motion.div>
          ))}
        </div>

        {/* Chat Input Container */}
        <div className="chat-input-container p-3">
          <textarea
            className="chat-input"
            placeholder="Tanya apapun!"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button className="btn send-button">
            <i className="bi bi-arrow-up text-white"></i> {/* Ikon tetap putih agar kontras */}
          </button>
        </div>

        <style jsx>{`
          .chat-container {
            overflow-y: auto;
            max-height: 75vh;
          }

          .chat-bubble {
            padding: 12px 16px;
            border-radius: 16px;
            max-width: 75%;
            word-wrap: break-word;
            margin-bottom: 10px;
            background-color: #0d6efd;
            color: white;
            align-self: flex-end;
          }

          .chat-input-container {
            margin-left: 12rem; 
            margin-right: 12rem; 
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            border: none;
            border-radius: 20px;
            background: rgb(20, 20, 20);
          }

          .chat-input {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: white;
            font-size: 16px;
            resize: none;
            min-height: 50px;
            max-height: 150px;
          }

          .chat-input:focus {
            outline: none;
            border-color: #0d6efd;
          }

          /* Perubahan warna tombol kirim */
          .send-button {
            margin-left: 10px;
            width: 45px;
            height: 45px;
            font-size: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5px;
            background-color: #6366F1; /* Warna indigo-500 */
            border: none;
            transition: background 0.3s ease;
          }

          /* Efek hover untuk tombol kirim */
          .send-button:hover {
            background-color: #4F46E5; /* Warna lebih gelap saat hover */
          }
        `}</style>
      </div>
    );
  }
