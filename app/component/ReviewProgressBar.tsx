'use client';

import { useEffect, useState } from 'react';

interface ReviewProgressBarProps {
  orientation?: 'vertical' | 'horizontal';
}

export default function ReviewProgressBar({ orientation = 'vertical' }: ReviewProgressBarProps) {
  const [positivePercent, setPositivePercent] = useState(0);
  const [negativePercent, setNegativePercent] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [predictionLabel, setPredictionLabel] = useState('');

  useEffect(() => {
    fetch('/api/review-stats')
      .then((res) => res.json())
      .then((data) => {
        setPositivePercent(data.positivePercentage);
        setNegativePercent(data.negativePercentage);
      })
      .catch((err) => console.error('Error fetching review stats:', err));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    setPredictionLabel('');

    try {
      const res = await fetch('http://localhost:8000/sentimen/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: review }),
      });

      const data = await res.json();
      if (data && data.label) {
        setPredictionLabel(data.label);
        setSubmitMessage('Ulasan berhasil diklasifikasi!');
      } else {
        setSubmitMessage('Gagal memproses ulasan.');
      }

      setReview('');
      // Modal tidak langsung ditutup supaya hasil klasifikasi terlihat
    } catch (err) {
      console.error(err);
      setSubmitMessage('Terjadi kesalahan saat mengirim ulasan.');
    }

    setIsSubmitting(false);
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
        }}
        onClick={() => setShowModal(false)}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: 'white',
            padding: '25px 36px',
            borderRadius: '12px',
            width: '100%',
            height: '100%',
            maxHeight: '380px',
            maxWidth: '620px',
            color: 'black',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h5 style={{ marginTop: '1rem', fontWeight: '700' }}>Tulis Ulasan Anda</h5>
          <textarea
            className="form-control"
            rows={6}
            placeholder="Tulis ulasan..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            style={{
              backgroundColor: 'white',
              color: 'black',
              border: '1.5px solid #18b2ea',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
          {submitMessage && (
            <p style={{ fontWeight: 'bold', color: 'green' }}>{submitMessage}</p>
          )}
          {predictionLabel && (
            <p style={{ fontWeight: 'bold', color: '#18b2ea' }}>
              Hasil klasifikasi: {predictionLabel}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {!predictionLabel && (
              <>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '2px solid #bbb',
                    backgroundColor: 'transparent',
                    color: '#555',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSubmitting ? '#0d85c4' : '#18b2ea',
                    color: 'white',
                    fontWeight: '700',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </>
            )}
            {predictionLabel && (
              <button
                onClick={() => {
                  setShowModal(false);
                  setPredictionLabel('');
                  setSubmitMessage('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#18b2ea',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const writeReviewButtonStyle = {
    padding: '10px 22px',
    borderRadius: '16px',
    border: '2px solid #18b2ea',
    backgroundColor: '#18b2ea',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
  };

  const writeReviewButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.backgroundColor = '#18b2ea';
    el.style.color = 'white';
  };

  const writeReviewButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.backgroundColor = 'transparent';
    el.style.color = '#18b2ea';
  };

  // Versi Horizontal
  if (orientation === 'horizontal') {
    return (
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <hr className="mt-4 mb-3" style={{ borderTop: '2px solid white', width: '180%' }} />

        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="d-flex align-items-center fw-semibold fs-6" style={{ color: 'green' }}>
            <i className="fas fa-smile me-2" style={{ fontSize: '1.2rem', color: 'green' }}></i>
            <span>{positivePercent.toFixed(0)}%</span>
          </div>
          <div className="d-flex align-items-center text-danger fw-semibold fs-6">
            <span className="me-2">{negativePercent.toFixed(0)}%</span>
            <i className="fas fa-frown" style={{ fontSize: '1.2rem', color: 'red' }}></i>
          </div>
        </div>

        <div className="progress mb-4" style={{ height: '12px', backgroundColor: 'transparent' }}>
          <div className="progress-bar" role="progressbar" style={{ width: `${positivePercent}%`, backgroundColor: 'green' }}></div>
          <div className="progress-bar" role="progressbar" style={{ width: `${negativePercent}%`, backgroundColor: 'red' }}></div>
        </div>

        <button style={writeReviewButtonStyle} onClick={() => setShowModal(true)}>
          Berikan Ulasan
        </button>

        {renderModal()}
        {submitMessage && (
          <p className="mt-2 small" style={{ color: 'white' }}>
            {submitMessage}
          </p>
        )}
        {predictionLabel && (
          <p className="mt-1 small" style={{ color: 'white', fontWeight: 'bold' }}>
            Hasil klasifikasi: {predictionLabel}
          </p>
        )}
      </div>
    );
  }

  // Versi Vertikal
  return (
    <div className="d-flex" style={{ width: '90px', height: '200px', position: 'relative' }}>
      <div className="d-flex flex-column align-items-center me-2" style={{ minWidth: '30px', justifyContent: 'space-between', height: '100%' }}>
        <div className="d-flex align-items-center fw-semibold fs-6 text-white" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          <span>{negativePercent.toFixed(0)}%</span>
          <i className="fas fa-frown" style={{ fontSize: '1rem' }}></i>
        </div>
        <div className="d-flex align-items-center fw-semibold fs-6" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', color: '#18b2ea' }}>
          <i className="fas fa-smile" style={{ fontSize: '1rem' }}></i>
          <span>{positivePercent.toFixed(0)}%</span>
        </div>
      </div>

      <div className="progress" style={{ width: '14px', height: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
        <div className="progress-bar" role="progressbar" style={{ height: `${positivePercent}%`, backgroundColor: '#18b2ea' }}></div>
        <div className="progress-bar" role="progressbar" style={{ height: `${negativePercent}%`, backgroundColor: '#ffffff' }}></div>
      </div>

      <button
        style={{
          ...writeReviewButtonStyle,
          position: 'absolute',
          bottom: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          fontSize: '0.9rem',
        }}
        onClick={() => setShowModal(true)}
        onMouseEnter={writeReviewButtonHover}
        onMouseLeave={writeReviewButtonLeave}
      >
        Tulis Ulasan
      </button>

      {renderModal()}
      {submitMessage && (
        <p className="mt-2 small" style={{ position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)', color: 'white' }}>
          {submitMessage}
        </p>
      )}
      {predictionLabel && (
        <p className="mt-1 small" style={{ position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontWeight: 'bold' }}>
          Hasil klasifikasi: {predictionLabel}
        </p>
      )}
    </div>
  );
}
