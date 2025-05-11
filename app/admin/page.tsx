"use client";

import { useEffect, useState } from "react";

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking");
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Gagal memuat data");

      const bookingsData = json.bookings || json.data || json;
      if (!Array.isArray(bookingsData)) throw new Error("Format data tidak valid");

      setBookings(bookingsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        setError(err.message);
      } else {
        setError("Terjadi kesalahan tidak diketahui");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus booking ini?")) return;

    try {
      const res = await fetch("/api/booking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Gagal menghapus");

      setBookings((prev) => prev.filter((b) => b.id !== id));
      alert("Booking berhasil dihapus!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Terjadi kesalahan saat menghapus");
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📋 Daftar Booking</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && bookings.length === 0 && <p>Tidak ada booking</p>}

      {!loading && bookings.length > 0 && (
        <table
          border={1}
          cellPadding={10}
          cellSpacing={0}
          style={{
            width: "100%",
            marginTop: "1rem",
            borderCollapse: "collapse",
          }}
        >
          <thead style={{ backgroundColor: "#f4f4f4" }}>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Dibuat Pada</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>{b.time}</td>
                <td>{new Date(b.created_at).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleDelete(b.id)}
                    style={{
                      color: "white",
                      backgroundColor: "red",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
