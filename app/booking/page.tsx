"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import Navbar from "../component/navbar";
import "../globals.css";
import "../chat/chat.css";
import html2canvas from "html2canvas";

type BookingSuccessData = {
  name: string;
  phone: string;
  age: string;
  date: string;
  time: string;
  location: string;
  queueNumber: number;
};

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
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccessData | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([
    { 
      text: `
        <p>Halo! Saya adalah asisten virtual. Ada yang bisa dibantu terkait layanan booking konsultasi kami? 😊</p>
        <p>Anda bisa bertanya seperti:</p>
        <ul>
          <li>Bagaimana cara booking?</li>
          <li>Syaratnya apa saja?</li>
          <li>Tanggal 28 Juni 2025 jam berapa saja yang kosong?</li>
        </ul>
      `, 
      isUser: false 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);

  const isWeekend = (dateStr: string): boolean => {
    if (!dateStr) return false;
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^[0-9]{10,15}$/;

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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const availabilityRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time,
          location: form.location,
        }),
      });

      const availabilityData = await availabilityRes.json();
      if (!availabilityRes.ok || !availabilityData.available) {
        throw new Error(availabilityData.error || "Slot waktu tidak tersedia. Silakan pilih waktu lain.");
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

      setBookingSuccess({ 
        ...form, 
        queueNumber: result.queueNumber || result.booking.id 
      });
      setForm({ name: "", phone: "", age: "", date: "", time: "", location: "Cabang Depok" });
      setErrors({});

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga.";
      if (errorMessage.includes("Slot waktu")) {
        setErrors((prev) => ({ ...prev, time: errorMessage }));
      } else {
        alert(`Terjadi kesalahan: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadConfirmation = async () => {
    if (!popupRef.current || !bookingSuccess) return;
    
    const okButton = popupRef.current.querySelector('.btn-secondary') as HTMLElement | null;
    const downloadButton = popupRef.current.querySelector('.btn-success') as HTMLElement | null;
    if (okButton) okButton.style.display = 'none';
    if (downloadButton) downloadButton.style.display = 'none';

    try {
      const canvas = await html2canvas(popupRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `Bukti-Booking-${bookingSuccess.name}-${bookingSuccess.queueNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Gagal membuat gambar:', error);
      alert('Gagal mengunduh konfirmasi. Silakan coba screenshot manual.');
    } finally {
      if (okButton) okButton.style.display = '';
      if (downloadButton) downloadButton.style.display = '';
    }
  };

  const handleChatSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { text: trimmed, isUser: true }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Gagal menghubungi server: ${response.status} ${response.statusText}`);
      }
      
      if (response.status === 204) {
        setMessages((prev) => [...prev, { text: "Maaf, asisten virtual tidak memberikan jawaban. Coba tanyakan dengan kalimat lain.", isUser: false }]);
      } else {
        const data = await response.json();
        setMessages((prev) => [...prev, { text: data.message || "Maaf, saya tidak mengerti. Coba tanyakan hal lain.", isUser: false }]);
      }

    } catch (error) {
      console.error("Error memanggil API chatbot:", error);
      let errorMessage = "Maaf, terjadi kesalahan saat menyambung ke asisten virtual.";
      if (error instanceof SyntaxError) {
        errorMessage = "Maaf, ada masalah saat memproses jawaban dari asisten.";
      }
      setMessages((prev) => [...prev, { text: errorMessage, isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-page" style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      position: "relative",
      // backgroundColor: "#f8f9fa"
    }}>
      {/* Navbar Transparan di Atas Konten */}
      <nav style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        // backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <Navbar />
      </nav>

      {/* Konten Utama */}
      <div style={{
        flex: 1,
        paddingTop: "70px", // Sesuaikan dengan tinggi navbar
        display: "flex",
        flexDirection: "column",
        // backgroundColor: "#f8f9fa"
      }}>
        <div className="container" style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
          padding: "20px"
        }}>
          {/* Form Card */}
          <motion.div 
            className="card shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              borderRadius: "12px",
              border: "none",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4" style={{ color: "#333" }}>Booking Konsultasi</h2>
              
              <div className="alert alert-info mb-4" style={{
                backgroundColor: "#e7f5ff",
                borderColor: "#d0ebff",
                color: "#1864ab"
              }}>
                <p className="mb-0 text-center">
                  Konsultasikan dirimu terkait persetujuan pinjaman dan rekomendasi produk bank secara offline.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nama Lengkap</label>
                  <input 
                    id="name" 
                    className={`form-control ${errors.name ? "is-invalid" : ""}`} 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    style={{
                      borderRadius: "8px",
                      padding: "10px 15px",
                      border: "1px solid #ddd"
                    }}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Nomor HP</label>
                  <input 
                    id="phone" 
                    type="tel" 
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`} 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    style={{
                      borderRadius: "8px",
                      padding: "10px 15px",
                      border: "1px solid #ddd"
                    }}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="age" className="form-label">Umur</label>
                  <input 
                    id="age" 
                    type="number" 
                    className={`form-control ${errors.age ? "is-invalid" : ""}`} 
                    name="age" 
                    value={form.age} 
                    onChange={handleChange} 
                    required 
                    style={{
                      borderRadius: "8px",
                      padding: "10px 15px",
                      border: "1px solid #ddd"
                    }}
                  />
                  {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label">Tanggal</label>
                    <input 
                      id="date" 
                      className={`form-control ${errors.date ? "is-invalid" : ""}`} 
                      name="date" 
                      type="date" 
                      min={minDate} 
                      value={form.date} 
                      onChange={handleChange} 
                      required 
                      style={{
                        borderRadius: "8px",
                        padding: "10px 15px",
                        border: "1px solid #ddd"
                      }}
                    />
                    {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label">Waktu</label>
                    <input 
                      id="time" 
                      className={`form-control ${errors.time ? "is-invalid" : ""}`} 
                      name="time" 
                      type="time" 
                      min="08:00" 
                      max="15:00" 
                      step="3600" 
                      value={form.time} 
                      onChange={handleChange} 
                      required 
                      style={{
                        borderRadius: "8px",
                        padding: "10px 15px",
                        border: "1px solid #ddd"
                      }}
                    />
                    {errors.time && <div className="invalid-feedback d-block">{errors.time}</div>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="location" className="form-label">Tempat</label>
                  <select 
                    id="location" 
                    className="form-select" 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange} 
                    required
                    style={{
                      borderRadius: "8px",
                      padding: "10px 15px",
                      border: "1px solid #ddd"
                    }}
                  >
                    <option value="Cabang Depok">Cabang Depok</option>
                  </select>
                </div>
                
                <motion.button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "#007bff",
                    border: "none",
                    fontWeight: "500"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Memproses...
                    </>
                  ) : (
                    "Buat Booking"
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chat Button */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1000 }}>
        {isChatOpen ? (
          <motion.div 
            className="card shadow-lg" 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              width: "320px", 
              height: "450px", 
              display: "flex", 
              flexDirection: "column",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          >
            <div className="card-header d-flex justify-content-between align-items-center" style={{ 
              backgroundColor: "#007bff", 
              color: "white",
              padding: "12px 15px"
            }}>
              <h5 className="mb-0">Virtual Assistant</h5>
              <button 
                className="btn btn-sm btn-light" 
                onClick={() => setIsChatOpen(false)}
                style={{
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: "#fff" }}>
              {messages.map((msg, index) => (
                <motion.div 
                  key={index} 
                  className={`mb-3 ${msg.isUser ? "ms-auto" : ""}`}
                  style={{ 
                    maxWidth: "85%",
                    wordBreak: "break-word",
                    padding: "10px 15px",
                    borderRadius: "18px",
                    backgroundColor: msg.isUser ? "#007bff" : "#f1f1f1",
                    color: msg.isUser ? "#fff" : "#000",
                    borderTopRightRadius: msg.isUser ? "4px" : "18px",
                    borderTopLeftRadius: msg.isUser ? "18px" : "4px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.isUser ? msg.text : <div dangerouslySetInnerHTML={{ __html: msg.text }} />}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  className="mb-3" 
                  style={{ 
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    borderTopLeftRadius: "4px",
                    backgroundColor: "#f1f1f1",
                    display: "flex",
                    alignItems: "center"
                  }}
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
                      style={{ display: 'inline-block', fontSize: '20px', marginLeft: '6px' }}
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
                  style={{
                    borderRadius: "20px",
                    padding: "10px 15px",
                    border: "1px solid #ddd"
                  }}
                />
                <button 
                  className="btn" 
                  onClick={handleChatSend} 
                  disabled={isLoading}
                  style={{
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#007bff",
                    color: "white",
                    marginLeft: "8px"
                  }}
                >
                  <i className={isLoading ? "bi bi-arrow-clockwise" : "bi bi-arrow-up"}></i>
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
              backgroundColor: "#007bff",
              width: "60px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <i className="bi bi-chat-dots-fill fs-4"></i>
          </motion.button>
        )}
      </div>

      {/* Success Modal */}
      {bookingSuccess && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100" 
            style={{ 
              backgroundColor: "rgba(0,0,0,0.6)", 
              zIndex: 1040 
            }} 
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
              borderTop: "5px solid #007bff",
              borderRadius: "12px"
            }}
          >
            <button 
              type="button" 
              className="btn-close position-absolute top-0 end-0 p-3" 
              aria-label="Close" 
              onClick={() => setBookingSuccess(null)}
            />
            
            <h4 className="mb-3 text-center" style={{ color: "#007bff" }}>
              <i className="bi bi-check-circle-fill me-2 text-success"></i>
              Booking Berhasil!
            </h4>
            
            <div className="text-center mb-3">
              <strong style={{fontSize: "1.2rem", color: "#007bff"}}>
                Nomor Antrian Anda: #{bookingSuccess.queueNumber}
              </strong>
            </div>
            
            <hr/>
            
            <div className="mb-3">
              <p className="mb-1">Terima kasih, <strong>{bookingSuccess.name}</strong>.</p>
              <p className="mb-1">Booking Anda pada tanggal <strong>
                {new Date(bookingSuccess.date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </strong></p>
              <p className="mb-1">Pukul <strong>{bookingSuccess.time}</strong></p>
              <p>Lokasi: <strong>{bookingSuccess.location}</strong></p>
            </div>
            
            <div className="text-center p-2 rounded" style={{backgroundColor: "#f1f1f1"}}>
              <p className="mb-0"><strong>Konsultan: Akmal Nur Wahid</strong></p>
            </div>
            
            <div className="d-flex gap-2 mt-4">
              <button 
                className="btn btn-secondary flex-grow-1" 
                onClick={() => setBookingSuccess(null)}
                style={{
                  borderRadius: "20px",
                  padding: "8px",
                  backgroundColor: "#6c757d",
                  border: "none"
                }}
              >
                OK
              </button>
              
              <button 
                className="btn btn-success flex-grow-1" 
                onClick={downloadConfirmation}
                style={{ 
                  borderRadius: "20px",
                  padding: "8px",
                  backgroundColor: "#28a745",
                  border: "none"
                }}
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

      <footer className="text-center text-light py-3 small">
        © 2025 by ElChatbot
      </footer>
    </div>
  );
}