import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi sederhana
    if (!body.sentence) {
      return NextResponse.json({ error: 'sentence is required' }, { status: 400 });
    }

    const response = await fetch('https://sentiment.ghavio.my.id/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: body.sentence }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upstream API error:', response.status, errorText);
      return NextResponse.json({ error: 'Upstream API error' }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
