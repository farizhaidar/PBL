"use client";

import React, { useState } from "react";
import Navbar from "../component/navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "../globals.css";

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState({
    usia: "",
    pendapatan: "",
    saldo: "",
    jenisKelamin: "",
    pekerjaan: "",
  });

  const [rekomendasi, setRekomendasi] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const usia = parseInt(formData.usia);
    const saldo = parseFloat(formData.saldo);
    const pendapatan = parseFloat(formData.pendapatan);

    // Simpanan Pelajar Otomatis
    if (usia >= 6 && usia < 17 && saldo === 0 && pendapatan === 0) {
      setRekomendasi("Simpanan Pelajar");
      setShowCard(true);
      setIsLoading(false);
      return;
    }

    if (usia < 17) {
      setError("Minimal usia untuk rekomendasi produk selain Simpanan Pelajar adalah 17 tahun.");
      setShowCard(true);
      setIsLoading(false);
      return;
    }

    const payload = {
      Age: usia,
      CustAccountBalance: saldo,
      CustAmount: pendapatan,
      Gender: formData.jenisKelamin,
      Job: formData.pekerjaan,
    };

    try {
      const response = await fetch("/api/rekomendasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "HTTP Error");
      }

      if (data.recommended_product) {
        setRekomendasi(data.recommended_product);
        setShowCard(true);
      } else {
        throw new Error("Gagal mendapatkan rekomendasi dari server");
      }

    } catch (error) {
      console.error("Error:", error);
      setError("Terjadi kesalahan saat memproses data. Silakan coba lagi.");
      setShowCard(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOkClick = () => {
    setFormData({
      usia: "",
      pendapatan: "",
      saldo: "",
      jenisKelamin: "",
      pekerjaan: "",
    });
    setShowCard(false);
    setError(null);
  };

  const usiaValid = formData.usia && parseInt(formData.usia) >= 6;

  return (
    <>
      <div className="navbar-always-scrolled">
        <Navbar />
      </div>

      <div className="position-relative min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#d9e2ec" }}>
        <div className="container p-4" style={{ maxWidth: "700px", zIndex: 1, marginTop: "100px" }}>
          <div className="rounded p-4 shadow-lg bg-white">
            <h2 className="mb-4 text-center">Formulir Data Pengguna</h2>

            <div className="info-box mb-4 p-3 rounded">
              <p className="mb-0">
                Untuk mengetahui produk bank yang cocok dengan rutinitasmu,
                silahkan isi terlebih dahulu data berikut. Hasil rekomendasi
                akan langsung muncul setelah klik submit.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
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
                  min="6"
                />
              </div>

              {usiaValid && (
                <>
                  <div className="mb-3">
                    <label htmlFor="jenisKelamin" className="form-label">Jenis Kelamin</label>
                    <select
                      className="form-control"
                      id="jenisKelamin"
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="pekerjaan" className="form-label">Pekerjaan</label>
                    <select
                      className="form-control"
                      id="pekerjaan"
                      name="pekerjaan"
                      value={formData.pekerjaan}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Pilih Pekerjaan --</option>
                      <option value="Pelajar">Pelajar</option>
                      <option value="Mahasiswa">Mahasiswa</option>
                      <option value="Pegawai Swasta">Pegawai Swasta</option>
                      <option value="PNS">PNS</option>
                      <option value="Wirausaha">Wirausaha</option>
                      <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

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
                      min="0"
                    />
                  </div>

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
                      min="0"
                    />
                  </div>

                  <button type="submit" className="btn-submit w-100 py-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Memproses...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {showCard && <div className="modal-backdrop show"></div>}

        {showCard && (
          <div className="modal d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "700px" }}>
              <div className="modal-content p-3">
                <div className="modal-header">
                  <h5 className="modal-title">💡 Rekomendasi Produk Bank</h5>
                </div>
                <div className="modal-body">
                  {error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : (
                    <>
                      <p className="fw-bold mb-2">{rekomendasi}</p>
                      {rekomendasi && (
                        <div className="product-description">
                          {rekomendasi.includes("Tabungan Reguler") && (
                            <p>Tabungan Reguler cocok bagi Anda yang mengutamakan penyimpanan dana yang sederhana tanpa risiko.</p>
                          )}
                          {rekomendasi.includes("Tabungan Tapres") && (
                            <p>Tabungan Tapres menawarkan bunga lebih tinggi dengan kemudahan transaksi dan e-statement.</p>
                          )}
                          {rekomendasi.includes("Kartu Kredit") && (
                            <p>Kartu Kredit cocok bagi Anda yang aktif bertransaksi dan membutuhkan fleksibilitas finansial.</p>
                          )}
                          {rekomendasi.includes("Deposito") && (
                            <p>Deposito memberikan keuntungan aman dan stabil untuk jangka panjang.</p>
                          )}
                          {rekomendasi.includes("Reksa Dana") && (
                            <p>Reksa Dana cocok bagi Anda yang ingin mulai berinvestasi dengan risiko terukur.</p>
                          )}
                          {rekomendasi.includes("Simpanan Pelajar") && (
                            <p>Simpanan Pelajar adalah tabungan khusus untuk pelajar dengan syarat ringan dan tanpa biaya administrasi.</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn-ok" onClick={handleOkClick}>OK</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FormPage;
