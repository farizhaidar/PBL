"use client";
import { useState } from "react";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${darkMode ? "night-sky" : "bg-light"} text-${darkMode ? "light" : "dark"} p-3`}>
      <div className="container-fluid">
        <a className={`navbar-brand text-${darkMode ? "light" : "dark"}`} href="/">
          Chatbot
        </a>

        {/* Tombol toggle untuk menu di mode mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className={`nav-link text-${darkMode ? "light" : "dark"}`} href="/chat">
                Chat
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link text-${darkMode ? "light" : "dark"}`} href="/recommendation">Rekomendasi</a>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-3">
            {/* Toggle Mode */}
            <button
              className={`btn btn-outline-${darkMode ? "light" : "dark"} me-3`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "🌙" : "☀️"}
            </button>

            <Image
              src="/pajar.jpg"
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-circle object-fit-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
