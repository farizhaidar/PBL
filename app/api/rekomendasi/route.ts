// app/api/proxy-sentiment/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const backendRes = await fetch('https://backend.ghavio.my.id/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await backendRes.json();
    return NextResponse.json(result, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error', detail: String(error) }, { status: 500 });
  }
}
