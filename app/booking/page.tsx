"use client";

import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import Navbar from "../component/navbar";
import "../globals.css";

export default function BookingPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    date: "",
    time: "",
    location: "Cabang Depok",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minDate, setMinDate] = useState("");
  // const [minTime, setMinTime] = useState("08:00");

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const isWeekend = (dateStr: string) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!form.name) newErrors.name = "Nama harus diisi";
    if (!form.phone) {
      newErrors.phone = "Nomor HP harus diisi";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Format nomor HP tidak valid";
    }
    if (!form.age) {
      newErrors.age = "U  r harus diisi";
    } else if (isNaN(Number(form.age)) || Number(form.age) <= 0) {
      newErrors.age = "Umur harus berupa angka positif";
    }
    if (!form.date) {
      newErrors.date = "Tanggal harus diisi";
    } else if (form.date < minDate) {
      newErrors.date = "Tidak bisa memilih tanggal yang sudah lewat";
    } else if (isWeekend(form.date)) {
      newErrors.date = "Hanya bisa memilih hari kerja (Senin–Jumat)";
    }
    if (!form.time) {
      newErrors.time = "Waktu harus diisi";
    } else if (form.time < "08:00" || form.time > "15:00") {
      newErrors.time = "Waktu harus antara 08:00 hingga 15:00";
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
        body: JSON.stringify({ date: form.date, time: form.time, location: form.location }),
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
      setForm({
        name: "",
        phone: "",
        age: "",
        date: "",
        time: "",
        location: "Cabang Depok",
      });
    } catch {
      alert("Terjadi kesalahan saat booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
       <div className="navbar-always-scrolled">
              <Navbar />
            </div>

      <div className="mt-5 position-relative min-vh-100 d-flex align-items-center justify-content-center">

        <div className="container p-4" style={{ maxWidth: "700px", zIndex: 1 }}>
          <div className="rounded p-4 shadow-lg">
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
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Nomor HP</label>
                <input
                  className={`form-control ${errors.phone && "is-invalid"}`}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Umur</label>
                <input
                  className={`form-control ${errors.age && "is-invalid"}`}
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  required
                />
                {errors.age && <div className="invalid-feedback">{errors.age}</div>}
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
                />
                {errors.date && <div className="invalid-feedback">{errors.date}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Waktu</label>
                <input
                  className={`form-control ${errors.time && "is-invalid"}`}
                  name="time"
                  type="time"
                  min="08:00"
                  max="15:00"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
                {errors.time && <div className="invalid-feedback">{errors.time}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Tempat</label>
                <select
                  className="form-control"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                >
                  <option value="Cabang Depok">Cabang Depok</option>
                </select>
              </div>

              <button
                className="btn-submit mt-3 w-100"
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
