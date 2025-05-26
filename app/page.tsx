'use client';

import Navbar from './component/navbar';
import Footer from './component/footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { products } from './product';
import ReviewProgressBar from './component/ReviewProgressBar';

export default function Home() {
  return (
    <>
      <Navbar />

      <div className="position-relative">
        {/* Section Home */}
        <section
          id="home"
          className="vh-100 d-flex align-items-center justify-content-center position-relative bg-dark"
        >
          <div
            className="overlay position-absolute w-100 h-100"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          ></div>
          <Image
            src="/front-view-woman-desk-wearing-headset-pointing.jpg"
            alt="Background Image"
            layout="fill"
            objectFit="cover"
            className="position-absolute bg-blur"
          />

          <div className="overlay position-absolute w-100 h-100"></div>

          <div className="container text-light" style={{ zIndex: 2, marginTop: '7rem' }}>
            <div className="row align-items-center">
              {/* Kolom Kiri - Teks dan Button */}
              <div className="col-md-7 mb-4">
                <h5 className="display-5 fw-bold mb-4 txt-utama">
                  Chatbot For Customer Support
                </h5>
                <p className="mt-4" style={{ maxWidth: '700px' }}>
                  Selamat datang di layanan chatbot resmi [Nama Bank]! Saya [Nama Chatbot], asisten virtual
                  yang siap membantu Anda dalam mendapatkan informasi dan menyelesaikan berbagai kebutuhan perbankan
                  dengan cepat dan mudah.
                </p>
                <Link href="/chat" className="btn btn-start btn-lg mt-3 px-4 fw-medium">
                  <b>Mulai Obrolan</b>
                </Link>

                {/* Pindahkan progress bar di sini, tanpa mengubah styling lain */}
                <div className="mt-4" style={{ maxWidth: '400px' }}>
                  <ReviewProgressBar orientation="horizontal" />
                </div>
              </div>

              {/* Kolom Kanan - Kosong */}
              <div className="col-md-5 d-flex justify-content-center">
                {/* Kosong */}
              </div>
            </div>
          </div>
        </section>

        {/* Section Features */}
        <section id="features" className="py-5 bg-light text-dark">
          <div className="container text-center">
            <h3 className="title mb-5 fs-1">Produk Kami</h3>
            <div className="row mt-4 justify-content-center">
              {products.map((product, index) => (
                <div className="col-md-4 mb-4" key={index}>
                  <div className="card border-0 shadow-sm h-100">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={400}
                      height={250}
                      className="card-img-top object-fit-cover"
                    />
                    <div className="card-body">
                      <h5 className="card-title">{product.title}</h5>
                      <p className="card-text text-muted">{product.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
