"use client";

import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import Navbar from "../component/navbar";
import "../globals.css"; // pastikan night-sky dan star ada di sini

export default function BookingPage() {
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minDate, setMinDate] = useState("");
  const [minTime, setMinTime] = useState("");

  useEffect(() => {
    const now = new Date();
    setMinDate(now.toISOString().split("T")[0]);

    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    setMinTime(nextHour.toTimeString().substring(0, 5));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name) newErrors.name = "Nama harus diisi";
    if (!form.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!form.date) {
      newErrors.date = "Tanggal harus diisi";
    } else if (form.date < minDate) {
      newErrors.date = "Tidak bisa memilih tanggal yang sudah lewat";
    }
    if (!form.time) {
      newErrors.time = "Waktu harus diisi";
    } else if (form.date === minDate && form.time < minTime) {
      newErrors.time = `Waktu harus minimal ${minTime} untuk hari ini`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const availabilityRes = await fetch("/api/booking/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: form.date, time: form.time }),
      });

      if (!availabilityRes.ok) throw new Error("Gagal memeriksa ketersediaan");

      const { available } = await availabilityRes.json();
      if (!available) {
        setErrors((prev) => ({ ...prev, time: "Slot waktu sudah dipesan" }));
        return;
      }

      const bookingRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(result.error || "Gagal melakukan booking");

      alert("Booking berhasil!");
      setForm({ name: "", email: "", date: "", time: "" });
    } catch (error) {
      alert("Terjadi kesalahan saat booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="position-relative night-sky min-vh-100 d-flex align-items-center justify-content-center">
        {[...Array(50)].map((_, i) => (
          <span key={i} className="star"></span>
        ))}

        <div className="container p-4" style={{ maxWidth: "700px", zIndex: 1 }}>
          <div className="text-light bg-dark rounded p-4 shadow-lg">
            <h2 className="mb-4 text-center">Booking Konsultasi</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nama Lengkap</label>
                <input
                  className={`form-control ${errors.name && "is-invalid"}`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ color: "white" }}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className={`form-control ${errors.email && "is-invalid"}`}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ color: "white" }}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Tanggal</label>
                <input
                  className={`form-control ${errors.date && "is-invalid"}`}
                  name="date"
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={handleChange}
                  required
                  style={{ color: "white" }}
                />
                {errors.date && <div className="invalid-feedback">{errors.date}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Waktu</label>
                <input
                  className={`form-control ${errors.time && "is-invalid"}`}
                  name="time"
                  type="time"
                  min={form.date === minDate ? minTime : undefined}
                  value={form.time}
                  onChange={handleChange}
                  required
                  style={{ color: "white" }}
                />
                {errors.time && <div className="invalid-feedback">{errors.time}</div>}
              </div>

              <button
                className="btn btn-primary mt-3 w-100"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Buat Booking"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
