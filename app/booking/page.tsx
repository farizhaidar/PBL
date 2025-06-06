"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([
    { text: `
      <p>Halo! Saya adalah asisten virtual. Silakan tanyakan apa saja tentang layanan booking konsultasi kami :blush:. Berikut adalah pertanyaan yang dapat membantu Anda:</p>
      <ul>
        <li>Bagaimana cara melakukan booking konsultasi?</li>
        <li>Apa saja syarat yang diperlukan untuk konsultasi?</li>
        <li>Jam berapa saja layanan konsultasi tersedia?</li>
      </ul>
    `, isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

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
    } else if (isNaN(Number(form.age)) || Number(form.age) <= 0 || Number(form.age) > 120) {
      newErrors.age = "Umur harus berupa angka positif dan realistis";
    }
    if (!form.date) {
      newErrors.date = "Tanggal harus diisi";
    } else if (form.date < minDate) {
      newErrors.date = "Tidak bisa memilih tanggal yang sudah lewat";
    } else if (isWeekend(form.date)) {
      newErrors.date = "Hanya bisa memilih hari kerja (Senin-Jumat)";
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
      const availabilityRes = await fetch("/api/booking/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          location: form.location,
        }),
      });

      if (!availabilityRes.ok) {
        const errorData = await availabilityRes.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal memeriksa ketersediaan slot.");
      }

      const { available } = await availabilityRes.json();
      if (!available) {
        setErrors((prev) => ({ ...prev, time: "Slot waktu pada tanggal dan jam tersebut sudah dipesan. Silakan pilih waktu lain." }));
        setIsSubmitting(false);
        return;
      }

      const bookingRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await bookingRes.json();
      if (!bookingRes.ok) {
        throw new Error(result.error || "Gagal melakukan booking. Coba lagi nanti.");
      }

      setBookingSuccess({ ...form, queueNumber: result.queueNumber });
      setForm({
        name: "",
        phone: "",
        age: "",
        date: "",
        time: "",
        location: "Cabang Depok",
      });
      setErrors({});
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Terjadi kesalahan: ${error.message || "Tidak dapat terhubung ke server."}`);
      } else {
        alert("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadConfirmation = async () => {
    if (!popupRef.current || !bookingSuccess) return;

    const okButton = popupRef.current.querySelector('.btn-primary') as HTMLElement | null;
    const downloadButton = popupRef.current.querySelector('.btn-success') as HTMLElement | null;

    if (okButton) okButton.style.display = 'none';
    if (downloadButton) downloadButton.style.display = 'none';

    try {
      const canvas = await html2canvas(popupRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: popupRef.current.scrollWidth,
        windowHeight: popupRef.current.scrollHeight
      });

      if (okButton) okButton.style.display = '';
      if (downloadButton) downloadButton.style.display = '';

      const link = document.createElement('a');
      link.download = `Booking-Confirmation-${bookingSuccess.name}-${bookingSuccess.queueNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      if (okButton) okButton.style.display = '';
      if (downloadButton) downloadButton.style.display = '';
      console.error('Error generating image:', error);
      alert('Gagal mengunduh konfirmasi. Silakan coba screenshot manual.');
    }
  };

  const handleChatSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { text: trimmed, isUser: true }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("https://n8n.akmalnurwahid.my.id/webhook/bank-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: data.output || "Maaf, saya tidak mengerti pertanyaan Anda.", isUser: false }
      ]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prev) => [...prev, { text: "Maaf, terjadi kesalahan saat memproses permintaan Anda.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <div className="navbar-always-scrolled">
        <Navbar />
      </div>

      <div
        className="mt-5 position-relative min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)",
          padding: "40px 20px",
        }}
      >
        <div
          className="container p-4 p-md-5 rounded shadow-lg"
          style={{
            maxWidth: "700px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(5px)",
            borderRadius: "12px",
          }}
        >
          <h2 className="mb-4 text-center" style={{ color: "#243b55", fontWeight: "700" }}>
            Booking Konsultasi
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
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
                type="tel"
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
              <label htmlFor="age" className="form-label fw-semibold" style={{ color: "#000" }}>
                Umur
              </label>
              <input
                id="age"
                type="number"
                className={`form-control ${errors.age ? "is-invalid" : ""}`}
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                style={{ boxShadow: errors.age ? "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" : "none" }}
              />
              {errors.age && <div className="invalid-feedback">{errors.age}</div>}
            </div>

            <div className="row g-3 mb-3">
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
                {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>}
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
                {errors.time && <div className="invalid-feedback d-block">{errors.time}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="location" className="form-label fw-semibold" style={{ color: "#000" }}>
                Tempat
              </label>
              <select
                id="location"
                className="form-select"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                style={{ color: "#243b55", fontWeight: "600" }}
              >
                <option value="Cabang Depok">Cabang Depok</option>
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
                padding: "10px 15px",
                fontSize: "1.1rem"
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

      {/* Chatbot Button and Interface */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1000 }}>
        {isChatOpen ? (
          <motion.div 
            className="card shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{ 
              width: "320px", 
              height: "450px", 
              display: "flex", 
              flexDirection: "column",
              backgroundColor: "#f8f9fa",
              borderRadius: '15px',
            }}
          >
            <div 
              className="card-header d-flex justify-content-between align-items-center" 
              style={{ backgroundColor: "#4a6fa5", color: "white" }}
            >
              <h5 className="mb-0">Virtual Assistant</h5>
              <button 
                className="btn btn-sm btn-light"
                onClick={() => setIsChatOpen(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div 
              className="flex-grow-1 p-3 overflow-auto" 
              style={{ backgroundColor: "#fff" }}
            >
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`mb-3 p-2 rounded ${msg.isUser ? "text-white ms-auto" : "bg-light"}`}
                  style={{ 
                    
                    maxWidth: "max-content",
                    wordWrap: "break-word",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                    backgroundColor: msg.isUser ? "#4a6fa5" : "#f8f9fa"
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.isUser ? (
                    msg.text
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  className="mb-3 p-3 rounded bg-light" 
                  style={{ maxWidth: "70%", display: "flex" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                    <motion.span
                      style={{ display: 'inline-block', fontSize: '20px' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      •
                    </motion.span>
                    <motion.span
                      style={{ display: 'inline-block', fontSize: '20px', marginLeft: '6px' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4
                      }}
                    >
                      •
                    </motion.span>
                    <motion.span
                      style={{ display: 'inline-block', fontSize: '14px', marginLeft: '6px' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8
                      }}
                    >
                      •
                    </motion.span>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatBottomRef} />
            </div>
            
            <div className="p-3 border-top">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tulis pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                />
                <button 
                  className="btn"
                  onClick={handleChatSend}
                  disabled={isLoading}
                  style={{ backgroundColor: "#4a6fa5", color: "white" }}
                >
                  {isLoading ? (
                    <i className="bi bi-arrow-clockwise"></i>
                  ) : (
                    <i className="bi bi-send"></i>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            className="btn btn-primary rounded-circle p-3"
            onClick={() => setIsChatOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              backgroundColor: "#4a6fa5"
            }}
          >
            <i className="bi bi-chat-dots-fill fs-4"></i>
          </motion.button>
        )}
      </div>

      {/* Modal Pop-up Konfirmasi Booking */}
      {bookingSuccess && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 }}
            onClick={() => setBookingSuccess(null)}
          />

          <div
            ref={popupRef}
            className="position-fixed top-50 start-50 bg-white text-dark p-4 rounded shadow-lg"
            style={{
              zIndex: 1050,
              width: "90%",
              maxWidth: "450px",
              transform: "translate(-50%, -50%)",
              borderTop: "5px solid #4a6fa5"
            }}
          >
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 p-3"
              aria-label="Close"
              onClick={() => setBookingSuccess(null)}
            ></button>
            <h4 className="mb-3 text-center" style={{ color: "#243b55" }}>
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
                className="btn btn-secondary flex-grow-1"
                onClick={() => setBookingSuccess(null)}
              >
                OK
              </button>
              <button
                className="btn btn-success flex-grow-1"
                onClick={downloadConfirmation}
                style={{ borderColor: "#198754" }}
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