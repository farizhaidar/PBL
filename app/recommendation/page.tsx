"use client";

import React, { useState } from "react";
import Navbar from "../component/navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "../globals.css"; // pastikan night-sky dan star ada di sini

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState({
    usia: "",
    jenisKelamin: "",
    pendapatan: "",
    saldo: "",
    riwayatPinjaman: "",
    frekuensiTransaksi: "",
    jenisTransaksiFavorit: "",
  });

  const [rekomendasi, setRekomendasi] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (data.rekomendasi) {
        setRekomendasi(data.rekomendasi);
        setShowCard(true); // Show recommendation card
      } else {
        setRekomendasi("Gagal mendapatkan rekomendasi.");
        setShowCard(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setRekomendasi("Terjadi kesalahan saat memproses data.");
      setShowCard(true);
    }
  };

  const handleOkClick = () => {
    setFormData({
      usia: "",
      jenisKelamin: "",
      pendapatan: "",
      saldo: "",
      riwayatPinjaman: "",
      frekuensiTransaksi: "",
      jenisTransaksiFavorit: "",
    });
    setShowCard(false); // Hide recommendation card
  };
  
  return (
    <>
      <Navbar />

      <div className="position-relative night-sky min-vh-100 d-flex align-items-center justify-content-center">
        {[...Array(50)].map((_, i) => (
          <span key={i} className="star"></span>
        ))}

        <div className="container p-4" style={{ maxWidth: "700px", zIndex: 1 }}>
          <div className="text-light rounded p-4 shadow-lg">

            <h2 className="mb-4 text-center">Formulir Data Pengguna</h2>

            {/* Box Penjelasan */}
            <div className="info-box">
              <p>
                Untuk mengetahui produk bank yang cocok dengan rutinitasmu, silahkan isi terlebih dahulu data berikut.
                Hasil rekomendasi akan langsung muncul setelah klik submit.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Usia */}
              <div className="mb-3">
                <label htmlFor="usia" className="form-label">Usia</label>
                <input
                  type="number"
                  className="form-control"
                  id="usia"
                  name="usia"
                  value={formData.usia}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="mb-3">
                <label htmlFor="jenisKelamin" className="form-label">Jenis Kelamin</label>
                <select
                  className="form-select"
                  id="jenisKelamin"
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Pendapatan Bulanan */}
              <div className="mb-3">
                <label htmlFor="pendapatan" className="form-label">Pendapatan Bulanan (Rp)</label>
                <input
                  type="number"
                  className="form-control"
                  id="pendapatan"
                  name="pendapatan"
                  value={formData.pendapatan}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Saldo Rekening */}
              <div className="mb-3">
                <label htmlFor="saldo" className="form-label">Saldo Rekening (Rp)</label>
                <input
                  type="number"
                  className="form-control"
                  id="saldo"
                  name="saldo"
                  value={formData.saldo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Riwayat Pinjaman */}
              <div className="mb-3">
                <label htmlFor="riwayatPinjaman" className="form-label">Riwayat Pinjaman</label>
                <select
                  className="form-select"
                  id="riwayatPinjaman"
                  name="riwayatPinjaman"
                  value={formData.riwayatPinjaman}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="Pernah">Pernah</option>
                  <option value="Belum Pernah">Belum Pernah</option>
                </select>
              </div>

              {/* Frekuensi Transaksi */}
              <div className="mb-3">
                <label htmlFor="frekuensiTransaksi" className="form-label">Rata-rata Jumlah Transaksi per Bulan</label>
                <input
                  type="number"
                  className="form-control"
                  id="frekuensiTransaksi"
                  name="frekuensiTransaksi"
                  value={formData.frekuensiTransaksi}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Jenis Transaksi Favorit */}
              <div className="mb-4">
                <label htmlFor="jenisTransaksiFavorit" className="form-label">Jenis Transaksi Favorit</label>
                <select
                  className="form-select"
                  id="jenisTransaksiFavorit"
                  name="jenisTransaksiFavorit"
                  value={formData.jenisTransaksiFavorit}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Kartu Kredit">Kartu Kredit</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Investasi">Investasi</option>
                  <option value="Deposito">Deposito</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Rekomendasi Card */}
        {showCard && (
          <div className="position-absolute top-50 start-50 translate-middle w-75 p-4 shadow-lg rounded bg-light" style={{ zIndex: 1050 }}>
            <div className="text-center">
              <h4 className="text-primary mb-3">💡 Rekomendasi Produk Bank</h4>
              <div className="card p-4">
                <p>{rekomendasi}</p>
                <button className="btn btn-success" onClick={handleOkClick}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FormPage;
