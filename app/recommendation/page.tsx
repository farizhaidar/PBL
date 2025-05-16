"use client";

import React, { useState } from "react";
import Navbar from "../component/navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "../globals.css";

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState({
    usia: "",
    jenisKelamin: "",
    pendapatan: "",
    saldo: "",
    riwayatPinjaman: "",
    jenisTransaksiFavorit: "",
    frekuensiTransaksi: "",
  });

  const [rekomendasi, setRekomendasi] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    try {
      const response = await fetch("https://ml.ghavio.my.id/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.rekomendasi) {
        setRekomendasi(data.rekomendasi);
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
      jenisKelamin: "",
      pendapatan: "",
      saldo: "",
      riwayatPinjaman: "",
      jenisTransaksiFavorit: "",
      frekuensiTransaksi: "",
    });
    setShowCard(false);
    setError(null);
  };

  const usiaValid = formData.usia && parseInt(formData.usia) >= 17;

  return (
    <>
      <div className="navbar-always-scrolled">
        <Navbar />
      </div>

      <div
        className="position-relative min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#d9e2ec" }} // background abu2 transparan
      >
        <div className="container p-4" style={{ maxWidth: "700px", zIndex: 1, marginTop: "100px"  }}>
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
              {/* Usia */}
              <div className="mb-3">
                <label htmlFor="usia" className="form-label">
                  Usia
                </label>
                <input
                  type="number"
                  className="form-control "
                  id="usia"
                  name="usia"
                  value={formData.usia}
                  onChange={handleChange}
                  required
                  min="17"
                />
                {formData.usia && parseInt(formData.usia) < 17 && (
                  <div className="alert alert-warning mt-2" role="alert">
                    Minimal usia untuk mengisi formulir ini adalah 17 tahun.
                  </div>
                )}
              </div>

              {/* Field lainnya hanya muncul jika usia ≥ 17 */}
              {usiaValid && (
                <>
                  {/* Jenis Kelamin */}
                  <div className="mb-3">
                    <label htmlFor="jenisKelamin" className="form-label">
                      Jenis Kelamin
                    </label>
                    <select
                      className="form-select "
                      id="jenisKelamin"
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih</option>
                      <option value="Pria">Pria</option>
                      <option value="Wanita">Wanita</option>
                    </select>
                  </div>

                  {/* Pendapatan Bulanan */}
                  <div className="mb-3">
                    <label htmlFor="pendapatan" className="form-label">
                      Pendapatan Bulanan (Rp)
                    </label>
                    <input
                      type="number"
                      className="form-control "
                      id="pendapatan"
                      name="pendapatan"
                      value={formData.pendapatan}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  {/* Saldo Rekening */}
                  <div className="mb-3">
                    <label htmlFor="saldo" className="form-label">
                      Saldo Rekening (Rp)
                    </label>
                    <input
                      type="number"
                      className="form-control "
                      id="saldo"
                      name="saldo"
                      value={formData.saldo}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  {/* Riwayat Pinjaman */}
                  <div className="mb-3">
                    <label htmlFor="riwayatPinjaman" className="form-label">
                      Riwayat Pinjaman
                    </label>
                    <select
                      className="form-select "
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

                  {/* Jenis Transaksi Favorit */}
                  <div className="mb-4">
                    <label
                      htmlFor="jenisTransaksiFavorit"
                      className="form-label"
                    >
                      Jenis Transaksi Favorit
                    </label>
                    <select
                      className="form-select "
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

                  {/* Frekuensi Transaksi */}
                  {formData.jenisTransaksiFavorit !== "" && (
                    <div className="mb-3">
                      <label
                        htmlFor="frekuensiTransaksi"
                        className="form-label"
                      >
                        Rata-rata Jumlah Transaksi per Bulan
                      </label>
                      <input
                        type="number"
                        className="form-control "
                        id="frekuensiTransaksi"
                        name="frekuensiTransaksi"
                        value={formData.frekuensiTransaksi}
                        onChange={handleChange}
                        required
                        min="1"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-submit w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
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

        {/* Rekomendasi Card */}
        {showCard && <div className="modal-backdrop show"></div>}

        {showCard && (
  <div className="modal-backdrop show"></div>
)}

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
              <p className="fw-bold mb-2 ">{rekomendasi}</p>
              
              {/* Deskripsi produk berdasarkan rekomendasi */}
              {rekomendasi && (
                <div className="product-description">
                  {rekomendasi.includes("Tabungan Reguler") && (
                    <p>Melihat preferensi Anda, Tabungan Reguler adalah pilihan yang paling sesuai. Anda lebih mengutamakan penyimpanan dana yang sederhana tanpa orientasi investasi. Dengan saldo yang lebih kecil dan frekuensi transaksi rendah, produk ini memberikan kenyamanan bagi Anda yang hanya ingin memiliki tabungan untuk kebutuhan dasar tanpa banyak risiko.</p>
                  )}
                  
                  {rekomendasi.includes("Kartu Kredit") && (
                    <p>Dari preferensi Anda, saya melihat bahwa Kartu Kredit adalah pilihan yang paling sesuai. Anda memiliki pendapatan stabil dan saldo rekening yang cukup besar, serta aktif bertransaksi. Kartu Kredit cocok bagi Anda yang terbiasa dengan kemudahan pembayaran dan fleksibilitas finansial. Ditambah lagi, minat investasi Anda menunjukkan bahwa Anda siap mengelola keuangan dengan lebih dinamis.</p>
                  )}
                  
                  {rekomendasi.includes("Tabungan Digital") && (
                    <p>Berdasarkan preferensi Anda, Tabungan Digital akan sangat cocok untuk Anda. Anda lebih mengutamakan kemudahan transaksi dan fleksibilitas, tanpa terbebani oleh komitmen investasi. Dengan saldo yang moderat dan frekuensi transaksi yang sedang, produk ini ideal untuk kebutuhan sehari-hari tanpa harus memikirkan pengelolaan keuangan jangka panjang.</p>
                  )}
                  
                  {rekomendasi.includes("Deposito") && (
                    <p>Berdasarkan preferensi yang Anda berikan, saya melihat bahwa Deposito adalah pilihan yang paling tepat untuk Anda. Profil keuangan Anda yang kuat, dengan pendapatan stabil dan saldo rekening besar, mencerminkan karakteristik nasabah Deposito. Anda juga memiliki kecenderungan untuk berinvestasi dan mengelola keuangan dengan bijak, terlihat dari riwayat pinjaman dan frekuensi transaksi yang tinggi. Jika Anda mencari tempat aman untuk mengembangkan aset jangka panjang, Deposito akan menjadi solusi terbaik..</p>
                  )}
                  
                  {rekomendasi.includes("Reksadana") && (
                    <p>Melihat preferensi Anda, Reksa Dana adalah pilihan yang paling tepat. Pendapatan Anda stabil, dan saldo rekening Anda tergolong tinggi. Anda memiliki minat yang kuat dalam investasi, dan Reksa Dana memberikan kesempatan bagi Anda untuk mengembangkan aset secara bertahap. Dengan frekuensi transaksi yang sedang, produk ini cocok bagi Anda yang mengutamakan stabilitas dan pertumbuhan.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button 
            className="btn-ok"   
            onClick={handleOkClick}
          >
            OK
          </button>
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
