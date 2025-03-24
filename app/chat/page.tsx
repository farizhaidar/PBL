"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../component/navbar";

export default function ChatPage() {
  const [inputText, setInputText] = useState(""); // State untuk input

  const handleSubmit = () => {
    if (inputText.trim() !== "") {
      console.log("User Input:", inputText); // Bisa diganti dengan logika lain
      setInputText(""); // Hapus input setelah dikirim
    }
  };

  return (
    <div className="vh-100 bg-dark text-light">
      <Navbar /> {/* Navbar tetap di atas */}

      <motion.div
        className="container d-flex align-items-center justify-content-center h-75"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="text-center">
          <h3>Apa yang bisa saya bantu?</h3>
          <motion.div
            className="input-group mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Tanya apapun!"
              value={inputText} // Menggunakan state
              onChange={(e) => setInputText(e.target.value)} // Menyimpan input
            />
            <button className="btn btn-primary" onClick={handleSubmit}>
              ➤
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
