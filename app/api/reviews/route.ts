import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

type Classification = 'positif' | 'netral' | 'negatif';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('classification');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ positif: 0, netral: 0, negatif: 0 });
    }

    const counts: Record<Classification, number> = {
      positif: 0,
      netral: 0,
      negatif: 0,
    };

    data.forEach((review) => {
      const cls = review.classification.toLowerCase() as Classification;
      if (cls in counts) {
        counts[cls]++;
      }
    });

    return NextResponse.json(counts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
