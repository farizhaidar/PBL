"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../component/navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "../globals.css";
import "../chat/chat.css";

const pekerjaanOptions = [
  "Pelajar/Mahasiswa",
  "Pegawai Swasta",
  "PNS/TNI/POLRI",
  "Wiraswasta/Pengusaha",
  "Profesional",
  "Ibu Rumah Tangga",
  "Pensiunan",
  "Lainnya"
];

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState({
    usia: "",
    jenisKelamin: "",
    pekerjaan: "",
    saldo: "",
    pendapatan: ""
  });

  const [rekomendasi, setRekomendasi] = useState({
    product: "",
    description: ""
  });
  const [showCard, setShowCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.usia) {
      setError("Harap isi usia terlebih dahulu");
      setIsLoading(false);
      return;
    }

    const age = parseInt(formData.usia);
    const isUnder17 = age < 17;

    if (isUnder17) {
      setRekomendasi({
        product: "Simpanan Pelajar",
        description: "Tabungan khusus pelajar dengan fitur edukasi keuangan"
      });
      setShowCard(true);
      setIsLoading(false);
      return;
    }

    if (!formData.saldo || !formData.pendapatan) {
      setError("Harap isi semua field yang wajib diisi");
      setIsLoading(false);
      return;
    }

    const payload = {
      Age: age,
      CustAccountBalance: parseFloat(formData.saldo),
      CustAmount: parseFloat(formData.pendapatan)
    };

    try {
      const response = await fetch("/api/rekomendasi", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mendapatkan rekomendasi");
      }

      const data = await response.json();
      
      if (!data.recommended_product) {
        throw new Error("Format respons tidak valid");
      }

      setRekomendasi({
        product: data.recommended_product,
        description: data.description || getProductDescription(data.recommended_product)
      });
      setShowCard(true);

    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Terjadi kesalahan saat memproses data"
      );
      setShowCard(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductDescription = (product: string) => {
    switch(product) {
      case "Tabungan Reguler":
        return "Melihat preferensi Anda, Tabungan Reguler adalah pilihan yang paling sesuai. Anda lebih mengutamakan penyimpanan dana yang sederhana tanpa orientasi investasi. Dengan saldo yang lebih kecil dan frekuensi transaksi rendah, produk ini memberikan kenyamanan bagi Anda yang hanya ingin memiliki tabungan untuk kebutuhan dasar tanpa banyak risiko.";
      case "Tabungan Tapres":
        return "Tabungan khusus untuk anak dan remaja dengan fitur pendidikan";
      case "Deposito Berjangka":
        return "Berdasarkan preferensi yang Anda berikan, saya melihat bahwa Deposito adalah pilihan yang paling tepat untuk Anda. Profil keuangan Anda yang kuat, dengan pendapatan stabil dan saldo rekening besar, mencerminkan karakteristik nasabah Deposito. Anda juga memiliki kecenderungan untuk berinvestasi dan mengelola keuangan dengan bijak, terlihat dari riwayat pinjaman dan frekuensi transaksi yang tinggi. Jika Anda mencari tempat aman untuk mengembangkan aset jangka panjang, Deposito akan menjadi solusi terbaik.";
      case "Kartu Kredit":
        return "Dari preferensi Anda, saya melihat bahwa Kartu Kredit adalah pilihan yang paling sesuai. Anda memiliki pendapatan stabil dan saldo rekening yang cukup besar, serta aktif bertransaksi. Kartu Kredit cocok bagi Anda yang terbiasa dengan kemudahan pembayaran dan fleksibilitas finansial. Ditambah lagi, minat investasi Anda menunjukkan bahwa Anda siap mengelola keuangan dengan lebih dinamis.";
      case "Reksa Dana":
        return "Melihat preferensi Anda, Reksa Dana adalah pilihan yang paling tepat. Pendapatan Anda stabil, dan saldo rekening Anda tergolong tinggi. Anda memiliki minat yang kuat dalam investasi, dan Reksa Dana memberikan kesempatan bagi Anda untuk mengembangkan aset secara bertahap. Dengan frekuensi transaksi yang sedang, produk ini cocok bagi Anda yang mengutamakan stabilitas dan pertumbuhan.";
      case "Simpanan Pelajar":
        return "Tabungan khusus pelajar dengan fitur edukasi keuangan";
      default:
        return "Produk perbankan yang sesuai dengan profil Anda";
    }
  };

  const handleOkClick = () => {
    setFormData({
      usia: "",
      jenisKelamin: "",
      pekerjaan: "",
      saldo: "",
      pendapatan: ""
    });
    setShowCard(false);
    setError("");
  };

  const usiaValid = formData.usia && parseInt(formData.usia) >= 6;
  const isUnder17 = usiaValid && parseInt(formData.usia) < 17;

  return (
    <div className="chat-page" style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Navbar Transparan di Atas Konten */}
      <Navbar style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }} />

      {/* Konten Utama */}
      <div style={{
        flex: 1,
        paddingTop: "70px", // Sesuaikan dengan tinggi navbar
        display: "flex",
        flexDirection: "column",
        // background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)"
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
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(5px)"
            }}
          >
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4" style={{ color: "#333" }}>Formulir Rekomendasi Produk Bank</h2>
              
              <div className="alert alert-info mb-4" style={{
                backgroundColor: "#e7f5ff",
                borderColor: "#d0ebff",
                color: "#1864ab"
              }}>
                <p className="mb-0 text-center">
                  Untuk mengetahui produk bank yang cocok dengan rutinitasmu, silahkan isi terlebih dahulu data berikut. Hasil rekomendasi akan langsung muncul setelah klik submit.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="usia" className="form-label">
                    Usia <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="usia"
                    name="usia"
                    value={formData.usia}
                    onChange={handleChange}
                    required
                    min="6"
                    style={{
                      borderRadius: "8px",
                      padding: "10px 15px",
                      border: "1px solid #ddd"
                    }}
                  />
                  {isUnder17 && (
                    <div className="text-muted mt-1" style={{ fontSize: "0.875rem" }}>
                      Untuk usia di bawah 17 tahun, hanya tersedia Simpanan Pelajar
                    </div>
                  )}
                </div>

                {usiaValid && !isUnder17 && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="jenisKelamin" className="form-label">
                        Jenis Kelamin
                      </label>
                      <select
                        className="form-select"
                        id="jenisKelamin"
                        name="jenisKelamin"
                        value={formData.jenisKelamin}
                        onChange={handleChange}
                        style={{
                          borderRadius: "8px",
                          padding: "10px 15px",
                          border: "1px solid #ddd"
                        }}
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="pekerjaan" className="form-label">
                        Pekerjaan
                      </label>
                      <select
                        className="form-select"
                        id="pekerjaan"
                        name="pekerjaan"
                        value={formData.pekerjaan}
                        onChange={handleChange}
                        style={{
                          borderRadius: "8px",
                          padding: "10px 15px",
                          border: "1px solid #ddd"
                        }}
                      >
                        <option value="">Pilih Pekerjaan</option>
                        {pekerjaanOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="pendapatan" className="form-label">
                        Pendapatan Bulanan (Rp) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="pendapatan"
                        name="pendapatan"
                        value={formData.pendapatan}
                        onChange={handleChange}
                        required
                        min="0"
                        style={{
                          borderRadius: "8px",
                          padding: "10px 15px",
                          border: "1px solid #ddd"
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="saldo" className="form-label">
                        Saldo Rekening (Rp) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="saldo"
                        name="saldo"
                        value={formData.saldo}
                        onChange={handleChange}
                        required
                        min="0"
                        style={{
                          borderRadius: "8px",
                          padding: "10px 15px",
                          border: "1px solid #ddd"
                        }}
                      />
                    </div>
                  </>
                )}

                <motion.button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "#007bff",
                    border: "none",
                    fontWeight: "500"
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Memproses...
                    </>
                  ) : (
                    "Dapatkan Rekomendasi"
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recommendation Modal */}
      {showCard && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100" 
            style={{ 
              backgroundColor: "rgba(0,0,0,0.5)", 
              zIndex: 1040 
            }} 
            onClick={() => setShowCard(false)} 
          />
          
          <motion.div 
            className="position-fixed d-flex align-items-center justify-content-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              zIndex: 1050,
              inset: 0
            }}
          >
            <div 
              className="bg-white text-dark p-4 rounded shadow-lg"
              style={{ 
                width: "90%", 
                maxWidth: "450px",
                borderTop: "5px solid #007bff",
                borderRadius: "12px",
                position: "relative"
              }}
            >
              <button 
                type="button" 
                className="btn-close position-absolute top-0 end-0 p-3" 
                aria-label="Close" 
                onClick={() => setShowCard(false)}
              />
              
              <h4 className="mb-3 text-center" style={{ color: "#007bff" }}>
                <i className="bi bi-check-circle-fill me-2 text-success"></i>
                Rekomendasi Produk Bank
              </h4>
              
              <div className="modal-body">
                {error ? (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                ) : (
                  <>
                    <h4 className="text-primary mb-3" style={{ fontWeight: "600" }}>{rekomendasi.product}</h4>
                    <p style={{ color: "#555", lineHeight: "1.6" }}>{rekomendasi.description}</p>
                    <div className="mt-4">
                      <h6 style={{ fontWeight: "500", color: "#333" }}>Detail Profil:</h6>
                      <ul style={{ paddingLeft: "20px", color: "#555" }}>
                        <li>Usia: {formData.usia} tahun</li>
                        {formData.jenisKelamin && <li>Jenis Kelamin: {formData.jenisKelamin}</li>}
                        {formData.pekerjaan && <li>Pekerjaan: {formData.pekerjaan}</li>}
                        {!isUnder17 && formData.pendapatan && <li>Pendapatan: Rp {parseInt(formData.pendapatan).toLocaleString()}</li>}
                        {!isUnder17 && formData.saldo && <li>Saldo: Rp {parseInt(formData.saldo).toLocaleString()}</li>}
                      </ul>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-center mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={handleOkClick}
                  style={{
                    borderRadius: "20px",
                    padding: "8px 20px",
                    fontWeight: "500"
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <footer className="text-center text-light py-3 small">
        © 2025 by ElChatbot
      </footer>
    </div>
  );
};

export default FormPage;