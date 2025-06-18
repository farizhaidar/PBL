import { NextRequest, NextResponse } from 'next/server';
import * as mysql from 'mysql2/promise';
import pool from '@/lib/mysqlClient';

function timeToMinutes(time: string): number {
  if (typeof time !== 'string' || !time.includes(':')) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const location = searchParams.get('location') || 'Cabang Depok';

  if (!date) {
    return NextResponse.json({ error: 'Parameter date diperlukan' }, { status: 400 });
  }

  try {
    const connection = await pool.getConnection();
    
    const [bookedSlots] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT time FROM bookings WHERE date = ? AND location = ?',
      [date, location]
    );
    connection.release();

    const bookedTimesInMinutes = bookedSlots.map(slot => timeToMinutes(slot.time));

    const workingHoursStart = 8 * 60;
    const workingHoursEnd = 15 * 60;
    const slotInterval = 60;

    const allSlots: string[] = [];
    for (let time = workingHoursStart; time <= workingHoursEnd; time += slotInterval) {
      const hours = String(Math.floor(time / 60)).padStart(2, '0');
      const minutes = String(time % 60).padStart(2, '0');
      allSlots.push(`${hours}:${minutes}`);
    }

    const availableSlots = allSlots.filter(slot => {
      const slotInMinutes = timeToMinutes(slot);
      return !bookedTimesInMinutes.some(bookedTime => Math.abs(slotInMinutes - bookedTime) < slotInterval);
    });

    return NextResponse.json({ availableSlots }, { status: 200 });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memeriksa ketersediaan jam' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  let connection: mysql.PoolConnection | null = null;
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID booking tidak diberikan' }, { status: 400 });
    }
    connection = await pool.getConnection();
    const [existingBookingRows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );
    const existingBooking = existingBookingRows[0];
    if (!existingBooking) {
      connection.release();
      return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 });
    }
    await connection.query('DELETE FROM bookings WHERE id = ?', [id]);
    connection.release();
    return NextResponse.json(
      {
        success: true,
        message: 'Booking berhasil dihapus',
        deleted_booking: existingBooking,
      },
      { status: 200 }
    );
  } catch (err) {
    if (connection) connection.release();
    console.error('MySQL DELETE Error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat menghapus data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let connection: mysql.PoolConnection | null = null;
  try {
    const requestBody = await request.json();

    if (requestBody.checkDate && Object.keys(requestBody).length === 1) {
      const { checkDate } = requestBody;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(checkDate)) {
        return NextResponse.json({ error: 'Format tanggal tidak valid, harus YYYY-MM-DD' }, { status: 400 });
      }
      connection = await pool.getConnection();
      const [bookedSlots] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT time FROM bookings WHERE date = ?',
        [checkDate]
      );
      connection.release();
      const bookedTimesInMinutes = bookedSlots.map(slot => timeToMinutes(slot.time));
      const workingHoursStart = 8 * 60, workingHoursEnd = 15 * 60, slotInterval = 60;
      const availableSlots: string[] = [];
      for (let time = workingHoursStart; time <= workingHoursEnd; time += slotInterval) {
        const isSlotTaken = bookedTimesInMinutes.some(bookedTime => Math.abs(time - bookedTime) < slotInterval);
        if (!isSlotTaken) {
          const hours = String(Math.floor(time / 60)).padStart(2, '0');
          const minutes = String(time % 60).padStart(2, '0');
          availableSlots.push(`${hours}:${minutes}`);
        }
      }
      return NextResponse.json({ availableSlots }, { status: 200 });
    }

    if (requestBody.date && requestBody.time && requestBody.location && Object.keys(requestBody).length === 3) {
      const { date, time, location } = requestBody;
      connection = await pool.getConnection();
      const [existingBookings] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT time FROM bookings WHERE date = ? AND location = ?',
        [date, location]
      );
      connection.release();
      const requestedTimeInMinutes = timeToMinutes(time);
      const isAvailable = !existingBookings.some(booking => {
        const bookingTimeInMinutes = timeToMinutes(booking.time);
        return Math.abs(requestedTimeInMinutes - bookingTimeInMinutes) < 60;
      });
      return NextResponse.json({ available: isAvailable }, { status: 200 });
    }

    const { name, phone, age, date, time, location } = requestBody;
    if (!name || !phone || !age || !date || !time || !location) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    connection = await pool.getConnection();
    const requestedTimeInMinutes = timeToMinutes(time);
    const [conflictingBookings] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT time FROM bookings WHERE date = ? AND location = ?',
      [date, location]
    );
    const hasConflict = conflictingBookings.some(booking => {
      const bookingTimeInMinutes = timeToMinutes(booking.time);
      return Math.abs(requestedTimeInMinutes - bookingTimeInMinutes) < 60;
    });
    if (hasConflict) {
      connection.release();
      return NextResponse.json(
        { error: 'Slot waktu tidak tersedia. Minimal 1 jam dari booking sebelumnya', available: false },
        { status: 409 }
      );
    }
    const [result] = await connection.query<mysql.OkPacket>(
      'INSERT INTO bookings (name, phone, age, date, time, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, phone, age, date, time, location, new Date()]
    );
    const [newBookingRows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT * FROM bookings WHERE id = ?',
      [result.insertId]
    );
    connection.release();
    const newBooking = newBookingRows[0];
    return NextResponse.json(
      { success: true, booking: newBooking, queueNumber: newBooking.id, message: 'Booking berhasil dibuat' },
      { status: 201 }
    );
  } catch (err) {
    if (connection) connection.release();
    console.error('MySQL POST Error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server saat memproses permintaan' }, { status: 500 });
  }
}