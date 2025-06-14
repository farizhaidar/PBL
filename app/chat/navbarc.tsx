import Link from "next/link";

export default function Navbarc() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4 shadow">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="#">ElChatbot</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" href="/chat">Chat</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/recommendation">Recommendation</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/booking">Booking</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
