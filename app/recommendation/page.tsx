"use client";
import React, { useState } from "react";
import Navbar from "../component/navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "../globals.css";

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

    // Validate inputs
    if (!formData.usia || !formData.saldo || !formData.pendapatan) {
      setError("Harap isi semua field yang wajib diisi");
      setIsLoading(false);
      return;
    }

    const payload = {
      Age: parseInt(formData.usia),
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

      // Set recommendation with description
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

  return (
    <>
      <div className="navbar-always-scrolled">
        <Navbar />
      </div>

      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Formulir Rekomendasi Produk Bank</h2>
              
              <div className="alert alert-info mb-4">
                <p className="mb-0">
                  Isi data diri Anda untuk mendapatkan rekomendasi produk bank yang paling sesuai.
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
                  />
                  {formData.usia && parseInt(formData.usia) < 17 && (
                    <div className="text-muted mt-1">
                      Untuk usia di bawah 17 tahun, hanya tersedia Simpanan Pelajar dengan saldo 0
                    </div>
                  )}
                </div>

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
                  >
                    <option value="">Pilih Pekerjaan</option>
                    {pekerjaanOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {usiaValid && (
                  <>
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
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Memproses...
                    </>
                  ) : (
                    "Dapatkan Rekomendasi"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Modal */}
      {showCard && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rekomendasi Produk Bank</h5>
              </div>
              <div className="modal-body">
                {error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : (
                  <>
                    <h4 className="text-primary mb-3">{rekomendasi.product}</h4>
                    <p>{rekomendasi.description}</p>
                    <div className="mt-4">
                      <h6>Detail Profil:</h6>
                      <ul>
                        <li>Usia: {formData.usia} tahun</li>
                        {formData.jenisKelamin && <li>Jenis Kelamin: {formData.jenisKelamin}</li>}
                        {formData.pekerjaan && <li>Pekerjaan: {formData.pekerjaan}</li>}
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={handleOkClick}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormPage;