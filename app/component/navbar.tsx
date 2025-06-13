'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScroll } from './navbarScroll';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const scrolled = useScroll();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Chat', path: '/chat' },
    { label: 'Recommendation', path: '/recommendation' },
    { label: 'Booking', path: '/booking' },
  ];

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        scrolled ? 'bg-white text-blue shadow-sm' : 'bg-transparent biru-bca'
      }`}
    >
      <div className="container py-2">
        <Link
          href="/"
          className={`navbar-brand ${scrolled ? 'text-dark' : 'biru-bca'}`}
        >
          <b>
            <i>ElChatbot</i>
          </b>
        </Link>

        <button
          className={`navbar-toggler ${scrolled ? '' : 'custom-toggler'}`}
          type="button"
          onClick={() => setIsOpen(!isOpen)} // Ganti dengan handler manual
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  href={item.path}
                  className={`nav-link ${
                    pathname === item.path ? 'active' : ''
                  } ${scrolled ? 'text-dark' : 'text-white'}`}
                  onClick={() => setIsOpen(false)} // Tutup menu setelah klik
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
