"use client";

import Navbar from "./component/navbar";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />

      <div className="position-relative night-sky"> 
        <section id="home" className="vh-100 d-flex align-items-center justify-content-center">
          {[...Array(50)].map((_, i) => (
            <span key={i} className="star"></span>
          ))}
          <div className="container-fluid text-light text-center">
            <h1 className="text-indigo-500 mb-5 fs-1">Chatbot</h1>
            <p className="mt-3 mx-5 px-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget lorem ut odio convallis posuere. Suspendisse potenti. Curabitur feugiat dui id sapien interdum, sed bibendum nunc pellentesque. Integer congue purus id orci aliquet, ac tincidunt lorem fermentum. Donec pharetra, lectus non pharetra efficitur, felis felis luctus velit, at fermentum magna justo non velit. Fusce tincidunt interdum sapien, nec varius lorem tincidunt ut.            </p>
            <a href="/chat" 
   className="btn mt-3 btn-hover-effect d-inline-flex align-items-center fs-5">Getting Start</a>

          </div>
        </section>

        <section id="features" className="vh-100 d-flex align-items-center justify-content-center night-sky">
          {[...Array(50)].map((_, i) => (
            <span key={i} className="star"></span>
          ))}
          <div className="container text-light text-center">
            <h1 className="text-indigo-500 mb-4 fs-1">Temukan Produk Pinjaman yang Tepat untuk Anda</h1>
            <p className="mx-auto px-4" style={{ maxWidth: "700px" }}>
              Dengan fitur rekomendasi produk pinjaman kami, Anda dapat menemukan pilihan terbaik sesuai kebutuhan finansial Anda. 
              Cepat, aman, dan terpercaya!
            </p>

            <div className="row mt-5 justify-content-center">
              <div className="col-md-4">
                <div className="card p-4 text-center shadow-lg" style={{ backgroundColor: "#2c2f3f", color: "white", borderRadius: "12px" }}>
                  <img src="/pajar.jpg" alt="Cepat" width="60" className="mx-auto mb-3 object-fit-cover" />
                  <h5>Cepat & Mudah</h5>
                  <p>Hanya dalam beberapa langkah, temukan pinjaman yang sesuai kebutuhan Anda.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-4 text-center shadow-lg" style={{ backgroundColor: "#2c2f3f", color: "white", borderRadius: "12px" }}>
                  <img src="/pajar.jpg" alt="Aman" width="60" className="mx-auto mb-3" />
                  <h5>Aman & Terpercaya</h5>
                  <p>Dukungan AI yang memastikan rekomendasi dari sumber terpercaya.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-4 text-center shadow-lg" style={{ backgroundColor: "#2c2f3f", color: "white", borderRadius: "12px" }}>
                  <img src="/pajar.jpg" alt="Personalisasi" width="60" className="mx-auto mb-3" />
                  <h5>Personalisasi</h5>
                  <p>Rekomendasi sesuai profil keuangan dan kebutuhan pribadi Anda.</p>
                </div>
              </div>
            </div>

            <a href="/recommendation" className="btn mt-4" style={{ backgroundColor: "#6610f2", color: "white", padding: "12px 20px", borderRadius: "8px" }}>
              Coba Sekarang
            </a>
          </div>
        </section>

      </div>
    </>
  );
}
