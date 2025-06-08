import { NextRequest, NextResponse } from 'next/server';

// Helper for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { Age, CustAccountBalance, CustAmount, Occupation } = body;

    // Validasi: field wajib ada (0 boleh)
    if (
      Age === undefined ||
      CustAccountBalance === undefined ||
      CustAmount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields: Age, CustAccountBalance, CustAmount" },
        { status: 400 }
      );
    }

    const age = parseInt(Age);
    const balance = parseFloat(CustAccountBalance);
    const amount = parseFloat(CustAmount);
    const occupation = (Occupation || "").toLowerCase();

    // 🧠 Kriteria "Simpanan Pelajar"
    if (age >= 6 && age <= 17 && occupation === "pelajar" && balance === 0 && amount === 0) {
      return NextResponse.json({
        recommended_product: "Simpanan Pelajar",
        // description: "Tabungan khusus untuk pelajar dengan fitur pendidikan"
      });
    }

    // Payload ke backend hanya 3 input untuk model
    const payloadToBackend = {
      Age: age,
      CustAccountBalance: balance,
      CustAmount: amount
    };

    const backendUrl = 'https://backend.ghavio.my.id/predict';

    try {
      const backendRes = await fetchWithTimeout(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payloadToBackend)
      }, 5000);

      if (!backendRes.ok) {
        let errorData;
        try {
          errorData = await backendRes.json();
        } catch {
          errorData = { message: await backendRes.text() };
        }

        throw new Error(errorData.message || `Backend error ${backendRes.status}`);
      }

      const result = await backendRes.json();

      if (!result.recommended_product) {
        throw new Error("Invalid response structure from backend");
      }

      return NextResponse.json(result);

    } catch (backendError) {
      console.error('Backend error:', backendError);

      return NextResponse.json({
        error: "Failed to get recommendation",
        fallback_used: true,
        message: backendError instanceof Error ? backendError.message : "Unknown error"
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
