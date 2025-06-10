import { NextRequest, NextResponse } from "next/server";

// URL webhook n8n milik temanmu
const N8N_WEBHOOK_URL = "https://n8n.akmalnurwahid.my.id/webhook/booking";

/**
 * Fungsi ini bertindak sebagai proxy.
 * Ia menerima request dari frontend kamu, meneruskannya ke n8n,
 * lalu mengembalikan respons dari n8n kembali ke frontend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await n8nResponse.text();

    if (!responseText) {
      return new NextResponse(null, { status: 204 }); // 204 No Content
    }

    return NextResponse.json(JSON.parse(responseText), {
      status: n8nResponse.status,
    });
    
  } catch (error) {
    console.error("Error in chatbot proxy API:", error);
    return NextResponse.json(
      { error: "Gagal menyambungkan ke layanan chatbot" },
      { status: 500 }
    );
  }
}