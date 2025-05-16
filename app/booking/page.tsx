"use client";

import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import Navbar from "../component/navbar"; // Pastikan path ini benar
import "../globals.css"; // Pastikan path ini benar
import html2canvas from "html2canvas";

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
  const [bookingSuccess, setBookingSuccess] = useState<null | (typeof form & { queueNumber: number })>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const isWeekend = (dateStr: string) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6; // 0 adalah Minggu, 6 adalah Sabtu
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Hapus error ketika user mulai mengetik lagi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^[0-9]{10,15}$/; // Nomor HP antara 10 hingga 15 digit

    if (!form.name.trim()) newErrors.name = "Nama harus diisi";
    if (!form.phone.trim()) {
      newErrors.phone = "Nomor HP harus diisi";
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Format nomor HP tidak valid (10-15 digit angka)";
    }
    if (!form.age.trim()) {
      newErrors.age = "Umur harus diisi";
    } else if (isNaN(Number(form.age)) || Number(form.age) <= 0 || Number(form.age) > 120) { // Batas umur yang masuk akal
      newErrors.age = "Umur harus berupa angka positif dan realistis";
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
      newErrors.time = "Waktu harus antara pukul 08:00 hingga 15:00";
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
      // Simulasi pengecekan ketersediaan
      const availabilityRes = await fetch("/api/booking/check-availability", { // Pastikan endpoint API ini ada
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          location: form.location,
        }),
      });

      if (!availabilityRes.ok) {
        // Jika API mengembalikan error spesifik, tampilkan itu
        const errorData = await availabilityRes.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal memeriksa ketersediaan slot.");
      }

      const { available } = await availabilityRes.json();
      if (!available) {
        setErrors((prev) => ({ ...prev, time: "Slot waktu pada tanggal dan jam tersebut sudah dipesan. Silakan pilih waktu lain." }));
        setIsSubmitting(false); // Penting untuk menghentikan submit jika tidak tersedia
        return;
      }

      // Simulasi proses booking
      const bookingRes = await fetch("/api/booking", { // Pastikan endpoint API ini ada
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await bookingRes.json();
      if (!bookingRes.ok) {
        throw new Error(result.error || "Gagal melakukan booking. Coba lagi nanti.");
      }

      setBookingSuccess({ ...form, queueNumber: result.queueNumber });
      // Reset form setelah berhasil
      setForm({
        name: "",
        phone: "",
        age: "",
        date: "",
        time: "",
        location: "Cabang Depok",
      });
      setErrors({}); // Bersihkan error juga
    } catch (error: unknown) {
    if (error instanceof Error) {
      alert(`Terjadi kesalahan: ${error.message || "Tidak dapat terhubung ke server."}`);
    } else {
      alert("Terjadi kesalahan tidak terduga.");
    }
  }
  };

  const downloadConfirmation = async () => {
    if (!popupRef.current || !bookingSuccess) return;

    // Untuk sementara sembunyikan tombol OK dan Download pada clone agar tidak ikut tercetak
    const okButton = popupRef.current.querySelector('.btn-primary') as HTMLElement | null;
    const downloadButton = popupRef.current.querySelector('.btn-success') as HTMLElement | null;

    if (okButton) okButton.style.display = 'none';
    if (downloadButton) downloadButton.style.display = 'none';


    try {
      const canvas = await html2canvas(popupRef.current, {
        backgroundColor: '#ffffff', // Latar belakang putih untuk gambar
        scale: 2, // Meningkatkan resolusi gambar
        logging: false, // Nonaktifkan logging html2canvas di konsol
        useCORS: true, // Jika ada gambar dari domain lain (tidak relevan di sini tapi best practice)
        scrollX: 0, // Pastikan tidak ada scroll horizontal
        scrollY: -window.scrollY, // Atasi masalah scroll jika popup lebih panjang dari viewport
        windowWidth: popupRef.current.scrollWidth,
        windowHeight: popupRef.current.scrollHeight
      });

      // Kembalikan tampilan tombol setelah canvas dibuat
      if (okButton) okButton.style.display = '';
      if (downloadButton) downloadButton.style.display = '';

      const link = document.createElement('a');
      link.download = `Booking-Confirmation-${bookingSuccess.name}-${bookingSuccess.queueNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      // Kembalikan tampilan tombol jika terjadi error
      if (okButton) okButton.style.display = '';
      if (downloadButton) downloadButton.style.display = '';
      console.error('Error generating image:', error);
      alert('Gagal mengunduh konfirmasi. Silakan coba screenshot manual.');
    }
  };

  return (
    <>
      <div className="navbar-always-scrolled">
        <Navbar />
      </div>

      <div
        className="mt-5 position-relative min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)",
          padding: "40px 20px", // Padding untuk viewport kecil
        }}
      >
        <div
          className="container p-4 p-md-5 rounded shadow-lg" // p-md-5 untuk padding lebih besar di medium device
          style={{
            maxWidth: "700px",
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Sedikit transparan
            backdropFilter: "blur(5px)", // Efek blur untuk background
            borderRadius: "12px",
          }}
        >
          <h2 className="mb-4 text-center" style={{ color: "#243b55", fontWeight: "700" }}>
            Booking Konsultasi
          </h2>

          <form onSubmit={handleSubmit} noValidate> {/* noValidate untuk custom validation */}
            <div className="mb-3"> {/* mb-3 untuk spacing yang lebih konsisten */}
              <label htmlFor="name" className="form-label fw-semibold" style={{ color: "#000" }}>
                Nama Lengkap
              </label>
              <input
                id="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ boxShadow: errors.name ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" : "none" }}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-semibold" style={{ color: "#000" }}>
                Nomor HP
              </label>
              <input
                id="phone"
                type="tel" // type="tel" untuk input nomor telepon
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                style={{ boxShadow: errors.phone ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" : "none" }}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="age" className="form-label fw-semibold" style={{ color: "#000" }}> {/* Ubah warna label */}
                Umur
              </label>
              <input
                id="age"
                type="number" // type="number" untuk input umur
                className={`form-control ${errors.age ? "is-invalid" : ""}`}
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                style={{ boxShadow: errors.age ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" : "none" }}
              />
              {errors.age && <div className="invalid-feedback">{errors.age}</div>}
            </div>

            <div className="row g-3 mb-3"> {/* Menggunakan row dan col untuk tanggal dan waktu */}
              <div className="col-md-6">
                <label htmlFor="date" className="form-label fw-semibold" style={{ color: "#000" }}>
                  Tanggal
                </label>
                <input
                  id="date"
                  className={`form-control ${errors.date ? "is-invalid" : ""}`}
                  name="date"
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={handleChange}
                  required
                  style={{ boxShadow: errors.date ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" : "none" }}
                />
                {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>} {/* d-block agar tampil */}
              </div>

              <div className="col-md-6">
                <label htmlFor="time" className="form-label fw-semibold" style={{ color: "#000" }}>
                  Waktu
                </label>
                <input
                  id="time"
                  className={`form-control ${errors.time ? "is-invalid" : ""}`}
                  name="time"
                  type="time"
                  min="08:00"
                  max="15:00"
                  value={form.time}
                  onChange={handleChange}
                  required
                  style={{ boxShadow: errors.time ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" : "none" }}
                />
                {errors.time && <div className="invalid-feedback d-block">{errors.time}</div>} {/* d-block agar tampil */}
              </div>
            </div>


            <div className="mb-4"> {/* mb-4 untuk spacing sebelum tombol */}
              <label htmlFor="location" className="form-label fw-semibold" style={{ color: "#000" }}>
                Tempat
              </label>
              <select
                id="location"
                className="form-select" // Gunakan form-select untuk tampilan select Bootstrap
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                style={{ color: "#243b55", fontWeight: "600" }}
              >
                <option value="Cabang Depok">Cabang Depok</option>
                {/* Tambahkan cabang lain jika ada */}
                {/* <option value="Cabang Jakarta">Cabang Jakarta</option> */}
              </select>
            </div>

            <button
              className="btn btn-primary mt-3 w-100"
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#4a6fa5",
                borderColor: "#3a5f8a",
                fontWeight: "600",
                padding: "10px 15px", // Sedikit padding vertikal dan horizontal
                fontSize: "1.1rem" // Ukuran font sedikit lebih besar
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Memproses...
                </>
              ) : (
                "Buat Booking"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal Pop-up Konfirmasi Booking */}
      {bookingSuccess && (
        <>
          {/* Overlay */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 }}
            onClick={() => setBookingSuccess(null)} // Tutup modal jika klik di luar
          />

          {/* Custom Card Pop-up */}
          <div
            ref={popupRef}
            className="position-fixed top-50 start-50 bg-white text-dark p-4 rounded shadow-lg"
            style={{
              zIndex: 1050,
              width: "90%",
              maxWidth: "450px", // Sedikit lebih lebar
              transform: "translate(-50%, -50%)",
              borderTop: "5px solid #4a6fa5" // Aksen warna
            }}
          >
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 p-3"
              aria-label="Close"
              onClick={() => setBookingSuccess(null)}
            ></button>
            <h4 className="mb-3 text-center" style={{ color: "#243b55" }}> {/* h4 untuk judul modal */}
              <i className="bi bi-check-circle-fill me-2 text-success"></i>
              Booking Berhasil!
            </h4>
            <div className="text-center mb-3">
              <strong style={{fontSize: "1.2rem", color: "#243b55"}}>Nomor Antrian Anda: #{bookingSuccess.queueNumber}</strong>
            </div>
            <hr/>
            <div className="mb-3">
              <p className="mb-1">Terima kasih, <strong>{bookingSuccess.name}</strong>.</p>
              <p className="mb-1">
                Booking Anda pada tanggal <strong>{new Date(bookingSuccess.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
              <p className="mb-1">
                Pukul <strong>{bookingSuccess.time}</strong>
              </p>
              <p>Lokasi: <strong>{bookingSuccess.location}</strong></p>
            </div>
            <div className="text-center p-2 rounded" style={{backgroundColor: "#e9ecef"}}>
              <p className="mb-0"><strong>Konsultan: Akmal Nur Wahid</strong></p>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-secondary flex-grow-1" // btn-secondary untuk OK
                onClick={() => setBookingSuccess(null)}
              >
                OK
              </button>
              <button
                className="btn btn-success flex-grow-1"
                onClick={downloadConfirmation}
                style={{ borderColor: "#198754" }} // Sesuaikan border color jika perlu
              >
                <i className="bi bi-download me-2"></i>Unduh Bukti
              </button>
            </div>
            <p className="mt-3 text-center small text-danger">
              <b>PENTING: Harap simpan bukti booking ini!</b>
            </p>
          </div>
        </>
      )}
    </>
  );
}