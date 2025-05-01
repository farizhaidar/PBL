"use client";

import { useEffect, useState } from 'react'

interface Booking {
  id: string
  name: string
  email: string
  date: string
  time: string
  created_at: string
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/booking')
      
      console.log('Response status:', res.status)
      const json = await res.json()
      console.log('Response data:', json)

      if (!res.ok) throw new Error(json.error || 'Gagal memuat data')

      // Handle different response structures
      const bookingsData = json.bookings || json.data || json
      setBookings(bookingsData)
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete booking
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus booking ini?')) return

    try {
      const res = await fetch('/api/booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Gagal menghapus')

      setBookings(bookings.filter((b) => b.id !== id))
      alert('Booking berhasil dihapus!')
    } catch (err: any) {
      alert(err.message)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📋 Daftar Booking</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && bookings.length === 0 && <p>Tidak ada booking</p>}

      {!loading && bookings.length > 0 && (
        <table border={1} cellPadding={10} cellSpacing={0} style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Dibuat Pada</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>{b.time}</td>
                <td>{new Date(b.created_at).toLocaleString()}</td>
                <td>
                  <button 
                    onClick={() => handleDelete(b.id)} 
                    style={{ 
                      color: 'white', 
                      backgroundColor: 'red', 
                      border: 'none', 
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}