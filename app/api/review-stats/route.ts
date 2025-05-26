// app/api/review/route.ts (Next.js 13+ menggunakan route.ts)
import { NextResponse } from 'next/server';

export async function GET() {
  // Simulasi data dummy: 8 positif, 2 negatif
  const positive = 100;
  const negative = 49;
  const total = positive + negative;

  const positivePercentage = (positive / total) * 100;
  const negativePercentage = (negative / total) * 100;

  return NextResponse.json({
    positive,
    negative,
    positivePercentage,
    negativePercentage
  });
}
