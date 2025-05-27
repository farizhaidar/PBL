'use client';

export default function Footer() {
  return (
    <footer
      className="py-4"
      style={{
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px', // bisa kamu sesuaikan
      }}
    >
      <p className="m-0">© 2025 by ElChatbot</p>
    </footer>
  );
}
