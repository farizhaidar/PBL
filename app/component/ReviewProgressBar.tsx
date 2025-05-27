'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Classification = 'positif' | 'netral' | 'negatif';

interface Review {
  id: number;
  review_text: string;
  classification: Classification;
  created_at: string;
}

export default function ReviewProgressBar() {
  const [counts, setCounts] = useState<Record<Classification, number>>({
    positif: 0,
    netral: 0,
    negatif: 0,
  });

  const [percentages, setPercentages] = useState({
    positif: 0,
    negatif: 0,
  });

  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const updatePercentages = (counts: Record<Classification, number>) => {
    const total = counts.positif + counts.negatif;
    if (total === 0) {
      setPercentages({ positif: 0, negatif: 0 });
      return;
    }
    setPercentages({
      positif: (counts.positif / total) * 100,
      negatif: (counts.negatif / total) * 100,
    });
  };

  const fetchReviewCounts = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('classification');
      if (error) throw error;

      if (data) {
        const newCounts = data.reduce(
          (acc, cur) => {
            const cls = (cur.classification as Classification).toLowerCase() as Classification;
            if (cls in acc) {
              acc[cls]++;
            }
            return acc;
          },
          { positif: 0, netral: 0, negatif: 0 }
        );
        setCounts(newCounts);
        updatePercentages(newCounts);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviewCounts();
  }, []);

  const handleSubmit = async () => {
    if (!review.trim()) return;
    setIsSubmitting(true);
    setSubmitMessage('');
    setError(null);

    try {
      const response = await fetch('/api/proxy-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: review }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.classification) throw new Error('Response klasifikasi tidak valid');

      const classification = (data.classification as string).toLowerCase() as Classification;

      const { error: supabaseError } = await supabase.from('reviews').insert({
        review_text: review,
        classification,
      });

      if (supabaseError) throw supabaseError;

      const updatedCounts = { ...counts };
      if (classification in updatedCounts) {
        updatedCounts[classification]++;
      }
      setCounts(updatedCounts);
      updatePercentages(updatedCounts);

      setReview('');
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan saat memproses ulasan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', paddingRight: '5rem' }}>
      <hr className="mt-4 mb-3" style={{ borderTop: '2px solid white', width: '140%' }} />

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: 'green' }}>
            <i className="fas fa-smile" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}></i>
            <span>{percentages.positif.toFixed(0)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: 'red' }}>
            <span style={{ marginRight: '0.5rem' }}>{percentages.negatif.toFixed(0)}%</span>
            <i className="fas fa-frown" style={{ fontSize: '1.2rem' }}></i>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            height: '12px',
            backgroundColor: 'transparent',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentages.positif}%`,
              backgroundColor: 'green',
            }}
          ></div>
          <div
            style={{
              width: `${percentages.negatif}%`,
              backgroundColor: 'red',
            }}
          ></div>
        </div>
      </div>

      {/* MODIFIED BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '6px 14px',
          borderRadius: '12px',
          border: '2px solid #28a745',
          backgroundColor: '#28a745',
          color: 'white',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#28a745';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#28a745';
          e.currentTarget.style.color = 'white';
        }}
      >
        Berikan Ulasan
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
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
        >
          <div
            onClick={(e) => e.stopPropagation()}
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
          >
            <h3 style={{ marginTop: '1rem', fontWeight: '700' }}>Tulis Ulasan Anda</h3>
            <textarea
              rows={6}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              disabled={isSubmitting}
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: '1.5px solid #18b2ea',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '1rem',
                resize: 'vertical',
                width: '100%',
              }}
              placeholder="Masukkan ulasan Anda..."
            />
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            {submitMessage && <p style={{ fontWeight: 'bold', color: 'green' }}>{submitMessage}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
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
                disabled={isSubmitting || !review.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isSubmitting ? '#0d85c4' : '#18b2ea',
                  color: 'white',
                  fontWeight: '700',
                  cursor: isSubmitting || !review.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
