import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings: data }, { status: 200 })
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()

    // Check if this is an availability check request
    if (requestBody.date && requestBody.time && requestBody.location && Object.keys(requestBody).length === 3) {
      // Availability check logic
      const { date, time, location } = requestBody
      
      // Convert time to minutes for easier comparison
      const [hours, minutes] = time.split(':').map(Number)
      const requestedTimeInMinutes = hours * 60 + minutes

      // Get all bookings for the same date and location
      const { data: existingBookings, error: queryError } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', date)
        .eq('location', location)

      if (queryError) {
        console.error('Supabase error:', queryError)
        return NextResponse.json(
          { error: 'Gagal memeriksa ketersediaan' },
          { status: 500 }
        )
      }

      // Check if requested time conflicts with existing bookings (within 1 hour)
      const isAvailable = !existingBookings?.some(booking => {
        const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number)
        const bookingTimeInMinutes = bookingHours * 60 + bookingMinutes
        
        // Check if requested time is within 1 hour before or after any existing booking
        return Math.abs(requestedTimeInMinutes - bookingTimeInMinutes) < 60
      })

      return NextResponse.json({
        available: isAvailable
      }, { status: 200 })
    }

    // Otherwise, process as a booking submission
    const { name, phone, age, date, time, location } = requestBody

    // Validasi 1: Cek data lengkap
    if (!name || !phone || !age || !date || !time || !location) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Validasi 2: Format nomor HP
    const phoneRegex = /^[0-9]{10,15}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Format nomor HP tidak valid' },
        { status: 400 }
      )
    }

    // Validasi 3: Umur harus angka positif
    if (isNaN(Number(age)) || Number(age) <= 0) {
      return NextResponse.json(
        { error: 'Umur harus berupa angka positif' },
        { status: 400 }
      )
    }

    // Validasi 4: Pastikan date adalah format yang valid
    if (isNaN(new Date(date).getTime())) {
      return NextResponse.json(
        { error: 'Format tanggal tidak valid' },
        { status: 400 }
      )
    }

    // Validasi 5: Tanggal tidak boleh di masa lalu
    const today = new Date().toISOString().split('T')[0]
    if (date < today) {
      return NextResponse.json(
        { error: 'Tidak bisa memilih tanggal yang sudah lewat' },
        { status: 400 }
      )
    }

    // Validasi 6: Hari kerja saja (Senin-Jumat)
    const day = new Date(date).getDay()
    if (day === 0 || day === 6) { // 0 = Minggu, 6 = Sabtu
      return NextResponse.json(
        { error: 'Hanya bisa memilih hari kerja (Senin-Jumat)' },
        { status: 400 }
      )
    }

    // Validasi 7: Waktu antara 08:00 - 15:00
    if (time < "08:00" || time > "15:00") {
      return NextResponse.json(
        { error: 'Waktu harus antara 08:00 hingga 15:00' },
        { status: 400 }
      )
    }

    // Convert time to minutes for 1-hour buffer validation
    const [hours, minutes] = time.split(':').map(Number)
    const requestedTimeInMinutes = hours * 60 + minutes

    // Validasi 8: Cek ketersediaan slot dengan buffer 1 jam
    const { data: existingBookings, error: queryError } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date)
      .eq('location', location)

    if (queryError) {
      console.error('Supabase query error:', queryError)
      return NextResponse.json(
        { error: 'Gagal memeriksa ketersediaan slot' },
        { status: 500 }
      )
    }

    // Check for time conflicts with 1-hour buffer
    const hasConflict = existingBookings?.some(booking => {
      const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number)
      const bookingTimeInMinutes = bookingHours * 60 + bookingMinutes
      
      return Math.abs(requestedTimeInMinutes - bookingTimeInMinutes) < 60
    })

    if (hasConflict) {
      return NextResponse.json(
        { 
          error: 'Slot waktu tidak tersedia. Minimal 1 jam dari booking sebelumnya',
          available: false 
        },
        { status: 409 }
      )
    }

    // Insert data ke database
    const { data: insertedData, error: insertError } = await supabase
      .from('bookings')
      .insert([{ 
        name, 
        phone,
        age,
        date, 
        time,
        location,
        created_at: new Date().toISOString() 
      }])
      .select()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Gagal menyimpan booking' },
        { status: 500 }
      )
    }

    // Response sukses
    return NextResponse.json({
      success: true,
      booking: insertedData[0],
      message: 'Booking berhasil dibuat'
    }, { status: 201 })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID booking tidak diberikan' },
        { status: 400 }
      )
    }

    // Validasi: Cek apakah booking ada sebelum dihapus
    const { data: existingBooking, error: queryError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (queryError || !existingBooking) {
      return NextResponse.json(
        { error: 'Booking tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hapus booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking berhasil dihapus',
        deleted_booking: existingBooking
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}