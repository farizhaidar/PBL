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

export async function POST(request: Request) {
  try {
    const { name, email, date, time } = await request.json()

    // Validasi 1: Cek data lengkap
    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Validasi 2: Format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Validasi 3: Pastikan date adalah format yang valid
    if (isNaN(new Date(date).getTime())) {
      return NextResponse.json(
        { error: 'Format tanggal tidak valid' },
        { status: 400 }
      )
    }

    // Validasi 4: Waktu booking harus minimal 1 jam dari sekarang
    const now = new Date()
    const bookingDateTime = new Date(`${date}T${time}:00`)
    const minimumBookingTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 jam dari sekarang

    if (bookingDateTime < minimumBookingTime) {
      return NextResponse.json(
        { 
          error: 'Waktu booking harus minimal 1 jam dari sekarang',
          detail: {
            current_time: now.toISOString(),
            minimum_allowed: minimumBookingTime.toISOString()
          }
        },
        { status: 400 }
      )
    }

    // Validasi 5: Cek ketersediaan slot
    const { data: existingBookings, error: queryError } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date)
      .eq('time', time)

    if (queryError) {
      console.error('Supabase query error:', queryError)
      return NextResponse.json(
        { error: 'Gagal memeriksa ketersediaan slot' },
        { status: 500 }
      )
    }

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Slot waktu sudah dipesan' },
        { status: 409 }
      )
    }

    // Insert data ke database
    const { data: insertedData, error: insertError } = await supabase
      .from('bookings')
      .insert([{ 
        name, 
        email, 
        date, 
        time,
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