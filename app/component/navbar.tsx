"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setDarkMode(savedMode === "true");
    } else if (window.matchMedia) {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  return (
    <nav className={`navbar navbar-expand-lg fixed-top bg-transparent p-3`}>
      <div className="container-fluid">
        <a className="navbar-brand text-indigo-500" href="/">
          Chatbot
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {["Home", "Chat", "Recommendation"].map((item, index) => {
              const link = item.toLowerCase() === "home" ? "/" : `/${item.toLowerCase()}`;
              const isActive = pathname === link;

              return (
                <li className="nav-item me-2" key={index}>
                  <a
                    className={`nav-link nav-button ${isActive ? "active-nav" : "text-indigo-500"}`}
                    href={link}
                  >
                    {item}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="d-flex align-items-center ms-3">
            {/* Dark Mode Toggle */}
            <div className="dark-mode-toggle-wrapper">
              <input
                type="checkbox"
                id="darkModeToggle"
                className="dark-mode-toggle"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <label htmlFor="darkModeToggle" className="dark-mode-toggle-label">
                <span className="icon sun-icon">☀️</span>
                <span className="icon moon-icon">🌙</span>
                <span className="toggle-slider"></span>
              </label>
            </div>

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

      {/* Custom styles */}
      <style jsx>{`
        .text-indigo-500 {
          color: #6366F1 !important; /* Warna indigo-500 */
        }

        .nav-button {
          border-radius: 100px; /* Border radius untuk tombol */
          padding: 8px 16px;
          transition: background-color 0.3s, color 0.3s;
          font-size: 17px; /* Memperbesar ukuran teks */
          font-weight: 600
        }

        .nav-button:hover {
          color: white !important;        
          }

        .active-nav {
          // background-color: #6366F1;
          color: white !important;
          // border-radius: 100px;
          // padding: 8px 16px;
        }

        .dark-mode-toggle-wrapper {
          position: relative;
          margin-right: 1rem;
        }

        .dark-mode-toggle {
          opacity: 0;
          position: absolute;
        }

        .dark-mode-toggle-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          width: 45px;
          height: 22px;
          background: ${darkMode ? "#333" : "#f0f0f0"};
          border-radius: 50px;
          position: relative;
          transition: background-color 0.2s;
          padding: 0 5px;
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        }

        .icon {
          font-size: 12px;
          transition: all 0.3s ease;
          position: absolute;
          top: 47.4%;
          transform: translateY(-50%);
          z-index: 2;
        }

        .sun-icon {
          left: 3px;
        }

        .moon-icon {
          right: 3px;
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: ${darkMode ? "25px" : "2px"};
          width: 18px;
          height: 18px;
          background: ${darkMode ? "#fff" : "#333"};
          border-radius: 50%;
          transition: left 0.3s;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
          z-index: 1;
        }
      `}</style>
    </nav>
  );
}
