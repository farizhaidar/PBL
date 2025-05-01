import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { date, time } = await request.json()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', date)
    .eq('time', time)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ available: data.length === 0 })
}