'use client';

import Navbar from './component/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Navbar />

      <div className="position-relative night-sky">
        {/* Section Home */}
        <section id="home" className="vh-100 d-flex align-items-center justify-content-center">
          {[...Array(50)].map((_, i) => (
            <span key={i} className="star"></span>
          ))}
          <div className="container-fluid text-light text-center">
            <h1 className="text-indigo-500 mb-5 fs-1">Chatbot</h1>
            <p className="mt-3 mx-5 px-5">
              elChatBot adalah asisten virtual berbasis AI yang siap membantu menjawab pertanyaanmu kapan saja.
              Dirancang dengan antarmuka yang simpel dan responsif, ChatBotKu membuat pengalaman chatting menjadi lebih cepat, nyaman, dan menyenangkan.
              <br /><br />
              ✨ Fitur Utama:
              <br />
              - Balasan cepat dari chatbot yang cerdas
              <br />
              - Antarmuka ringan, gelap, dan modern
              <br />
              - Navigasi mudah dan tampilan bersih
              <br />
              - Dukungan input multiline dan tombol kirim yang stylish
              <br />
              Mulai ngobrol sekarang dan rasakan kemudahan berinteraksi bersama ChatBotKu!
            </p>
            <Link
              href="/chat"
              className="btn mt-3 btn-hover-effect d-inline-flex align-items-center fs-5"
            >
              Getting Start
            </Link>
          </div>
        </section>

        {/* Section Features */}
        <section id="features" className="vh-100 d-flex align-items-center justify-content-center night-sky">
          {[...Array(50)].map((_, i) => (
            <span key={i} className="star"></span>
          ))}
          <div className="container text-light text-center">
            <h1 className="text-indigo-500 mb-4 fs-1">Temukan Produk Pinjaman yang Tepat untuk Anda</h1>
            <p className="mx-auto px-4" style={{ maxWidth: '700px' }}>
              Dengan fitur rekomendasi produk pinjaman kami, Anda dapat menemukan pilihan terbaik sesuai kebutuhan finansial Anda. 
              Cepat, aman, dan terpercaya!
            </p>

            <div className="row mt-5 justify-content-center">
              {['Cepat & Mudah', 'Aman & Terpercaya', 'Personalisasi'].map((title, idx) => (
                <div className="col-md-4" key={idx}>
                  <div
                    className="card p-4 text-center shadow-lg"
                    style={{
                      backgroundColor: '#2c2f3f',
                      color: 'white',
                      borderRadius: '12px',
                    }}
                  >
                    <Image
                      src="/pajar.jpg"
                      alt={title}
                      width={60}
                      height={60}
                      className="mx-auto mb-3 object-fit-cover rounded-circle"
                    />
                    <h5>{title}</h5>
                    <p>
                      {idx === 0 &&
                        'Hanya dalam beberapa langkah, temukan pinjaman yang sesuai kebutuhan Anda.'}
                      {idx === 1 &&
                        'Dukungan AI yang memastikan rekomendasi dari sumber terpercaya.'}
                      {idx === 2 &&
                        'Rekomendasi sesuai profil keuangan dan kebutuhan pribadi Anda.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/recommendation"
              className="btn mt-4"
              style={{
                backgroundColor: '#6610f2',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
              }}
            >
              Coba Sekarang
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
